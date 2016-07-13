import Ember from 'ember';
import Beat from './beat';
import Sound from './sound';

/**
 * Provides the Sampler class.
 *
 * @module Audio
 * @submodule Sampler
 */

const {
  computed
} = Ember;

/**
 * An instance of the Sampler class behaves just like a Sound, but allows
 * many {{#crossLink "AudioBuffer"}}AudioBuffers{{/crossLink}} to exist and
 * automatically alternately plays them (round-robin) each time any of the play
 * methods are called.
 *
 * @class Sampler
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
  * Gets the next Sound and plays it immediately.
  *
  * @method playIn
  */
  play() {
    const nextSound = this._getNextSound();
    nextSound.play();
  },

  /**
   * Gets _soundIterator and returns it's next value. If _soundIterator has
   * reached it's end, replaces _soundIterator with a fresh copy from _sounds
   * and returns the first value from that instead.
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
