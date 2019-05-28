const log = require('./util/log.js');

function a11yCheck(urls = []) {
  const checkCount = urls.length;

  log(`Checking ${checkCount} url${checkCount === 1 ? '' : 's'}`);
}

function checkUrl(url) {
  log(url);
}

module.exports = a11yCheck;
