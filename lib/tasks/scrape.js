const { Scraper } = require('@siteimprove/alfa-scrape');

const log = require('../util/log.js');

async function scrape(url) {

  const scraper = new Scraper();
  const scrapeResult = {};

  log(`Scrape ${url}`);
  await scraper.scrape(url, {})
    .then((scraped) => {
      Object.assign(scrapeResult, scraped);
      log(`Scrape successfull`);
    })

    .catch((error) => {
      throw error;
    })

    .finally(() => {
      scraper.close();
    });

  return scrapeResult;
}

module.exports = scrape;
