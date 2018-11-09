const {
  mkdirSync,
  statSync,
  writeFileSync
} = require('fs');
const path = require('path');

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

  function saveReport(report = {}, options = {
    outdir: '.',
    reportname: 'report',
  }) {
    const saveOptions = {
      outdir: options.output || '.',
      reportname: options.reportname || 'report',
      groupname: options.groupname || '',
    };
    const prettyReport = prettyJSON(report);
    const reportDir = path.resolve(saveOptions.outdir, 'alfa-reports', saveOptions.groupname);
    const filename = saveOptions.reportname + '_' + Date.now() + '.json' ;
    const filePath = path.resolve(reportDir, filename);
    console.log(`Save the report to [${filePath}]`);

    try {
      writeFileSync(filePath, prettyReport, 'utf8');

    } catch (error) {
      mkdirSync(
        reportDir,
        {
          recursive: true,
        }
      );
      writeFileSync(filePath, prettyReport, 'utf8');
    }
  }

  return reporter;
}());;
