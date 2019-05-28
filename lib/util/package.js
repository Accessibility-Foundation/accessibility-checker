const fs = require('fs');
const path = require('path');

const PKG = JSON.parse(fs.readFileSync(
  path.resolve('package.json'),
  'utf8'
));


function getDescription() {
  return PKG.description;
}

function getName() {
  return PKG.name;
}

function getVersion() {
  return PKG.version;
}

module.exports = {
  description: getDescription,
  name: getName,
  version: getVersion,
}
