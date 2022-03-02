import c from 'ansi-colors';
import {isValidGitUrl, exec} from './utils';
import {readJson, remove} from 'fs-extra';
import {join} from 'path';
import {Config} from './types';
const TEMPLATE_BRANCH = 'template';

/**
 * @description - main function of this package with update logic
 * @return {Promise<number>} - where 1 is success, and 0 - fail
 */
export const update = async (): Promise<number> => {
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
  const tempDir = `tempDir_${Math.random().toString(32).split('.')[1]}`;
  await exec(`git clone ${URL} ${tempDir}`);

  let config: Config = {};
  try {
    config = await readJson(join('.', tempDir, '.templaterc.json'));
  } catch (error) {
    console.error(
        c.red.bold(`Repo: ${URL}: .templaterc.json config file not found`),
    );
    await remove(tempDir);
    return 0;
  }
  if (isNeedRollback) {
    await exec(`git checkout ${currentBranch}`);
    console.log(c.black.bgGreen(`Change branch to: ${currentBranch}`));
  }
  return 1;
};
