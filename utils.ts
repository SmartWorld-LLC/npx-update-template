import c from 'ansi-colors';
import semver from 'semver';
import {Config, Package} from './types';
import equal from 'deep-equal';
import fg from 'fast-glob';

/**
 * @description - URL check
 * @param {string} url
 * @return {boolean}
 */
export const isValidGitUrl = (url: string): boolean => {
  const regURL =
    /(|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|[-\d\w._]+?)$/i;
  return regURL.test(url);
};

/**
 * @description - function for execute bash command
 * @param {string} command
 * @param {boolean} activateError
 * @return {Promise<any>}
 */
export const exec = async (
    command: string,
    activateError: boolean = true,
): Promise<any> => {
  const exec = require('util').promisify(require('child_process').exec);

  const {stdout} = await exec(command, {maxBuffer: 1024 * 500}).catch(
      (e: any) => {
        if (activateError) {
          throw new Error(c.red.bold(e.message));
        } else {
          return e.stdout;
        }
      },
  );
  return stdout;
};

/**
 * @description -
 * @param {string} valueTemplate
 * @param {string} valueLocale
 * @return {string}
 */
export const compareVersion = (
    valueTemplate: string,
    valueLocale: string,
): string => {
  if (!valueTemplate || valueTemplate === valueLocale) {
    return valueLocale;
  }

  if (!semver.validRange(valueTemplate) && semver.validRange(valueLocale)) {
    return valueTemplate;
  }

  if (!semver.validRange(valueTemplate) || !semver.validRange(valueLocale)) {
    return valueLocale;
  }

  const minExistingVersion = semver.minVersion(valueTemplate);
  const minNewVersion = semver.minVersion(valueLocale);

  if (!minExistingVersion || !minNewVersion) {
    return valueLocale;
  }

  if (minNewVersion.compare(minExistingVersion) > 0) {
    return valueLocale;
  } else {
    return valueTemplate;
  }
};

/**
 * @description - merge first object to second if second doesn't have key
 * @param {Package} o1 - main object
 * @param {Package} o2 - object to sync
 * @param {boolean} isVer - do you need a version check
 * @return {Package}
 */
export const mergeObjectWithoutReplace = (
    o1: Package,
    o2: Package,
    isVer: boolean = false,
): Package => {
  for (const key in o1) {
    if (!o2.hasOwnProperty(key)) {
      o2[key] = o1[key];
    }
    if (o1.hasOwnProperty(key) && o2.hasOwnProperty(key) && isVer) {
      const versionLast = compareVersion(o1[key], o2[key]);
      if (o2.hasOwnProperty(key) && versionLast !== o2[key]) {
        o2[key] = versionLast;
      }
    }
  }
  return o2;
};

/**
 * @description -
 * @param {Package} localePackage
 * @param {Package} templatePackage
 * @param {Config} config
 * @return {Package}
 */
export const applyPackageJson = (
    localePackage: Package,
    templatePackage: Package,
    config: Config,
): Package => {
  if (
    config.npmScripts &&
    !equal(localePackage.scripts, templatePackage.scripts)
  ) {
    localePackage.scripts = mergeObjectWithoutReplace(
        templatePackage.scripts,
        localePackage.scripts,
    );
    console.log(c.black.bgGreen(`Npm scripts sync Success`));
  }
  if (
    config.npmDependencies &&
    !equal(localePackage.dependencies, templatePackage.dependencies)
  ) {
    localePackage.dependencies = mergeObjectWithoutReplace(
        templatePackage.dependencies,
        localePackage.dependencies,
        true,
    );
    console.log(c.black.bgGreen(`Npm dependencies sync Success`));
  }

  return localePackage;
};

/**
 * @description -
 * @param {Config} config
 * @param {String} tempDir
 * @return {{path: string, to: string}[]}
 */
export const syncFiles = async (config: Config, tempDir: string) => {
  console.log(c.black.bgGreen('Start sync files...'));
  const files: {path: string; to: string}[] = [];
  if (config.directories) {
    for (const item of config.directories) {
      const _files = (await fg(`${tempDir}/${item.files}`)).map((file) =>
        file.substring(tempDir.length),
      );
      _files.forEach((_item) => {
        files.push({
          path: _item,
          to: item.to,
        });
      });
    }
  }

  return files;
};
