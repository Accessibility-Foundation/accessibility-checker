import * as act from '@siteimprove/alfa-act';
import * as dom from '@siteimprove/alfa-dom';

export default function report(audit, page: act.Aspects) {

  const {
    request: { url },
    document
  } = page;

  const newReport = {
    title: 'accessibility check report',
    url,
    created: new Date(),
    outcome: getOutcome(audit.results),
    summary: summarise(audit.results),
    results: audit.results.slice().map(result => {
      return formatResult(result, document);
    })
  };

  newReport.results = orderBy('rule', newReport.results)
    .sort(sortByRule)
    .map((result) => {
      const newResult = {
        rule: result.rule,
        outcome: getOutcome(result.results),
        results: undefined
      };

      if (newResult.outcome !== act.Outcome.Inapplicable) {
        newResult.results = result.results;
      }

      return newResult;
    });

  return newReport;
}

function getOutcome(results: Array<act.Result<any, any>>): act.Outcome {
  if (results.some(r => r.outcome === act.Outcome.Failed)) {
    return act.Outcome.Failed;
  }

  else if (results.some(r => r.outcome === act.Outcome.CantTell)) {
    return act.Outcome.CantTell;
  }

  else if (results.some(r => r.outcome === act.Outcome.Passed)) {
    return act.Outcome.Passed;
  }

  return act.Outcome.Inapplicable;
}

function formatResult(result, document) {
  const {
    outcome,
    rule,
    target
  } = result;

  const newResult = {
    rule: rule.id,
    outcome: outcome.toString(),
    target: {
      xpath: getXpath(target, document),
      markup: target
        ? dom.serialize(target, target)
        : undefined,
    },
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
  const outcomes = [
    act.Outcome.Passed,
    act.Outcome.Failed,
    act.Outcome.Inapplicable,
    act.Outcome.CantTell,
  ];

  const summary = { total: 0 };

  outcomes.forEach(outcome => {
    summary[outcome] = results.filter(r => r.outcome === outcome).length;
  });

  summary.total = results.length;

  return summary;
}

function getXpath(target, context) {

    if (target && "nodeType" in target) {
        const node = target;
        if (dom.isElement(node)) {
            const parentNode = dom.getParentNode(node, context);
            const tagName = dom.getTagName(node, context);
            if (parentNode !== null) {
                const { childNodes } = parentNode;
                for (let i = 0, j = 1, n = childNodes.length; i < n; i++) {
                    const childNode = childNodes[i];
                    if (childNode === node) {
                        return `${getXpath(parentNode, context)}/${tagName}[${j}]`;
                    }
                    if (dom.isElement(childNode) &&
                        dom.getTagName(childNode, context) === tagName) {
                        j++;
                    }
                }
            }
        }
        if (dom.isDocument(node)) {
            return "/";
        }
    }
    else if (target) {
        const attribute = target;
        const owner = dom.getOwnerElement(attribute, context);
        if (owner !== null) {
            let qualifiedName;
            if (attribute.prefix === null) {
                qualifiedName = attribute.localName;
            }
            else {
                qualifiedName = `${attribute.prefix}:${attribute.localName}`;
            }
            return `${getXpath(owner, context)}/@${qualifiedName}`;
        }
    }
    return "";
}
