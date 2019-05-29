#!/usr/bin/env node
import command from 'commander';

import * as pkg from '../lib/util/package.js';
import a11yCheck from '../lib/index.js';

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
  a11yCheck(getUrls(command))
    .then(() => {
      console.log('Done!');
    });
}

else {
  console.log('[a11y-check]: Aborted. No arguments passed. Expected at least one argument.');
}
