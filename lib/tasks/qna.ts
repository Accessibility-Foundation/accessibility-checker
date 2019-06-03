import * as act from '@siteimprove/alfa-act';
import * as dom from '@siteimprove/alfa-dom';
import * as xpath from '@siteimprove/alfa-xpath';
import { highlight } from '@siteimprove/alfa-highlight';
import chalk from 'chalk';
import * as inquirer from 'inquirer';

export async function askQuestions(questions: Array<act.Question<any, any>>, page: act.Aspects): Promise<Array<act.Answer<any, any>>> {
  const answers = await inquirer.prompt(
    questions.map(question => {
      return createQuestion(question, page.document);
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

function createQuestion(question: act.Question<any, any>, document: dom.Document): inquirer.Question {
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
        message: getMessage
      }

    case act.QuestionType.Node:
      return {
        name: id,
        type: 'input',
        message: getMessage,
        suffix: chalk.gray(" (XPath)"),
        filter(expression) {
          debugger;

          if (expression === "") {
            return false;
          }

          const targets = [
            ...xpath.evaluate(document, document, expression)
          ];

          if (targets.length === 0) {
            return null;
          }

          return targets[0];
        },
        validate(target) {
          if (target === null) {
            return 'XPath expression did not match any nodes';
          }

          return true;
        },
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
