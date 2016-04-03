/*jshint node:true*/
module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addBowerPackageToProject('howler.js', '2.0.0-beta10');
  }
};
