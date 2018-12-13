module.exports = (function() {
  'use strict';

  function addLeadingZero(string = '') {
    if (string.toString().length === 1) {
      return `0${string}`;
    }

    return string;
  }

  function time(options = {}) {
    const datestring = options.datestring || undefined;
    const format = options.format || '24';
    const _ = options.separator || ':';
    const date = datestring
      ? new Date(datestring)
      : new Date();

    const hours = date.getHours();
    const minutes = addLeadingZero(date.getMinutes());
    const seconds = addLeadingZero(date.getSeconds());

    switch (format) {
      case '12':
        const AMPM_TIME = hours > 12
          ? 'PM'
          : 'AM';
        const AMPM_HOURS = hours > 12
          ? hours - 12
          : hours;

        return `${addLeadingZero(AMPM_HOURS)}${_}${minutes}${_}${seconds}${AMPM_TIME}`;

      case '24':
      default:
        return `${addLeadingZero(hours)}${_}${minutes}${_}${seconds}`;
    }
  }

  function date(options = {}) {
    const _ = options.separator || '-';
    const datestring = options.datestring || undefined;
    const $date = datestring
      ? new Date(datestring)
      : new Date();
    const year = $date.getFullYear();
    const month = addLeadingZero($date.getMonth() + 1);
    const day = addLeadingZero($date.getDate());

    return `${day}${_}${month}${_}${year}`;
  }

  function datetime(datestring) {
    const $date = datestring
      ? new Date(datestring)
      : new Date();

    return `${date($date)} ${time($date)}`;
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
    date,
    datetime,
    filename,
    time,
  };
}());
