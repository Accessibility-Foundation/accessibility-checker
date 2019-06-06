#!/usr/bin/env node
import yargs from 'yargs';

import * as pkg from '../lib/util/package.js';
import a11yCheck from '../lib/index.js';
import RULES from '../lib/constants/';

const { argv } = yargs
  .version(`${pkg.name()}\nversion ${pkg.version()}\n\n${pkg.description()}`)
  .usage('$0 <url1 url2 … urlN>')
  .option('rules', {
    alias: 'r',
    describe: 'Test for specific rules only',
    type: 'array',
  })
  .help();

if (argv._.length) {
  a11yCheck(argv._, getRules(argv))
    .then(() => {
      console.log('Done!');
    });
}

else {
  console.log('[a11y-check]: Aborted. No arguments passed. Expected at least one argument.');
}

function getRules({ rules }) {
  return rules && rules.length > 0
    ? RULES.get(rules)
    : RULES.all();
}
