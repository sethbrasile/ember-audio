import Ember from 'ember';

/**
 * Provides classes that are capable of interacting with the Web Audio API's
 * AudioContext.
 *
 * @public
 * @module Audio
 */

const {
  run: { later },
  Mixin
} = Ember;

/**
 * A mixin that allows an object to start and stop an audio source, now or in
 * the future, as well as track whether the audio source is currently playing or
 * not.
 *
 * @public
 * @class Playable
 */
export default Mixin.create({
  /**
   * Whether an audio source is playing or not.
   *
   * @public
   * @property isPlaying
   * @type {boolean}
   * @default false
   */
  isPlaying: false,

  /**
   * Plays the audio source immediately.
   *
   * @public
   * @method play
   */
  play() {
    this._play(this.get('audioContext.currentTime'));
  },

  /**
   * Plays the audio source at the specified moment in time. A "moment in time"
   * is measured in seconds from the moment that the
   * {{#crossLink "AudioContext"}}{{/crossLink}} was instantiated.
   *
   * Functionally equivalent to {{#crossLink "Playable/_play:method"}}{{/crossLink}}.
   *
   * @param {number} time The moment in time (in seconds, relative to the
   * {{#crossLink "AudioContext"}}AudioContext's{{/crossLink}} "beginning of
   * time") when the audio source should be played.
   *
   * @public
   * @method playAt
   */
  playAt(time) {
    this._play(time);
  },

  /**
   * Plays the audio source in specified amount of seconds from "now".
   *
   * @public
   * @method playIn
   *
   * @param {number} seconds Number of seconds from "now" that the audio source
   * should be played.
   */
  playIn(seconds) {
    this._play(this.get('audioContext.currentTime') + seconds);
  },

  /**
   * Starts playing the audio source immediately, but stops after specified
   * seconds have elapsed.
   *
   * @public
   * @method playFor
   *
   * @param {number} seconds The amount of time after which the audio source is
   * stopped.
   */
  playFor(seconds) {
    this.play();
    this.stopIn(seconds);
  },

  /**
   * Starts playing the audio source after `playIn` seconds have elapsed, then
   * stops the audio source `stopAfter` seconds after it started playing.
   *
   * @public
   * @method playInAndStopAfter
   *
   * @param {number} playIn Number of seconds from "now" that the audio source
   * should play.
   *
   * @param {number} stopAfter Number of seconds from when the audio source
   * started playing that the audio source should be stopped.
   */
  playInAndStopAfter(playIn, stopAfter) {
    this.playIn(playIn);
    this.stopIn(playIn + stopAfter);
  },

  /**
   * Stops the audio source immediately.
   *
   * @public
   * @method stop
   */
  stop() {
    this._stop(this.get('audioContext.currentTime'));
  },

  /**
   * Stops the audio source after specified seconds have elapsed.
   *
   * @public
   * @method stopIn
   *
   * @param {number} seconds Number of seconds from "now" that the audio source
   * should be stopped.
   */
  stopIn(seconds) {
    this._stop(this.get('audioContext.currentTime') + seconds)
  },

  /**
   * Stops the audio source at the specified "moment in time" relative to the
   * "beginning of time" according to the `audioContext`.
   *
   * Functionally equivalent to the `_stop` method.
   *
   * @public
   * @method stopAt
   *
   * @param {number} time The time that the audio source should be stopped.
   */
  stopAt(time) {
    this._stop(time);
  },

  /**
   * The underlying method that backs all of the `stop` methods.
   *
   * Functionally equivalent to the `stopAt` method.
   *
   * @private
   * @method _stop
   *
   * @param {number} time The time that the audio source should be stopped.
   */
  _stop(time) {
    const node = this.getNodeFrom('audioSource');

    if (node) {
      node.stop(time);
      this.set('isPlaying', false);
    }
  },

  /**
   * The underlying method that backs the
   * {{#crossLink "Playable/play:method"}}{{/crossLink}},
   * {{#crossLink "Playable/playAt:method"}}{{/crossLink}}, and
   * {{#crossLink "Playable/playIn:method"}}{{/crossLink}} methods.
   *
   * Plays the audio source at the specified moment in time. A "moment in time"
   * is measured in seconds from the moment that the
   * {{#crossLink "AudioContext"}}{{/crossLink}} was instantiated.
   *
   * Functionally equivalent to {{#crossLink "Sound/playAt:method"}}{{/crossLink}}.
   *
   * @param {number} time The moment in time (in seconds, relative to the
   * {{#crossLink "AudioContext"}}AudioContext's{{/crossLink}} "beginning of
   * time") when the audio source should be played.
   *
   * @method _play
   * @private
   */
  _play(playAt) {
    const currentTime = this.get('audioContext.currentTime');

    this._wireConnections();

    const node = this.getNodeFrom('audioSource');

    node.start(playAt, this.get('startOffset'));

    this.set('_startedPlayingAt', playAt);

    if (playAt === currentTime) {
      this.set('isPlaying', true);
    } else {
      later(() => this.set('isPlaying', true), (playAt - currentTime) * 1000);
    }
  }
});
