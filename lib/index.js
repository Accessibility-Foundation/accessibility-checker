const audit = require('./tasks/audit.js');
const report = require('./tasks/report.js');
const save = require('./tasks/save.js');
const scrape = require('./tasks/scrape.js');

const log = require('./util/log.js');

async function a11yCheck(urls = []) {
  const checkCount = urls.length;
  const urlList = urls.values();
  let currentUrl = urlList.next();

  log(`Checking ${checkCount} url${checkCount === 1 ? '' : 's'}`);

  while (!currentUrl.done) {
    await checkUrl(currentUrl.value);
    currentUrl = urlList.next();
  }
}

async function checkUrl(url) {

  log(`Check ${url}`);

  // Scrape
  await scrape(url)
    .catch((error) => {
      log(`Scrape Error; ${error}`);
    })

    .then((scraped) => {

      log(`Audit ${url}`);

      const auditResults = audit(scraped);

      log(`Audit succesfull`);

      return auditResults;
    })

    .catch((error) => {
      log(`Audit Error; ${error}`);
    })

    .then((audited) => {

      log(`Report ${url}`);

      const reportResult = report(audited);
      log(reportResult.outcome);

      return reportResult;
    })

    .catch((error) => {
      log(`Report error: ${error}`);
    })

    .then((report) => {
      const reportStr = JSON.stringify(report, null, 4);
      const urlFolder = url.replace(/[^a-zA-Z0-9]+/, '_');
      const saved = save(`./a11y-check/${urlFolder}/report.json`, reportStr);

      if (saved) {
        log(`Saved report to “${saved}”`);
      } else {
        log('Save report failed');
      }

    })

    .catch((error) => {
      log(`Save error: ${error}`);
    });

  log(`Done ${url}`);
}

module.exports = a11yCheck;
