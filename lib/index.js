const rules = require('./rules.js');
const Scraper = require('./Scraper.js');
const validate = require('./commands/validate.js');

exports = {
  commands: {
    validate,
  },
  rules,
  Scraper,
};
