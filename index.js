const { readFileSync } = require('fs');

const commander = require('commander');
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const validate = require('./lib/commands/validate.js');

const options = {};
let urls = [];

commander
  .version(pkg.version)
  .usage('<url...>')
  .description('Validate an url or list of urls with @Siteimprove/Alfa')
  .option('-o, --output <path>', 'Define a path to save reports to')
  .option('-r, --rules <rulekey1,rulekey2,...rulekeyn>', 'Pass one or more rule keys as a list to validate.')
  .option('--no-summary', 'Do not create a summary.')
  .option('--no-save', 'Do not save a report')
  .option('-u, --url-list <file>', 'Use a textfile with urls as input');

commander.parse(process.argv);

if (commander.urlList) {
  readFileSync(commander.urlList, 'utf8')
    .split(/\s+/g)
    .forEach((url) => {
      if (url.length > 0) {
        urls.push(url);
      }
    });
} else {
  urls = urls.concat(commander.args);
}

options.output = commander.output;
options.summary = commander.summary;
options.save = commander.save;
options.rules = commander.rules && commander.rules.split(',').map(rule => rule.trim().toUpperCase());

if (urls.length === 0) {
  console.error('Required at least one url');
  process.exit(-1);
}

if (urls.length > 0) {
  urls.forEach((url) => {
    validate(url, options);
  });
}
