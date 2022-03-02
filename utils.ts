/**
 * @description - URL check
 * @param {string} url
 * @return {boolean}
 */
export const isValidGitUrl = (url: string): boolean => {
  const regURL =
    /(?|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|[-\d\w._]+?)$/;
  return regURL.test(url);
};
