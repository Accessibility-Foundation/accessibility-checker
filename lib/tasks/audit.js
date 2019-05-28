const alfaAct = require('@siteimprove/alfa-act');
const { Rules } = require('@siteimprove/alfa-wcag');


function audit(page) {

  const auditResult = alfaAct.audit(page, Object.values(Rules));

  return auditResult;
}

module.exports = audit;
