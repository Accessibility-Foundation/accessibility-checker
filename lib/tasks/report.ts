import { OUTCOME } from '../constants/index.js';

export default function report(audit, page = {}) {
  const newReport = {
    title: 'accessibility check',
    date_created: new Date(),
    outcome: getOutcome(audit.results),
    summary: summarise(audit.results),
    results: audit.results.slice().map(formatResults),
    page,
  };

  newReport.results = orderBy('rule', newReport.results)
    .sort(sortByRule)
    .map((result) => {
      const newResult = {
        rule: result.rule,
        outcome: getOutcome(result.results),
        results: undefined
      };

      if (newResult.outcome !== OUTCOME.INAPPLICABLE) {
        newResult.results = result.results;
      }

      return newResult;
    });

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

function formatResults(result) {
  const newResult = {
    rule: result.rule.id,
    outcome: result.outcome,
    target: result.target,
  };

  return newResult;
}

function orderBy(key, results) {

  const orderedResults = results.reduce((ordered, result) => {

    const value = result[key];
    const newResult = Object.keys(result)
      .reduce((newResult, rKey) => {
        if (rKey !== key) {
          newResult[rKey] = result[rKey];
        }

        return newResult;
      }, {});

    const keyExists = ordered.some(item => item[key] === value);

    if (keyExists) {
      ordered
        .filter(item => item[key] === value)
        .forEach(item => {
          item.results.push(newResult);
        });
    }

    else {
      ordered.push({
        [key]: value,
        results: [newResult],
      });
    }

    return ordered;
  }, []);

  return orderedResults;
}

function sortByRule(a, b) {
  const ruleN = /[0-9]+/g;
  const aN = parseInt(a.rule.match(ruleN)[0], 10);
  const bN = parseInt(b.rule.match(ruleN)[0], 10);

  if (aN > bN) {
    return 1;
  }

  else {
    return -1;
  }
}

function summarise(results) {
  const summaryKeys = Object.values(OUTCOME);
  const summary = { total: 0 };

  summaryKeys.forEach(key => {
    summary[key] = results.filter(r => r.outcome === key).length;
  });

  summary.total = results.length;

  return summary;
}
