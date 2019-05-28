const { OUTCOME } = require('../constants/');

function report(audit, page) {

  const newReport = {
    title: 'accessibility check',
    date_created: new Date(),
    outcome: getOutcome(audit.results),
    summary: {},
    results: audit.results.slice(),
    page: page || {},
  };

  return newReport;
}

function getOutcome(results) {
  if (results.some(r => r.outcome === OUTCOME.FAILED)) {
    return OUTCOME.FAILED;
  }

  else if (results.some(r => r.outcome === OUTCOME.CANNOT_TELL)) {
    return OUTCOME.CANNOT_TELL;
  }

  else if (results.some(r => r.outcome === OUTCOME.PASSED)) {
    return OUTCOME.PASSED;
  }

  return OUTCOME.INAPPLICABLE;
}

module.exports = report;
