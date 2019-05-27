#!/usr/bin/env node
const command = require('commander');
const fs = require('fs');
const path = require('path');

const a11yCheck = require('../lib/index.js');

const PKG = JSON.parse(fs.readFileSync(
  path.resolve('package.json'),
  'utf8'
));

command
  .version(`${PKG.name}: version ${PKG.version}`)
  .usage('<url1 url2 … urlN>')
  .description(PKG.description);

command.parse(process.argv);

function getUrls(command) {
  return command.args;
}

function hasUrls(command) {
  return command.args.length > 0;
}

if (hasUrls(command)) {
  a11yCheck(getUrls(command));
}

else {
  console.log('[a11y-check]: Aborted. No arguments passed. Expected at least one argument.');
}
