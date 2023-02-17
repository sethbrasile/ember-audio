'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    babel: {
      plugins: [
        [require('babel-plugin-prismjs').default,
          {
            "languages": ["javascript", "handlebars"],
            "theme": "okaidia",
            "css": true,
            "plugins": ["line-numbers"],
          }
        ]
      ]
    },

    stylusOptions: {
      outputFile: 'dummy.css'
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
  app.import('node_modules/bootstrap/dist/css/bootstrap.css.map');
  app.import('node_modules/@fortawesome/fontawesome-free/js/brands.js');
  app.import('node_modules/@fortawesome/fontawesome-free/js/fontawesome.js');

  return app.toTree();
};
