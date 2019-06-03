import * as fs from 'fs';
import * as path from 'path';

const PKG = JSON.parse(fs.readFileSync(
  path.resolve('package.json'),
  'utf8'
));

export function description() {
  return PKG.description;
}

export function name() {
  return PKG.name;
}

export function version() {
  return PKG.version;
}
