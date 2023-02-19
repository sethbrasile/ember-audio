import { on } from '@ember/object/evented';
import EmberObject from '@ember/object';

/**
 * An instance of the Sampler class behaves just like a Sound, but allows
 * many {{#crossLink "AudioBuffer"}}AudioBuffers{{/crossLink}} to exist and
 * automatically alternately plays them (round-robin) each time any of the play
 * methods are called.
 *
 * @public
 * @class Sampler
 *
 * @todo humanize gain and time - should be optional and customizable
 * @todo loop
 */
const Sampler = EmberObject.extend({

  /**
   * Determines the gain applied to each sample.
   *
   * @public
   * @property gain
   * @type {number}
   * @default 1
   */
  gain: 1,

  /**
   * Determines the stereo pan position of each sample.
   *
   * @public
   * @property pan
   * @type {number}
   * @default 0
   */
  pan: 0,

  /**
   * Temporary storage for the iterable that comes from the sounds Set.
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
   * Acts as a register for loaded audio sources. Audio sources can be anything
   * that uses {{#crossLink "Playable"}}{{/crossLink}}. If not set on
   * instantiation, automatically set to `new Set()` via `_initSounds`.
   *
   * @public
   * @property sounds
   * @type {set}
   */
  sounds: null,

  /**
   * Gets the next audio source and plays it immediately.
   *
   * @public
   * @method play
   */
  play() {
    this._getNextSound().play();
  },

  /**
   * Gets the next Sound and plays it after the specified offset has elapsed.
   *
   * @public
   * @method playIn
   *
   * @param {number} seconds Number of seconds from "now" that the next Sound
   * should be played.
   */
  playIn(seconds) {
    this._getNextSound().playIn(seconds);
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
   * @public
   * @method playAt
   */
  playAt(time) {
    this._getNextSound().playAt(time);
  },

  /**
   * Gets _soundIterator and returns it's next value. If _soundIterator has
   * reached it's end, replaces _soundIterator with a fresh copy from sounds
   * and returns the first value from that.
   *
   * @private
   * @method _getNextSound
   * @return {Sound}
   */
  _getNextSound() {
    let soundIterator = this._soundIterator;
    let nextSound;

    if (!soundIterator) {
      soundIterator = this.sounds.values();
    }

    nextSound = soundIterator.next();

    if (nextSound.done) {
      soundIterator = this.sounds.values();
      nextSound = soundIterator.next();
    }

    this.set('_soundIterator', soundIterator);

    return this._setGainAndPan(nextSound.value);
  },

  /**
   * Applies the `gain` and `pan` properties from the Sampler instance to a
   * Sound instance and returns the Sound instance.
   *
   * @private
   * @method _setGainAndPan
   * @return {Sound} The input sound after having it's gain and pan set
   */
  _setGainAndPan(sound) {
    sound.changeGainTo(this.gain).from('ratio');
    sound.changePanTo(this.pan);

    return sound;
  },

  /**
   * Sets `sounds` to `new Set()` if null on instantiation.
   *
   * @private
   * @method _initSounds
   */
  _initSounds: on('init', function() {
    if (!this.sounds) {
      this.set('sounds', new Set());
    }
  })
});

export default Sampler;
