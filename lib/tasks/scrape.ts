import { Scraper } from '@siteimprove/alfa-scrape';

import log from '../util/log.js';

export default async function scrape(url) {
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
