import Ember from 'ember';

/**
 * Provides classes that are capable of interacting with the Web Audio API's
 * AudioContext.
 *
 * @module Audio
 */

/**
 * An instance of the Sampler class behaves just like a Sound, but allows
 * many {{#crossLink "AudioBuffer"}}AudioBuffers{{/crossLink}} to exist and
 * automatically alternately plays them (round-robin) each time any of the play
 * methods are called.
 *
 * @class Sampler
 * @todo provide easy method for setting gain and pan for each beat in sampler
 */
const Sampler = Ember.Object.extend({

  /**
   * Temporary storage for the iterable that comes from the _sounds Set.
   * This iterable is meant to be replaced with a new copy every time it reaches
   * it's end, resulting in an infinite stream of Sound instances.
   *
   * @private
   * @property _soundIterator
   * @type {Iterator}
   *
   */
  _soundIterator: null,

  /**
   * Acts as a register for loaded Sound instances. Set on instantiation.
   *
   * @private
   * @property _sounds
   * @type {Set|Sound}
   */
  _sounds: null,

  /**
   * Gets the next Sound and plays it immediately.
   *
   * @method play
   */
   play() {
     const nextSound = this._getNextSound();
     nextSound.play();
   },

  /**
   * Gets the next Sound and plays it after the specified offset has elapsed.
   *
   * @method playIn
   *
   * @param {number} seconds Number of seconds from "now" that the next Sound
   * should be played.
   */
  playIn(seconds) {
   const nextSound = this._getNextSound();
   nextSound.playIn(seconds);
  },

  /**
   * Gets the next Sound and plays it at the specified moment in time. A
   * "moment in time" is measured in seconds from the moment that the
   * {{#crossLink "AudioContext"}}{{/crossLink}} was instantiated.
   *
   * @param {number} time The moment in time (in seconds, relative to the
   * {{#crossLink "AudioContext"}}AudioContext's{{/crossLink}} "beginning of
   * time") when the next Sound should be played.
   *
   * @method playAt
   */
  playAt(time) {
    const nextSound = this._getNextSound();
    nextSound.playAt(time);
  },

  /**
   * Gets _soundIterator and returns it's next value. If _soundIterator has
   * reached it's end, replaces _soundIterator with a fresh copy from _sounds
   * and returns the first value from that.
   *
   * @private
   * @method _getNextSound
   * @return {Sound}
   */
  _getNextSound() {
    let soundIterator = this.get('_soundIterator');
    let nextSound;

    if (!soundIterator) {
     soundIterator = this.get('_sounds').values();
    }

    nextSound = soundIterator.next();

     if (nextSound.done) {
       soundIterator = this.get('_sounds').values();
       nextSound = soundIterator.next();
     }

     this.set('_soundIterator', soundIterator);

     return nextSound.value;
   }
});

export default Sampler;
