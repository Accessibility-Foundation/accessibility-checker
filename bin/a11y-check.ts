#!/usr/bin/env node
import yargs from 'yargs';

import * as pkg from '../lib/util/package.js';
import a11yCheck from '../lib/index.js';

const { argv } = yargs
  .version(`${pkg.name()}: version ${pkg.version()}`)
  .usage('<url1 url2 … urlN>')
  .help(pkg.description());

if (argv._.length) {
  a11yCheck(argv._)
    .then(() => {
      console.log('Done!');
    });
}

else {
  console.log('[a11y-check]: Aborted. No arguments passed. Expected at least one argument.');
}
