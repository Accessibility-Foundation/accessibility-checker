function a11yCheck(urls = []) {
  const checkCount = urls.length;
  console.log(`[a11y-check]: Checking ${checkCount} url${checkCount === 1 ? '' : 's'}`);
}

module.exports = a11yCheck;
