const fs = require('fs');
const URL = require('url').URL;

const { audit, isResult, toJson } = require('../auditor.js');
const dom = require('../dom.js');
const rules = require('../rules.js');
const Scraper = require('../Scraper.js');
const { nicedate, reporter } = require('../util/');

function urlize(url) {
  const PROTOCOL = /(http|https)(\:\/\/)/g;
  const PATH = /\/{1}[^?#]*/g;

  const urlProtocol = url.match(PROTOCOL)
    ? url.match(PROTOCOL)[0]
    : 'https://';

  const urlHost = url
    .replace(PROTOCOL, '')
    .replace(PATH, '');

  const urlBase = urlProtocol + urlHost;

  const urlPath = url.replace(PROTOCOL, '').match(PATH)
    ? url.replace(PROTOCOL, '').match(PATH)[0]
    : '/';

  return new URL(urlPath, urlBase);
}

function createAuditReport(results = []) {
  const report = {
    title: 'Report',
    url: 'href',
    date: new Date(),
    summary: {
      total: {
        count: results.length || 0,
        percentage: '100%',
      },
    },
  };

  function getPercentage(part = 0, total = 0) {
    return `${Math.round((part / total) * 100)}%`;
  }

  // Passed results
  report.summary.passed = {};
  report.summary.passed.count = results.filter((result) => {
    return result.outcome === 'passed';
  }).length || 0;
  report.summary.passed.percentage = getPercentage(
    report.summary.passed.count,
    report.summary.total.count
  );

  // Failed results
  report.summary.failed = {};
  report.summary.failed.count = results.filter((result) => {
    return result.outcome === 'failed';
  }).length || 0;
  report.summary.failed.percentage = getPercentage(
    report.summary.failed.count,
    report.summary.total.count
  );

  // Inapplicable results
  report.summary.inapplicable = {};
  report.summary.inapplicable.count = results.filter((result) => {
    return result.outcome === 'inapplicable';
  }).length || 0;
  report.summary.inapplicable.percentage = getPercentage(
    report.summary.inapplicable.count,
    report.summary.total.count
  );

  return report;
}


module.exports = function validate(url = '', options = {}) {
  let report = {};
  var scraper = new Scraper();
  var urlObject = urlize(url);

  console.log(`Validate ${urlObject.href}`);

  // Scrape url
  scraper.scrape(urlObject.href).then(async (page) => {
    let auditResults = [];
    const rulesList = Object.values(rules);

    // Validate rules url
    auditResults = await audit(page, rulesList);

    // Create a report
    report = createAuditReport(auditResults);
    report.url = urlObject.href;
    report.results = toJson(rulesList, auditResults, page);

    if (options.summary) {
      reporter.write(report.summary);
    }

    if (options.save) {
      reporter.save(report, {
        groupname: urlObject.hostname,
      });
    }

    // Done Close connection to page
    scraper.close();

  }).catch((error) => {
    console.log('Whoopsiedooo...', error.message);

    // Done Close connection to page
    scraper.close();
  });

}
