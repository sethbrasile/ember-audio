import Ember from 'ember';
import Sound from './sound';
import zeroify from '../utils/zeroify';

const {
  computed,
} = Ember;

/**
 * A class that represents a "track" of music, similar in concept to a track on
 * a CD or an MP3 player. Provides methods for tracking the play position of the
 * underlying
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer AudioBuffer},
 * and pausing/resuming.
 *
 * <style>
 *   .ignore-this--this-is-here-to-hide-constructor,
 *   #Track { display: none; }
 * </style>
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer}
 * @class Track
 * @extends Sound
 *
 * @property {object} position Computed property. See
 * {@link Track#position position}.
 *
 * @property {object} percentPlayed Computed property. See
 * {@link Track#percentPlayed percentPlayed}.
 */
const Track = Sound.extend({

  /**
   * Computed property. Value is an object containing the current play position
   * of the {@link Sound#audioBuffer audioBuffer} in three formats. The three
   * formats are `raw`, `string`, and `pojo`.
   *
   * Play position of 6 minutes would be output as:
   *
   *     {
   *       raw: 360, // seconds
   *       string: '06:00',
   *       pojo: {
   *         minutes: 6,
   *         seconds: 0
   *       }
   *     }
   *
   * @memberof Track
   * @type {object}
   * @observes 'startOffset'
   * @instance
   * @readonly
   */
  position: computed('startOffset', function() {
    const startOffset = this.get('startOffset');
    const minutes = Math.floor(startOffset / 60);
    const seconds = startOffset - (minutes * 60);

    return {
      raw: startOffset,
      string: `${zeroify(minutes)}:${zeroify(seconds)}`,
      pojo: { minutes, seconds }
    };
  }),

  /**
   * Computed property. Value is the current play position of the
   * {@link Sound#audioBuffer audioBuffer}, formatted as a percentage.
   *
   * @memberof Sound
   * @type {number}
   * @instance
   * @readonly
   */
  percentPlayed: computed('duration', 'startOffset', function() {
    const ratio = this.get('startOffset') / this.get('duration.raw');
    return ratio * 100;
  }),

  /**
   * Plays the {@link Sound#bufferSourceNode audio source} immediately.
   *
   * @method play
   * @memberof Track
   * @instance
   * @override
   */
  play() {
    this._super();
    this.get('bufferSourceNode').onended = () => this.stop();
    this._trackPlayPosition();
  },

  /**
   * Pauses the {@link Sound#bufferSourceNode audio source} by stopping without
   * setting {@link Sound#startOffset startOffset} back to 0.
   *
   * @method pause
   * @memberof Track
   * @instance
   * @override
   */
  pause() {
    if (this.get('isPlaying')) {
      this.get('bufferSourceNode').onended = function() {};
      this.get('bufferSourceNode').stop();
      this.set('isPlaying', false);
    }
  },

  /**
   * Stops the {@link Sound#bufferSourceNode audio source} and sets
   * {@link Sound#startOffset startOffset} to 0.
   *
   * @method stop
   * @memberof Track
   * @instance
   * @override
   */
  stop() {
    this.set('startOffset', 0);

    if (this.get('isPlaying')) {
      this.get('bufferSourceNode').onended = function() {};
      this._super();
    }
  },

  /**
   * Sets up a `requestAnimationFrame` based loop that updates the
   * {@link Sound#startOffset startOffset} as `audioContext.currentTime` grows.
   * Loop ends when {@link Sound#isPlaying isPlaying} is false.
   *
   * @method _trackPlayPosition
   * @memberof Track
   * @private
   * @instance
   */
  _trackPlayPosition() {
    const ctx = this.get('audioContext');
    const startOffset = this.get('startOffset');
    const startedPlayingAt = this.get('startedPlayingAt');

    const animate = () => {
      if (this.get('isPlaying')) {
        this.set('startOffset', startOffset + ctx.currentTime - startedPlayingAt);
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }
});

export default Track;
