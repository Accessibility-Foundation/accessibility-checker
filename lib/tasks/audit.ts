import * as alfaAct from '@siteimprove/alfa-act';
import { Rules } from '@siteimprove/alfa-rules';

import { askQuestions } from './qna.js';
import { OUTCOME } from '../constants/index.js';

export default async function audit(page) {

  const rules = Object.values(Rules);
  const auditAnswers = [];
  let auditResult = alfaAct.audit(page, rules);
  let cannotTellResults = [...auditResult.results].filter(result => result.outcome === OUTCOME.CANNOT_TELL);

  while (cannotTellResults.length !== 0) {

    await askQuestions(auditResult.questions, page)
      .then((_answers) => {

        _answers.forEach((answer) => {
          auditAnswers.push(answer);
        });
      })

      .catch((error) => {
        throw error;
      });

    auditResult = await alfaAct.audit(page, rules, auditAnswers);
    cannotTellResults = [...auditResult.results].filter(r => r.outcome === OUTCOME.CANNOT_TELL);
  }

  return auditResult;
}