const { Rules: alfaRules } = require('@siteimprove/alfa-wcag');

module.exports = (function() {
  'use strict';

  function Rules() {
    this.rules = alfaRules;
  }

  Rules.prototype.list = function getRuleNames() {
    return Object.keys(this.rules);
  }

  Rules.prototype.objects = function getRuleObjects() {
    const ruleNames = this.list();

    return Object.values(this.rules)
      .map((rule, index) => {
        const newRule = Object.assign({}, rule);

        newRule.name = ruleNames[index];

        return newRule;
      });
  }

  return new Rules();
}());;
