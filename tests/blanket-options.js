/* globals blanket, module */
/* jscs:disable */

var options = {
  modulePrefix: 'ember-audio',
  filter: '//.*ember-audio/.*/',
  antifilter: '//.*(tests|template).*/',
  loaderExclusions: [],
  enableCoverage: true,
  cliOptions: {
    reporters: ['json', 'lcov'],
    autostart: true,
    lcovOptions: {
      outputFile: 'lcov.dat',
      excludeMissingFiles: true,

      renamer: function (moduleName) {
        var app = /^ember-audio/;
        return moduleName.replace(app, 'addon') + '.js';
      },
    },
  },
};
if (typeof exports === 'undefined') {
  blanket.options(options);
} else {
  module.exports = options;
}
