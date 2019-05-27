#!/usr/bin/env node
const command = require('commander');
const fs = require('fs');
const path = require('path');

const PKG = JSON.parse(fs.readFileSync(
  path.resolve('package.json'),
  'utf8'
));


command
  .version(`${PKG.name}: version ${PKG.version}`)
  .usage('<url1 url2 … urlN>')
  .description(PKG.description);

command.parse(process.argv);
