import Ember from 'ember';

/**
 * Provides classes that are capable of interacting with the Web Audio API's
 * AudioContext.
 *
 * @public
 * @module Audio
 */

const {
  on,
  Object: EmberObject
} = Ember;

/**
 * Allows multiple audio sources to be loaded up and played via their
 * `identifier`.
 *
 * @public
 * @class Font
 */
const Font = EmberObject.extend({

  /**
   * Acts as a register for all the notes in the font. If null on instantiation,
   * set to `new Map()` via `_initSounds`.
   *
   * @public
   * @property sounds
   * @type {map}
   */
  sounds: null,

  /**
   * Gets a sound from `sounds` and plays it.
   *
   * @public
   * @method play
   *
   * @param {string} identifier The identifier for the sound that should be
   * played.
   */
  play(identifier) {
    this.get('sounds').get(identifier).play();
  },

  /**
   * Sets `sounds` to `new Map()` if null on instantiation.
   *
   * @private
   * @method _initSounds
   */
  _initSounds: on('init', function() {
    if (!this.get('sounds')) {
      this.set('sounds', new Map());
    }
  })
});

export default Font;
