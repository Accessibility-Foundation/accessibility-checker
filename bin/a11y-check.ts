#!/usr/bin/env node
import { readFileSync } from 'fs';
import yargs from 'yargs';

import * as pkg from '../lib/util/package.js';
import a11yCheck from '../lib/';
import RULES from '../lib/constants/';

const { argv } = yargs
  .version(`${pkg.name()}\nversion ${pkg.version()}\n\n${pkg.description()}`)
  .usage('$0 <url1 url2 … urlN>')
  .option('url-list', {
    alias: 'u',
    describe: 'Specify a path to a textfile with a list of urls',
    normalize: true,
    type: 'string'
  })
  .option('rules', {
    alias: 'r',
    describe: 'Test for specific rules only',
    type: 'array',
  })
  .option('save-to', {
    alias: 's',
    default: './a11y-check',
    describe: 'Save the report to a specified folder',
    type: 'string',
    normalize: true,
  })
  .help();

if (getUrls(argv).length) {
  a11yCheck(getUrls(argv), {
    rules: getRules(argv),
    saveTo: argv.saveTo,
  })
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

function getUrls(argv) {

  const {
    _,
    urlList
  } = argv;
  const urls = [].concat(_);

  if (urlList) {
    readFileSync(urlList, 'utf8')
      .split(/\s+/g)
      .forEach(url => {
        if (url.length) {
          urls.push(url);
        }
      })
  }

  return urls;
}
