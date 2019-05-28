#!/usr/bin/env node
const command = require('commander');

const pkg = require('../lib/util/package.js');
const a11yCheck = require('../lib/index.js');


command
  .version(`${pkg.name()}: version ${pkg.version()}`)
  .usage('<url1 url2 … urlN>')
  .description(pkg.description());

command.parse(process.argv);

function getUrls(command) {
  return command.args;
}

function hasUrls(command) {
  return command.args.length > 0;
}

if (hasUrls(command)) {
  a11yCheck(getUrls(command));
  console.log('Done!');
}

else {
  console.log('[a11y-check]: Aborted. No arguments passed. Expected at least one argument.');
}
