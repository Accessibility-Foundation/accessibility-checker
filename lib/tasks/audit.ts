import * as act from '@siteimprove/alfa-act';

import { askQuestions } from './qna.js';

export default async function audit(page: act.Aspects, rules) {

  const auditAnswers = [];
  let auditResult = act.audit(page, rules);
  let cannotTellResults = [...auditResult.results].filter(result => result.outcome === act.Outcome.CantTell);

  while (cannotTellResults.length !== 0) {

    await askQuestions([...auditResult.questions], page)
      .then((answers) => {

        answers.forEach((answer) => {
          auditAnswers.push(answer);
        });
      })

      .catch((error) => {
        throw error;
      });

    auditResult = await act.audit(page, rules, auditAnswers);
    cannotTellResults = [...auditResult.results].filter(r => r.outcome === act.Outcome.CantTell);
  }

  return Object.assign({answers: auditAnswers.slice()}, auditResult);
}
