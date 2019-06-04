import audit from './tasks/audit.js';
import report from './tasks/report.js';
import save from './tasks/save.js';
import scrape from './tasks/scrape.js';

import log from './util/log.js';

export default async function a11yCheck(urls = []) {
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

    .then(async (scraped) => {

      if (!scraped) {
        log(`Skip audit nothing scraped`);
        return null;
      }

      log(`Audit ${url}`);

      const auditResults = await audit(scraped)
        .then((audited) => {
          log(`Audit succesfull`);

          return audited;
        })

        .catch((error) => {
          log(`Audit Error; ${error}`);
        });

      return auditResults;
    })

    .catch((error) => {
      log(`Audit Error; ${error}`);
    })

    .then((audited) => {

      if (!audited) {
        log('Skip report; nothing audited.');
        return null;
      }

      log(`Report ${url}`);

      const reportResult = report(audited);
      log(reportResult.outcome);

      return reportResult;
    })

    .catch((error) => {
      log(`Report error: ${error}`);
    })

    .then((report) => {

      if (!report) {
        log('Skip save report; there is no report');
        return null;
      }

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
