'use strict';

const getChannelURL = require('ember-source-channel-url');
// const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    useYarn: true,
    scenarios: [
      {
        name: 'ember-lts-3.8',
        npm: {
          devDependencies: {
            'ember-source': '~3.8.0',
            'ember-cli': '~3.8.0',
            'ember-resolver': '^8.0.0',
          },
        },
      },
      // {
      //   name: 'ember-lts-3.12',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': '~3.12.0',
      //       'ember-cli': '~3.12.0',
      //       'ember-resolver': '^8.0.0',
      //     },
      //   },
      // },
      // {
      //   name: 'ember-lts-3.16',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': '~3.16.0',
      //       'ember-cli': '~3.16.0',
      //       'ember-resolver': '^8.0.0',
      //     },
      //   },
      // },
      // {
      //   name: 'ember-lts-3.20',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': '~3.20.5',
      //       'ember-cli': '~3.20.0',
      //       'ember-resolver': '^8.0.0',
      //     },
      //   },
      // },
      // {
      //   name: 'ember-lts-3.24',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': '~3.24.3',
      //       'ember-cli': '~3.24.0',
      //       'ember-resolver': '^8.0.0',
      //     },
      //   },
      // },
      // {
      //   name: 'ember-lts-3.28',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': '~3.28.0',
      //       'ember-cli': '~3.28.0',
      //       'ember-resolver': '^8.0.0',
      //     },
      //   },
      // },
      // {
      //   name: 'ember-lts-4.4',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': '~4.4.0',
      //       'ember-cli': '~4.4.0',
      //     },
      //   },
      // },
      // {
      //   name: 'ember-lts-4.8',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': '~4.8.0',
      //       'ember-cli': '~4.8.0',
      //     },
      //   },
      // },
      // {
      //   name: 'ember-release',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': await getChannelURL('release'),
      //     },
      //   },
      // },
      // {
      //   name: 'ember-beta',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': await getChannelURL('beta'),
      //     },

      //   },
      // },
      // {
      //   name: 'ember-canary',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': await getChannelURL('canary'),
      //     },
      //   },
      // },
      // {
      //   name: 'ember-default-with-jquery',
      //   env: {
      //     EMBER_OPTIONAL_FEATURES: JSON.stringify({
      //       'jquery-integration': true,
      //     }),
      //   },
      //   npm: {
      //     devDependencies: {
      //       '@ember/jquery': '^1.1.0',
      //     },
      //   },
      // },
      // {
      //   name: 'ember-classic',
      //   env: {
      //     EMBER_OPTIONAL_FEATURES: JSON.stringify({
      //       'application-template-wrapper': false,
      //       'default-async-observers': false,
      //       'jquery-integration': false,
      //       'template-only-glimmer-components': true
      //     }),
      //   },
      //   npm: {
      //     ember: {
      //       edition: 'classic',
      //     },
      //   },
      // },
      // embroiderSafe(),
      // embroiderOptimized(),
    ],
  };
};
