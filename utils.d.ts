import {Config, Package} from './types';
/**
 * @description - URL check
 * @param {string} url
 * @return {boolean}
 */
export declare const isValidGitUrl: (url: string) => boolean;
/**
 * @description - function for execute bash command
 * @param {string} command
 * @param {boolean} activateError
 * @return {Promise<any>}
 */
export declare const exec: (command: string, activateError?: boolean) => Promise<any>;
/**
 * @description - compare locale dev version and template
 * @param {string} valueTemplate
 * @param {string} valueLocale
 * @return {string}
 */
export declare const compareVersion: (valueTemplate: string, valueLocale: string) => string;
/**
 * @description - merge first object to second if second doesn't have key
 * @param {Package} o1 - main object
 * @param {Package} o2 - object to sync
 * @param {boolean} isVer - do you need a version check
 * @return {Package}
 */
export declare const mergeObjectWithoutReplace: (o1: Package, o2: Package, isVer?: boolean) => Package;
/**
 * @description - Compare and replace desired objects
 * @param {Package} localePackage
 * @param {Package} templatePackage
 * @param {Config} config
 * @return {Package}
 */
export declare const applyPackageJson: (localePackage: Package, templatePackage: Package, config: Config) => Package;
/**
 * @description - sync files from template to project
 * @param {Config} config
 * @param {String} tempDir
 * @return {{path: string, to: string}[]}
 */
export declare const syncFiles: (config: Config, tempDir: string) => Promise<{
    localePath?: string | undefined;
    path: string;
    to: string;
}[]>;
/**
 * @description - Git helper
 */
export declare class gitHelper {
  /**
     * @description - command for git add
     * @param {string} file
     */
  add: (file: string) => Promise<any>;
  /**
     * @description - command for git commit
     * @param {string} message
     */
  commit: (message: string) => Promise<any>;
  /**
     * @description - command for git push
     */
  push: () => Promise<any>;
}
