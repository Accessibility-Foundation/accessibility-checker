const audit = require('./tasks/audit.js');
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

      const failed = auditResults.results.some((r) => {
        return r.outcome === 'failed';
      });

      const cantTell = auditResults.results.some((r) => {
        return r.outcome === 'cantTell';
      });

      const outcome = failed
        ? 'Failed'
        : cantTell
          ? 'Cannot tell...'
          : 'Passed';

      log(`
        ---
        Audit result for ${url}:
        ${outcome}
        ---
      `);

      return auditResults;
    })

    .catch((error) => {
      log(`Audit Error; ${error}`);
    });

  // Report
  log(`Report ${url}`);

  // Save
  log(`Save report for ${url}`);

  log(`Done ${url}`);
}

module.exports = a11yCheck;
