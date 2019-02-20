'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    stylusOptions: {
      outputFile: 'dummy.css'
    },

    'ember-prism': {
      theme: 'okaidia',
      components: ['javascript', 'handlebars', 'markup-templating']
    },

    'ember-cli-uglify': {
      exclude: ['piano.js']
    },

    fingerprint: {
      exclude: ['piano.js']
    }
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  app.import('vendor/piano.css');
  app.import('node_modules/bootstrap/dist/css/bootstrap.css');

  return app.toTree();
};
