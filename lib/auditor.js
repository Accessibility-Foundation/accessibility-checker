const alfaAct = require('@siteimprove/alfa-act');

const {
  isElement,
  getParentNode,
  getTagName,
  isDocument,
  getOwnerElement,
} = require('./dom.js');

const OUTCOME = {
  INAPPLICABLE: 'inapplicable',
  PASSED: 'passed',
  FAILED: 'failed',
  CANNOT_TELL: 'cantTell',
};

function getPath(target, context) {
    if ("nodeType" in target) {
        const node = target;
        if (isElement(node)) {
            const parentNode = getParentNode(node, context);
            const tagName = getTagName(node, context);
            if (parentNode !== null) {
                const { childNodes } = parentNode;
                for (let i = 0, j = 1, n = childNodes.length; i < n; i++) {
                    const childNode = childNodes[i];
                    if (childNode === node) {
                        return `${getPath(parentNode, context)}/${tagName}[${j}]`;
                    }
                    if (isElement(childNode) &&
                        getTagName(childNode, context) === tagName) {
                        j++;
                    }
                }
            }
        }
        if (isDocument(node)) {
            return "/";
        }
    }
    else {
        const attribute = target;
        const owner = getOwnerElement(attribute, context);
        if (owner !== null) {
            let qualifiedName;
            if (attribute.prefix === null) {
                qualifiedName = attribute.localName;
            }
            else {
                qualifiedName = `${attribute.prefix}:${attribute.localName}`;
            }
            return `${getPath(owner, context)}/@${qualifiedName}`;
        }
    }
    return "";
}

function getRuleOutcome(results) {
  if (results.length === 0) {
    return OUTCOME.INAPPLICABLE;
  }

  if (results.some(r => r.outcome === OUTCOME.FAILED)) {
    return OUTCOME.FAILED;
  }

  if (results.some(r => r.outcome === OUTCOME.CANNOT_TELL)) {
    return OUTCOME.CANNOT_TELL;
  }

  return OUTCOME.PASSED;
}

function audit(page, rules = [], options = {}) {
  const {
    questionsAsked,
  } = options;

  const auditResults = {
    passed: [],
    failed: [],
    inapplicable: [],
  };

  rules.forEach((rule) => {

    console.time('Alfa audit rule ' + rule.name);
    const auditResult = alfaAct.audit(page, [rule]);
    console.timeEnd('Alfa audit rule ' + rule.name);

    const ruleResult = {
      rule: rule.name,
      id: rule.id,
      outcome: getRuleOutcome(auditResult.results),
    };

    // Sort results by outcome
    if (ruleResult.outcome === OUTCOME.INAPPLICABLE) {
      auditResults.inapplicable.push(ruleResult);
      return;
    }

    // Passed or failed => push results
    if (Array.isArray(auditResult.results)) {

      ruleResult.results = {
        failed: [],
        passed: [],
      };

      auditResult.results.forEach((result) => {

        const resultFailed = result.outcome === OUTCOME.FAILED;
        const resultPassed = result.outcome === OUTCOME.PASSED;
        const newResult = {
          rule: result.rule,
          id: result.id,
        };

        // Add a pointer
        if (result.target) {
          newResult.target = {
            nodeName: result.target.localName || undefined,
            attributes: result.target.attributes,
            childNodes: result.target.nodeType === 1 ? result.target.childNodes : undefined,
            pointer: getPath(result.target, page.document),
          };
        }

        // Push result to failed or passed
        if (resultFailed) {
          ruleResult.results.failed.push(newResult);

        } else if (resultPassed) {
          ruleResult.results.passed.push(newResult);
        }
      });
    }

    if (ruleResult.outcome === OUTCOME.PASSED) {
      auditResults.passed.push(ruleResult);

    } else if (ruleResult.outcome === OUTCOME.FAILED) {
      auditResults.failed.push(ruleResult);
    }
  });

  return auditResults;
}


module.exports = (function() {
  'use strict';
  return {
    audit,
  };
}());
