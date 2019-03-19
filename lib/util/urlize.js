const URL = require('url').URL;

module.exports = function urlize(url) {
  const PROTOCOL = /(http|https)(\:\/\/)/g;
  const PATH = /\/{1}[^?#]*/g;

  const urlProtocol = url.match(PROTOCOL)
    ? url.match(PROTOCOL)[0]
    : 'https://';

  const urlHost = url
    .replace(PROTOCOL, '')
    .replace(PATH, '');

  const urlBase = urlProtocol + urlHost;

  const urlPath = url.replace(PROTOCOL, '').match(PATH)
    ? url.replace(PROTOCOL, '').match(PATH)[0]
    : '/';

  return new URL(urlPath, urlBase);
}
