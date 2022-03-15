import c from 'ansi-colors';
import {
  isValidGitUrl,
  exec,
  applyPackageJson,
  syncFiles,
  gitHelper,
} from './utils';
import {copyFile, ensureFile, readJson, remove, writeFile} from 'fs-extra';
import {join} from 'path';
import {Config, Package} from './types';
import equal from 'deep-equal';
const TEMPLATE_BRANCH = 'template';
const git = new gitHelper();

/**
 * @description - main function of this package with update logic
 * @return {Promise<number>} - where 1 is success, and 0 - fail
 */
export const update = async (): Promise<number> => {
  /** check on need rollback to origin branch */
  let isNeedRollback = false;
  console.log(c.blue.bgBlackBright('PACKAGE UPDATE BY SMARTWORLD.TEAM'));
  const URL = process.argv.slice(2)[0];
  if (!URL) {
    console.error(c.red.bold(`Argument URL not found`));
    return 0;
  }
  if (!isValidGitUrl(URL)) {
    console.error(c.red.bold(`Git URL is not valid`));
    return 0;
  }
  console.log(c.black.bgGreen('Git URL is valid'));
  let currentBranch: Readonly<string> = await exec(
      'git rev-parse --abbrev-ref HEAD',
  );
  currentBranch = currentBranch.replace(/(\r\n|\n|\r)/gm, '');
  if (!currentBranch) {
    console.error(c.red.bold(`No git registered along this path`));
    return 0;
  }
  console.log(c.black.bgGreen(`You branch: ${currentBranch}`));
  /** change branch to template if current !== template */
  if (currentBranch !== TEMPLATE_BRANCH) {
    isNeedRollback = true;
    const createBranch = await exec(
        `git checkout -b ${TEMPLATE_BRANCH}`,
        false,
    );
    if (!createBranch) {
      await exec(`git checkout ${TEMPLATE_BRANCH}`);
    } else {
      console.log(c.black.bgGreen(`Create new branch: ${TEMPLATE_BRANCH}`));
    }
    console.log(c.black.bgGreen(`Change branch to: ${TEMPLATE_BRANCH}`));
  }
  /** create name for temp dir  */
  const tempDir = `tempDir_${Math.random().toString(32).split('.')[1]}`;
  await exec(`git clone ${URL} ${tempDir}`);

  let config: Config = {
    packageFile: '/',
  };

  try {
    config = await readJson(join('.', tempDir, '.templaterc.json'));
  } catch (error) {
    console.error(
        c.red.bold(`Repo: ${URL}: .templaterc.json config file not found`),
    );
    await remove(tempDir);
    return 0;
  }
  const localPackageJson: Package = await readJson(join('.', 'package.json'));
  const templatePackageJson = await readJson(
      join(tempDir, config.packageFile, 'package.json'),
  );
  let workingPackageJson: Package = JSON.parse(
      JSON.stringify(localPackageJson),
  );

  workingPackageJson = applyPackageJson(
      workingPackageJson,
      templatePackageJson,
      config,
  );

  /** If there is a difference in package json -> change and commit + push */
  if (!equal(workingPackageJson, localPackageJson)) {
    await writeFile(
        join('.', 'package.json'),
        JSON.stringify(workingPackageJson, null, 2) + '\n',
    );
    await git.add(`${join('.', 'package.json')}`);
    const gitCommit = git.commit('Update packageJson');
    if (!gitCommit) {
      console.log(c.black.bgGreen('PackageJson no change'));
    } else {
      await git.push();
      console.log(c.black.bgGreen('Pushed update package.json'));
    }
  }

  /** If needed to replace files */
  if (config.directories && config.directories.length > 0) {
    const files = await syncFiles(config, tempDir);

    for await (const file of files) {
      /** if needed removing template name dir from path file */
      if (config.templateDir) {
        file.localePath = file.path.replace(config.templateDir, '');
      } else {
        file.localePath = file.path;
      }
      await ensureFile(join('.', file.localePath));
      const dest = join('.', file.path);
      const destLocale = join('.', file.localePath);
      await copyFile(join('.', tempDir, file.path), destLocale);
      console.log(c.bold.blue(`  Copying: ${dest} to ${destLocale}`));
      await git.add(`${destLocale}`);
    }

    const gitCommit = await git.commit('Update template');
    if (!gitCommit) {
      console.log(c.black.bgGreen('Files no change'));
    } else {
      await git.push();
      console.log(c.black.bgGreen('Git push sync files'));
    }
  }

  await remove(tempDir);

  if (isNeedRollback) {
    await exec(`git checkout ${currentBranch}`);
    console.log(c.black.bgGreen(`Change branch to: ${currentBranch}`));
  }

  return 1;
};
