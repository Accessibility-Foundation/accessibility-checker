module.exports = (function() {
  'use strict';

  function addLeadingZero(string = '') {
    if (string.toString().length === 1) {
      return `0${string}`;
    }

    return string;
  }

  function filename() {
    const date = new Date();
    const Y = date.getFullYear();
    const M = addLeadingZero(date.getMonth() + 1);
    const D = addLeadingZero(date.getDate());
    const hh = addLeadingZero(date.getHours());
    const mm = addLeadingZero(date.getMinutes());
    const ss = addLeadingZero(date.getSeconds());

    return `${Y}_${M}_${D}_${hh}_${mm}_${ss}`;
  }

  return {
    filename,
  };
}());
