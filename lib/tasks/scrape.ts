import * as act from '@siteimprove/alfa-act';
import { Scraper } from '@siteimprove/alfa-scrape';

import log from '../util/log.js';

export default async function scrape(url: string): Promise<act.Aspects> {
  const scraper = new Scraper();

  log(`Scrape ${url}`);

  try {
    const result = await scraper.scrape(url, {
      viewport: {
        width: 800,
        height: 600,
      },
      timeout: 30000,
    });
    log(`Scrape successfull`);
    return result;
  } catch (error) {
  } finally {
    scraper.close();
  }
}
