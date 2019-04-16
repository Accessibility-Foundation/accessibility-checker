const { audit } = require('../auditor.js');

const rules = require('../rules.js');
const Scraper = require('../Scraper.js');
const {
  nicedate,
  reporter,
  urlize,
} = require('../util/');

module.exports = async function validate(urls = [], options = {}) {

  const queu = validationQueu(urls);

  function* validationQueu(urlList) {
    var index = 0;
    var urlCount = urlList.length;

    while (index < urlCount) {
      yield urlList[index];
      index++;
    }

    return false;
  }

  let current = queu.next();
  let validated = false;

  while (!current.done) {
    validated = await startValidation(current.value, options);

    if (validated) {
      current = queu.next();
      validated = false;
    }
  }
}

async function startValidation(url, options) {

  console.log(`Starting audit for ${url}`);

  const scraper = new Scraper();
  const urlObject = urlize(url);
  const rulesList = (options.rules.length || options.excludeRules.length)
    ? rules.objects()
      .filter((rule) => {
        const inRulesList = (options.rules.length > 0 && options.rules.indexOf(rule.name) >= 0);
        const inExcludedRulesList = options.excludeRules.indexOf(rule.name) >= 0;

        return inRulesList && !inExcludedRulesList;
      })
    : rules.objects();

  // Scrape url
  console.time('Scrapetime');
  console.time('Pageready');

  await scraper.scrape(urlObject.href, {
    timeout: 30000,
    viewport: {
        width: 800,
        height: 600,
        orientation: 1
    },
  }).then((page) => {
    console.timeEnd('Pageready');

    const {
      request,
      response,
    } = page;

    console.time('Audit');
    const auditResults = audit(page, rulesList, options);
    console.timeEnd('Audit');

    console.time('Report');
    const reporterOptions = {
      header: {
        url: url,
        request: request.url,
        response: response.status,
      },
      output: options.output,
      path: urlObject.hostname + '/' + urlObject.pathname,
    };

    if (options.failed) {
      // Create a failures report
      reporterOptions.filter = 'failed';
    }

    if (options.save) {
      reporterOptions.filename = 'full_report-' + nicedate.filename();
      reporterOptions.header.title = 'Full report';
      reporterOptions.header.rules = rulesList.map((rule) => rule.name);
      reporter.save(auditResults, reporterOptions);
    }

    // Save rules in separate file
    if (options.save && options.splitRules) {
      reporterOptions.header.rules = null;

      // Save passed and failed results in separate reports
      auditResults.passed
        .concat(auditResults.failed)
        .forEach((result) => {
          reporterOptions.header.title = 'Rule report – ' + result.rule;
          reporterOptions.filename = 'rule_report-'
            + result.rule.toLowerCase()
            + '-' + result.outcome.toUpperCase()
            + '-' + nicedate.filename();

          if (options.failed && result.outcome !== 'failed') {
            return;
          }
          reporter.save(result.results, reporterOptions);
        });

      // reporterOptions.header.title = 'Inapplicables report';
      // reporterOptions.filename = 'inapplicables_report-' + nicedate.filename();
      // reporterOptions.header.rules = auditResults.inapplicable.map((result) => result.rule),
      // reporter.save({inapplicable: auditResults.inapplicable}, reporterOptions);
    }
    console.timeEnd('Report');

    // Done Close connection to page
    scraper.close();
    console.timeEnd('Scrapetime');

  }).catch((error) => {
    console.log('Whoopsiedooo...', error);

    // Done Close connection to page
    scraper.close();
    console.timeEnd('Scrapetime');
  });

  return true;
}
