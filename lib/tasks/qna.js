const { default: chalk } = require('chalk');
const prompt = require('prompt-async');

exports.askQuestions = async function askQuestions(Q, page) {
  const newQ = Array.from(Q);
  let answers = [];
  const askQuestions = {
    properties: Object.assign({}, newQ.map(q => {
      const question = createQuestion(q, page);

      return question;
    }))
  };

  prompt.start();

  answers = await prompt.get(askQuestions);

  return newQ.map((q, index) => {
    q.answer = answers[index];
    delete q.rule;
  });
}

function createQuestion(question) {

  const {
    id,
    message,
    target,
    type
  } = question;

  if (!question.id) {
    throw new Error('Question id is required.');
  }

  return {
    id: id,
    type: getType(),
    description: createDescription(),
    before: modifyUserInput(),
  };

  function createDescription() {
    const rawDescription = chalk.white(message || `${id}?`);
    const targetTag = target
      ? chalk.cyan(createTag(target))
      : null;
    const hint = getHint(type);

    return `

    --Question--
      ${targetTag}
      ${rawDescription} ${hint}
    `;
  }

  function createTag(node) {
    if (node.nodeType !== 1) {
      return `[${node.nodeName}]`
    }

    const {
      localName,
      attributes
    } = node;

    const props = attributes.reduce((attrStr, a) => {
      const prop = a.localName;
      const value = a.value;

      return `${attrStr} ${prop}="${value}"`;
    }, '');

    return `<${localName} ${props}>`;
  }

  function getHint(type) {
    switch (type) {
      case 'boolean':
        return '(T)rue or (F)alse';

      case 'node':
        return `
          Open the webpage in a browser,
          inspect the requested element
          and paste its source here.
        `

      default:
        return 'Text input';

    }
  }

  function getType() {
    switch (type) {
      case 'boolean':
        return 'boolean';

      default:
        return 'string';
    }
  }

  function modifyUserInput() {
    switch (type) {
      // case 'node':
      //   return (value) => {
      //     // Transform into Alfa domnode object
      //     return querySelector(page.document, page.document, value);
      //   };

      default:
        return null;
    }
  }
}
