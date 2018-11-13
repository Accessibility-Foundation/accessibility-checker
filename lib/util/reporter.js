const {
  existsSync,
  mkdirSync,
  statSync,
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

  function prettyJSON(json = {}) {
    return JSON.stringify(json, null, 4);
  }

  function writeReport(report = {}, options = {}) {
    const reportString = prettyJSON(report);

    console.log('Write the report');
    console.log(reportString);
  }

  function saveReport(report = {}, options = {}) {
    const saveOptions = {
      outdir: options.output || '.',
      reportname: options.reportname || 'report',
      rule: options.rule,
      groupname: options.groupname || '',
      path: options.path.replace(/^\//g, '') || '',
    };
    const prettyReport = prettyJSON(report);
    const alfaReportsDir = path.resolve(saveOptions.outdir, 'alfa-reports');
    const reportDir = path.resolve(alfaReportsDir, saveOptions.groupname);
    const reportPath = path.resolve(reportDir, saveOptions.path);
    const rulename = saveOptions.rule ? '-rule-' + saveOptions.rule : '';
    const filename = saveOptions.reportname
      + rulename
      + '_' + nicedate.filename() + '.json';
    const filePath = path.resolve(reportPath, filename);

    console.log(`Save the report to [${filePath}]`);

    if (saveOptions.outdir && !existsSync(saveOptions.outdir)) {
      mkdirSync(saveOptions.outdir);
    }

    if (!existsSync(alfaReportsDir)) {
      mkdirSync(alfaReportsDir);
    }

    if (!existsSync(reportDir)) {
      mkdirSync(reportDir);
    }

    if (saveOptions.path.length > 0 && !existsSync(reportPath)) {
      saveOptions.path.split(path.sep).forEach((step, index) => {
        const steps = saveOptions.path.split(path.sep).slice(0, index + 1).join(path.sep);
        const resolvePath = path.resolve(reportDir, steps);

        if (!existsSync(resolvePath)) {
          mkdirSync(resolvePath);
        }
      })
    }

    writeFileSync(filePath, prettyReport, 'utf8');
  }

  return reporter;
}());;
