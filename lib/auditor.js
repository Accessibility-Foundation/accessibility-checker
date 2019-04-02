const alfaAct = require('@siteimprove/alfa-act');

const {
  isElement,
  getParentNode,
  getTagName,
  isDocument,
  getOwnerElement,
} = require('./dom.js');

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

function audit(page, rules = []) {
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
      outcome: auditResult.results.length
        ? auditResult.results
          .map((result) => result.outcome)
          .reduce((prev, current) => {
            const isInapplicable = prev === 'inapplicable' || current === 'inapplicable';
            const isFailed = prev === 'failed' || current === 'failed';

            if (isInapplicable) {
              return 'inapplicable';
            }

            if (isFailed) {
              return 'failed';
            }

            return 'passed';
          })
        : 'inapplicable',
    };

    // Sort results by outcome
    if (ruleResult.outcome === 'inapplicable') {
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

        const resultFailed = result.outcome === 'failed';
        const resultPassed = result.outcome === 'passed';
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

    if (ruleResult.outcome === 'passed') {
      auditResults.passed.push(ruleResult);

    } else if (ruleResult.outcome === 'failed') {
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
