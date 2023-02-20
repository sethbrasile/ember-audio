'use strict';

module.exports = function () {
  return {
    useVersionCompatibility: true,
    useYarn: false,
    npmOptions: ['--loglevel=silent', '--no-shrinkwrap=true'],
  };
};
