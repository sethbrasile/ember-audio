import Ember from 'ember';
import Beat from './beat';
import Sampler from './sampler';

/**
 * Provides classes that are capable of interacting with the Web Audio API's
 * AudioContext.
 *
 * @public
 * @module Audio
 */

const {
  computed
} = Ember;

/**
 * An instance of this class has a single "sound" (comprised of one or multiple
 * audio sources) but provides methods to play that sound repeatedly, mixed with
 * "rests," in a rhythmic way. An instance of this class behaves very similarly
 * to a "lane" on a drum machine.
 *
 * @public
 * @class BeatTrack
 * @extends Sampler
 *
 * @todo need a way to stop a BeatTrack once it's started. Maybe by creating
 * the times in advance and not calling play until it's the next beat in the
 * queue?
 *
 * @todo beats in beats array should save `active` state when numbeats/duration changes
 */
const BeatTrack = Sampler.extend({

  /**
   * Determines the number of beats in a BeatTrack instance.
   *
   * @public
   * @property numBeats
   * @type {number}
   */
  numBeats: 4,

  /**
   * If specified, Determines length of time, in milliseconds, before isPlaying
   * and currentTimeIsPlaying are automatically switched back to false after
   * having been switched to true for each beat. 100ms is used by default.
   *
   * @public
   * @property duration
   * @type {number}
   * @default 100
   */
  duration: 100,

  /**
   * Computed property. An array of Beat instances. The number of Beat instances
   * in the array is always the same as the `numBeats` property.
   *
   * @public
   * @property beats
   * @type {array|Beat}
   */
  beats: computed('numBeats', 'duration', function() {
    const beats = [];
    const numBeats = this.get('numBeats');

    for (let i = 0; i < numBeats; i++) {
      const beat = Beat.create({
        duration: this.get('duration'),
        _parentPlayIn: this.playIn.bind(this),
        _parentPlay: this.play.bind(this)
      });

      beats.push(beat);
    }

    return beats;
  }),

  /**
   * Calls play on all Beat instances in the beats array.
   *
   * @public
   * @method playBeats
   *
   * @param {number} bpm The tempo at which the beats should be played.
   *
   * @param noteType {number} The (rhythmic) length of each beat. Fractions
   * are suggested here so that it's easy to reason about. For example, for
   * eighth notes, pass in `1/8`.
   */
  playBeats(bpm, noteType) {
    this._callPlayMethodOnBeats('playIn', bpm, noteType);
  },

  /**
   * Calls play on `active` Beat instances in the beats array. Any beat that
   * is not marked active is effectively a "rest".
   *
   * @public
   * @method playActiveBeats
   *
   * @param {number} bpm The tempo at which the beats and rests should be played.
   *
   * @param noteType {number} The (rhythmic) length of each beat/rest. Fractions
   * are suggested here so that it's easy to reason about. For example, for
   * eighth notes, pass in `1/8`.
   */
  playActiveBeats(bpm, noteType) {
    this._callPlayMethodOnBeats('ifActivePlayIn', bpm, noteType);
  },

  /**
   * The underlying method behind playBeats and playActiveBeats.
   *
   * @private
   * @method _callPlayMethodOnBeats
   *
   * @param {string} method The method that should be called on each beat.
   *
   * @param {number} bpm The tempo that should be used to calculate the length
   * of a beat/rest.
   *
   * @param noteType {number} The (rhythmic) length of each beat/rest that should
   * be used to calculate the length of a beat/rest in seconds.
   */
  _callPlayMethodOnBeats(method, bpm, noteType=1 / 4) {
    // http://bradthemad.org/guitar/tempo_explanation.php
    const duration = (240 * noteType) / bpm;
    this.get('beats').map((beat, idx) => beat[method](idx * duration));
  }
});

export default BeatTrack;
