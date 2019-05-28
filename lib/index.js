const log = require('./util/log.js');

function a11yCheck(urls = []) {
  const checkCount = urls.length;
  const urlList = urls.values();
  let currentUrl = urlList.next();

  log(`Checking ${checkCount} url${checkCount === 1 ? '' : 's'}`);

  while (!currentUrl.done) {
    checkUrl(currentUrl.value);
    currentUrl = urlList.next();
  }
}

function checkUrl(url) {
  log(url);
}

module.exports = a11yCheck;
