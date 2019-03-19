const {
  existsSync,
  mkdirSync,
  writeFileSync
} = require('fs');
const path = require('path');

const nicedate = require('./nicedate.js');

module.exports = (function() {
  'use strict';

  const reporter = {
    write: writeReport,
    save: saveReport,
  };

  function prettyJSON(jsonObj) {
    return JSON.stringify(jsonObj, null, 4);
  }

  function toActFormat(report = {}, options = {}) {
    const actReport = {
      date: report.date,
    };

    actReport.applicability = [];
    actReport.expectations = []; // List of tested rules
    actReport.outcome = 'passed' || 'failed'; // Sum outcome of all expectations
    actReport.results = {
      failed: [],
      passed: [],
      inapplicable: [],
    };

    return actReport;
  }

  function createReportSummary(results) {
    const summary = {};

    function getPercentage(part = 0, total = 0) {
      return `${Math.round((part / total) * 100)}%`;
    }

    // Passed results
    summary.passed = {};
    summary.passed.count = results.passed && results.passed.length || 0;

    // Failed results
    summary.failed = {};
    summary.failed.count = results.failed && results.failed.length || 0;

    // Inapplicable results
    if (results.inapplicable) {
      summary.inapplicable = {};
      summary.inapplicable.count = results.inapplicable.length;
    }

    // Totals
    summary.total = {};
    summary.total.count = 0
      + summary.passed.count
      + summary.failed.count
      + (results.inapplicable ? summary.inapplicable.count : 0);

    summary.total.percentage = '100%';

    // Calculate percentages
    summary.passed.percentage = getPercentage(
      summary.passed.count,
      summary.total.count
    );

    summary.failed.percentage = getPercentage(
      summary.failed.count,
      summary.total.count
    );

    if (results.inapplicable) {
      summary.inapplicable.percentage = getPercentage(
        summary.inapplicable.count,
        summary.total.count
      );
    }

    // Set outcome; passed is no failures or inapplicable
    if (summary.failed.count) {
      summary.outcome = 'failed'
    } else {
      summary.outcome = 'passed'
    }

    return summary;
  }

  function filter(results, filter) {

    if (results[filter] !== undefined) {
      return {[filter]: results[filter]};
    }

    return results;
  }

  function writeReport(report = {}, options = {}) {

    // @TODO: Write a nice summary
    // With Failures, successfull and inapplicable rules
    const reportString = prettyJSON(report);
    const { format } = options;

    console.log(`Format: ${format}`);
    console.log('Write the report');
    console.log(reportString);
  }

  /**
   * Save audit results into a json file
   * @param  {Object} results        Results report is based upon
   * @param  {Object} [options={}]  Options object to pass to reporter save function
   * @param  {Object} [options.header] – Report heading info like date, title, any except results (will be overwritten)
   * @param  {string} [options.path] - Path to save report file to
   *
   * @return {Object} prettyReport – stringyfied report
   */
  function saveReport(results = {}, options = {}) {

    const saveOptions = {
      filename: options.filename || 'full_report-' + nicedate.filename(),
      filter: options.filter || undefined,
      outdir: options.output || path.resolve('.', 'alfa-reports'),
      path: options.path && options.path.replace(/^\//g, '') || '',
      reportHeader: options.header || {},
    };
    const report = Object.assign({}, saveOptions.reportHeader);

    // Create a nice report; assemble
    const summarizedResults = Object.assign({
      summary: createReportSummary(results)
    }, filter(results, saveOptions.filter));
    const prettyReport = prettyJSON(Object.assign(report, {
      results: summarizedResults,
    }));

    // Create the reportfile path
    const reportPath = path.resolve(saveOptions.outdir, saveOptions.path);
    const filename = saveOptions.filename + '.json';
    const filePath = path.resolve(reportPath, filename);

    // Check path and create dirs if needed
    if (!existsSync(reportPath)) {
      // @TODO: Rewrite with reducer; no unused vars
      reportPath.split(path.sep).forEach((step, index) => {
        const steps = reportPath.split(path.sep).slice(0, index + 1).join(path.sep);
        const resolvePath = path.resolve(steps);

        if (!existsSync(resolvePath)) {
          mkdirSync(resolvePath);
        }
      });
    }

    writeFileSync(filePath, prettyReport, 'utf8');
    console.log(`Saved the report to [${filePath}]`);

    return prettyReport;
  }

  return reporter;
}());;
