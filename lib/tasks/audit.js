const alfaAct = require('@siteimprove/alfa-act');
const { Rules } = require('@siteimprove/alfa-wcag');

const { askQuestions } = require('./qna.js');
const { OUTCOME } = require('../constants/');


async function audit(page) {

  const rules = Object.values(Rules);
  const auditAnswers = [];
  let auditResult = alfaAct.audit(page, rules);
  let cannotTellResults = auditResult.results.filter(result => result.outcome === OUTCOME.CANNOT_TELL);

  while (cannotTellResults.length) {

    await askQuestions(auditResult.questions, page)
      .then((_answers) => {

        auditAnswers.push(_answers.slice());
      })

      .catch((error) => {
        throw error;
      });

    auditResult = await alfaAct.audit(page, rules, auditAnswers);
    cannotTellResults = auditResult.results.filter(r => r.outcome === OUTCOME.CANNOT_TELL);
  }

  return auditResult;
}

module.exports = audit;
