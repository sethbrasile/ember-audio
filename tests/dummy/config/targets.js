'use strict';

const browsers = [
  'last 1 Chrome versions',
  'last 1 Firefox versions',
  'last 1 Safari versions'
];

const isProduction = process.env.EMBER_ENV === 'production';

// Tests run against the browsers above, on CI as well as locally: with IE 11 in
// the list, Ember 3.16 and later do not build under this branch's Ember CLI 3.8.
if (isProduction) {
  browsers.push('ie 11');
}

module.exports = {
  browsers
};
