'use strict';

module.exports = {
  name: require('./package').name,
  init() {
    this._super.init.apply(this, arguments);
    if (this.project.root === this.root) {
      const coverage = this.project.require('ember-cli-code-coverage');
      const babel = this.options.babel;
      babel.plugins = [
        ...(babel.plugins || []),
        ...coverage.buildBabelPlugin(),
      ];
    }
  },
};
