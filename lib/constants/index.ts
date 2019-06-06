import { Rules } from '@siteimprove/alfa-rules';

function getAllRules() {
  return Object.keys(Rules)
    .map(ruleName => {
      const rule = Rules[ruleName];

      return {
        name: ruleName,
        ...rule
      };
    });
}

function getRules(ruleRequest) {
  const rules = getAllRules();

  return rules
    .filter(rule => ruleRequest.indexOf(rule.name) >= 0);
}

function excludeRules(ruleRequest) {
  const rules = getAllRules();

  return rules
    .filter((rule) => ruleRequest.indexOf(rule.name) === -1);
}

export default {
  all: getAllRules,
  get: getRules,
  exclude: excludeRules,
}
