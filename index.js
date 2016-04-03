/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-audio',

  included: function(app) {
    this._super.included(app);

    app.import(app.bowerDirectory + '/howler.js/howler.min.js');
  }
};
