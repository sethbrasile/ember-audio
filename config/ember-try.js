'use strict';

module.exports = function () {
  return {
    useVersionCompatibility: true,
    useYarn: true,
    npmOptions: ['--loglevel=silent', '--no-shrinkwrap=true'],
  };
};
