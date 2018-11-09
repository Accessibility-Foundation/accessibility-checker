const fs = require('fs');

const commander = require('commander');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const validate = require('./lib/commands/validate.js');

const options = {};

commander
  .version(pkg.version)
  .usage('<url...>')
  .description('Validate an url or list of urls with @Siteimprove/Alfa')
  .option('-o, --output <path>', 'Define a path to save reports to')
  .option('--no-summary', 'Do not create a summary.')
  .option('--no-save', 'Do not save a report');

commander.parse(process.argv);

options.output = commander.output;
options.summary = commander.summary;
options.save = commander.save;

if (commander.args.length === 0) {
  console.error('Required at least one url');
  process.exit(-1);
}

if (commander.args.length > 0) {
  commander.args.forEach((url) => {
    validate(url, options);
  });
}
