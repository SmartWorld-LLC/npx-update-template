import c from 'ansi-colors';
import {isValidGitUrl, exec} from './utils';

/**
 * @description - main function of this package with update logic
 * @return {Promise<number>} - where 1 is success, and 0 - fail
 */
export const update = async (): Promise<number> => {
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
  console.log(c.black.bgGreen('Git URL IS VALID'));
  const currentBranch: Readonly<string> = await exec(
      'git rev-parse --abbrev-ref HEAD',
  );
  console.log(c.black.bgGreen(`YOU BRANCH: ${currentBranch}`));

  return 1;
};
