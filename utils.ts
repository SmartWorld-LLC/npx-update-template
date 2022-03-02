import c from 'ansi-colors';

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
 * @return {Promise<any>}
 */
export const exec = async (command: string): Promise<any> => {
  const exec = require('util').promisify(require('child_process').exec);

  const {stdout} = await exec(command).catch((e: any) => {
    throw new Error(c.red.bold(e.message));
  });

  return stdout;
};

