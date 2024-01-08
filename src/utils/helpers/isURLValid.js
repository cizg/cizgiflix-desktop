module.exports = function isURLValid(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};