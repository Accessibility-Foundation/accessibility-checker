const auditor = require('../lib/auditor.js');
const rules = require('../lib/rules.js');

const ANSWERS = [];
const RULES = rules.objects();

// auditor.audit({}, RULES, ANSWERS);
/*
 * Question format
 *
 */
const QUESTIONS = RULES.map(r => {
  // console.log(JSON.stringify(r, null, 4));
  console.log(r.id, r.evaluate.toString());
  const regexp = /(question)\(((")?([a-zA-Z-]+)(")?(,\s*)?)+\)/g;
  const evaluateString = r.evaluate.toString();
  const question = {
    type: r,
    id: r,
    rule: r,
    aspect: r,
    target: r,
  };

  if (r.message) {
    question.message = r.message;
  }

  return question;
});

console.log(QUESTIONS.length);
