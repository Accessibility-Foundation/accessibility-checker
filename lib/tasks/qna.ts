import * as act from '@siteimprove/alfa-act';
import * as dom from '@siteimprove/alfa-dom';
import { highlight } from '@siteimprove/alfa-highlight';
import * as inquirer from 'inquirer';

export async function askQuestions(questions: Array<act.Question<any, any>>, page: act.Aspects): Promise<Array<act.Answer<any, any>>> {
  const answers = await inquirer.prompt(
    questions.map(q => {
      return createQuestion(q);
    })
  );

  return questions.map(question => {
    let answer: act.Answer<any, any>;

    if (question.scope === act.QuestionScope.Global) {
      const { type, id, aspect, target } = question;

      answer = {
        type,
        id,
        aspect,
        target,
        answer: answers[question.id],
      };
    } else {
      const { type, id, rule, aspect, target } = question;

      answer = {
        type,
        id,
        rule,
        aspect,
        target,
        answer: answers[question.id],
      };
    }

    return answer;
  });
}

function createQuestion(question): inquirer.Question {
  const {
    id,
    message,
    target,
    type
  } = question;

  switch (type) {
    case act.QuestionType.Boolean:
      return {
        name: id,
        type: 'confirm',
        message: getMessage()
      }

    default:
      return {
        name: id,
        type: 'input',
        message: getMessage()
      }
  }

  function getMessage() {
    const description = message || `${id}?`;

    const markup = target
      ? highlight('html', dom.serialize(target, target))
      : null;

    return `${markup}\n${description}`;
  }
}
