const fs = require('fs');
const URL = require('url').URL;

const { audit, isResult, toJson } = require('../auditor.js');
const {
  isElement,
  getParentNode,
  getTagName,
  isDocument,
  getOwnerElement,
} = require('../dom.js');

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

function createAuditReportSummary(results) {
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



module.exports = function validate(url = '', options = {}) {
  var scraper = new Scraper();
  var urlObject = urlize(url);

  // Scrape url
  scraper.scrape(urlObject.href, {timeout: 30000}).then((page) => {
    const report = {
      url: urlObject.href,
      testedRules: options.rules || rules.list(),
      outcome: '',
    };
    const auditResults = {
      passed: [],
      failed: [],
      inapplicable: [],
    };
    const rulesList = options.rules
      ? rules.objects()
        .filter((rule) => {
          return options.rules.indexOf(rule.name) >= 0;
        })
      : rules.objects();

    if (rulesList.length === 1) {
      options.oneRule = true;
    }

    // Validate rules url
    rulesList.forEach((rule) => {

      const auditResult = audit(page, [rule]);
      const ruleResult = {
        rule: rule.name,
        id: rule.id,
        outcome: auditResult.length
          ? auditResult
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

      if (ruleResult.outcome === 'inapplicable') {
        auditResults.inapplicable.push(ruleResult);
        return;
      }

      // Passed or failed => push results
      if (Array.isArray(auditResult)) {

        ruleResult.results = {
          failed: [],
          passed: [],
        };

        auditResult.forEach((result) => {
          const resultFailed = result.outcome === 'failed';
          const resultPassed = result.outcome === 'passed';
          const newResult = {
            rule: result.name,
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


    // Create a report
    report.results = auditResults;

    if (auditResults.inapplicable.length) {
      report.outcome = 'inapplicable';
    } else if (auditResults.failed.length) {
      report.outcome = 'failed';
    } else {
      report.outcome = 'passed';
    }

    if (options.summary) {
      // reporter.write(orig);
    }

    if (options.save) {
      reporter.save(report, {
        output: options.output,
        rule: options.oneRule ? options.rules[0] : false,
        groupname: urlObject.hostname,
        path: urlObject.pathname,
      });
    }

    // Done Close connection to page
    scraper.close();

  }).catch((error) => {
    console.log('Whoopsiedooo...', error);

    // Done Close connection to page
    scraper.close();
  });

}
