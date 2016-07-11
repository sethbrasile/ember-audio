import Ember from 'ember';

/**
 * Augments `Ember.Object` with a few features of Javascript native `Map`.
 * Exists because I'd like to use `has()` and `values()` from `Map`, but need
 * properties to be observable by Ember's computed properties.
 *
 * <style>
 *   .ignore-this--this-is-here-to-hide-constructor,
 *   #ObjectLikeMap { visibility: hidden; }
 *   #ObjectLikeMap .type-signature { visibility: visible; }
 * </style>
 *
 *
 * @class ObjectLikeMap
 * @extends Ember.Object
 * @private
 */
const ObjectLikeMap = Ember.Object.extend({

  /**
   * Checks if an instance of an ObjectLikeMap has a given property by
   * the property's name.
   *
   * @method has
   * @param {string} name The name of the property you would like to check.
   * @returns {boolean} True if the instance has the property, else false.
   *
   * @memberof ObjectLikeMap
   * @instance
   */
  has(name) {
    if (name) {
      return !!this.get(name);
    }

    return false;
  },

  /**
   * Returns an array of all properties that have been set on an ObjectLikeMap
   * instance.
   *
   * @method values
   * @returns {array} Array of all properties that that have been set on an ObjectLikeMap instance.
   *
   * @memberof ObjectLikeMap
   * @instance
   */
  values() {
    return Object.keys(this).map((key) => this.get(key));
  }
});

export default ObjectLikeMap;
