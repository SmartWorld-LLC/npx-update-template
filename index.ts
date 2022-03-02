import c from 'ansi-colors';
import {isValidGitUrl} from './utils';

/**
 * @description - main function of this package with update logic
 * @return {Promise<number>} - where 1 is success, and 0 - fail
 */
export const update = async (): Promise<number> => {
  const URL = process.argv.slice(2)[0];
  if (!URL) {
    console.error(c.red.bold(`Argument URL not found`));
    return 0;
  }
  if (!isValidGitUrl(URL)) {
    console.error(c.red.bold(`URL is not valid`));
    return 0;
  }
  return 1;
};


