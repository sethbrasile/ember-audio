import Ember from 'ember';
import { Playable } from 'ember-audio/mixins';

/**
 * Provides classes that are capable of interacting with the Web Audio API's
 * AudioContext.
 *
 * @public
 * @module Audio
 */

const {
  Object: EmberObject
} = Ember;

/**
 *
 *
 */
const LayeredSound = EmberObject.extend({
  /**
   * Acts as a register for loaded different types of sounds. Set on
   * instantiation. Anything that has a `play` method can be placed in this array.
   *
   * @public
   * @property sounds
   * @type {array|Sound|Oscillator}
   */
  sounds: null,

  /**
   * Maps through objects in `sounds` and calls `play` on each
   *
   * @public
   * @method play
   */
  play() {
    this.get('sounds').map((sound) => sound.play());
  },

  /**
   * Maps through objects in `sounds` and calls `playAt` on each, passing
   * through the `time` param to each sound.
   *
   * @public
   * @method playAt
   *
   * @param {number} time The time to pass to each object's `playAt` method.
   */
  playAt(time) {
    this.get('sounds').map((sound) => sound.playAt(time));
  },

  /**
   * Maps through objects in `sounds` and calls `playIn` on each, passing
   * through the `seconds` param to each sound.
   *
   * @public
   * @method playIn
   *
   * @param {number} seconds The seconds to pass to each object's `playIn` method.
   */
  playIn(seconds) {
    this.get('sounds').map((sound) => sound.playIn(seconds));
  },

  /**
   * Maps through objects in `sounds` and calls `playFor` on each, passing
   * through the `seconds` param to each sound.
   *
   * @public
   * @method playFor
   *
   * @param {number} seconds The seconds to pass to each object's `playFor` method.
   */
  playFor(seconds) {
    this.get('sounds').map((sound) => sound.playFor(seconds));
  },

  /**
   * Maps through objects in `sounds` and calls `playInAndStopAfter` on each,
   * passing through the `playIn` and `stopAfter` params to each sound.
   *
   * @public
   * @method playForIn
   *
   * @param {number} playIn Seconds to pass to each object's
   * `playInAndStopAfter` method.
   *
   * @param {number} stopAfter Seconds to pass to each object's
   * `playInAndStopAfter` method.
   */
  playInAndStopAfter(playIn, stopAfter) {
    this.get('sounds').map((sound) => sound.playInAndStopAfter(playIn, stopAfter));
  }
});

export default LayeredSound;
