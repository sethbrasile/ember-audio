import Ember from 'ember';

// This exists because I'd like to use has() and values() from Map, but need
// properties to be observable by Ember CPs
const ObjectLikeMap = Ember.Object.extend({
  has(name) {
    if (name) {
      return !!this.get(name);
    }

    return false;
  },

  values() {
    return Object.keys(this).map((key) => this.get(key));
  }
});

export default ObjectLikeMap;
