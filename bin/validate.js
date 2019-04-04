#!/usr/bin/env node

const { readFileSync } = require('fs');
const os = require('os');
const path = require('path');

const commander = require('commander');
const pkg = JSON.parse(readFileSync(path.resolve('package.json'), 'utf8'));

const validate = require(path.resolve('lib', 'commands', 'validate.js'));

const options = {};
let urls = [];

commander
  .version(pkg.version)
  .usage('<url...>')
  .description('Validate an url or list of urls with @Siteimprove/Alfa')
  .option('-u, --url-list <file>', 'Use a textfile with urls as input.')
  .option('-o, --output <path>', 'Define a path to save reports to.')
  .option('-r, --rules <...rule>', 'Pass one or more rule keys as a list to validate.')
  .option('-x, --exclude-rules <...rule>', 'Exclude rules from list.')
  .option('-s, --split-rules', 'Split rule outcomes in seperate reports.')
  .option('-f, --failed', 'Only include results with outcome failed.')
  .option('--no-summary', 'Do not create a summary.')
  .option('--no-save', 'Do not save a report.');

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

options.output = (str => {
  if (str && str.indexOf('~') >= 0) {
    return str.replace('~', os.homedir());
  }

  return str;
})(commander.output);

options.summary = commander.summary;
options.save = commander.save;
options.rules = commander.rules && commander.rules.split(',').map(rule => rule.trim().toUpperCase()) || [];
options.excludeRules = commander.excludeRules && commander.excludeRules.split(',').map(rule => rule.trim().toUpperCase()) || [];
options.splitRules = commander.splitRules || false;
options.failed = commander.failed || false;

if (urls.length === 0) {
  console.error('Required at least one url');
  process.exit(-1);
}

if (urls.length > 0) {
  urls.forEach((url) => {
    validate(url, options);
  });
}
