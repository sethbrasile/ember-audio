import Ember from 'ember';
import { Connectable, Playable } from 'ember-audio/mixins';
import { zeroify } from 'ember-audio/utils';

/**
 * Provides classes that are capable of interacting with the Web Audio API's
 * AudioContext.
 *
 * @public
 * @module Audio
 */

const {
  computed,
  Object: EmberObject
} = Ember;

/**
 * The Sound class provides the core functionality for
 * interacting with the Web Audio API's AudioContext, and is the base class for
 * all other {{#crossLinkModule "Audio"}}{{/crossLinkModule}} types. It prepares
 * an audio source, provides various methods for interacting with the audio source,
 * creates {{#crossLink "AudioNode"}}AudioNodes{{/crossLink}} from the
 * connections array, sets up the necessary connections/routing between them,
 * and provides some methods to {{#crossLink "Playable/play:method"}}{{/crossLink}}
 * and {{#crossLink "Sound/stop:method"}}{{/crossLink}} the audio source.
 *
 * @public
 * @class Sound
 * @uses Connectable
 * @uses Playable
 */
const Sound = EmberObject.extend(Connectable, Playable, {

  /**
   * When using the {{#crossLink "Audio-Service"}}{{/crossLink}}, The name that
   * this Sound instance is registered as on it's parent register.
   *
   * @public
   * @property name
   * @type {string}
   */
  name: null,

  /**
   * The AudioBuffer instance that provides audio data to the bufferSource connection.
   *
   * @public
   * @property audioBuffer
   * @type {AudioBuffer}
   */
  audioBuffer: null,

  /**
   * The parent
   * [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
   * instance that all audio events are occurring within. It is useful for
   * getting currentTime, as well as creating new
   * [AudioNodes](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode).
   *
   * This is the object that facilitates and ties together all aspects of the
   * Web Audio API.
   *
   * @public
   * @property audioContext
   * @type {AudioContext}
   */
  audioContext: null,

  /**
   * When a Sound instance plays, this is set to the `audioContext.currentTime`.
   * It will always reflect the start time of the most recent
   * {{#crossLink "Sound/_play:method"}}{{/crossLink}}.
   *
   * @property _startedPlayingAt
   * @type {number}
   * @private
   */
  _startedPlayingAt: 0,

  /**
   * When a Sound instance is played, this value is passed to the
   * {{#crossLink "AudioBufferSourceNode/start:method"}}AudioBufferSourceNode.start(){{/crossLink}}
   * `offset` param. Determines `where` (in seconds) the play will start, along
   * the duration of the audio source.
   *
   * @public
   * @property startOffset
   * @type {number}
   */
  startOffset: 0,

  /**
   * Computed property. Value is an object containing the duration of the
   * audioBuffer in three formats. The three formats
   * are `raw`, `string`, and `pojo`.
   *
   * Duration of 6 minutes would be output as:
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
   * @public
   * @property duration
   * @type {object}
   */
  duration: computed('audioBuffer.duration', function() {
    const duration = this.get('audioBuffer.duration');
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return {
      raw: duration,
      string: `${zeroify(minutes)}:${zeroify(seconds)}`,
      pojo: { minutes, seconds }
    };
  }),

  /**
   * Computed property. Value is the amount of gain currently applied to the
   * `gain` connection from the `connections` array, formatted as a percentage.
   *
   * @public
   * @property percentGain
   * @type {number}
   */
  percentGain: computed(function() {
    return this.getNodeFrom('gain').gain.value * 100;
  }),

  /**
   * Gets the `panner` connection and changes it's pan value to the value passed in.
   *
   * @param {number} value The value, between -1 and 1 that the `panner` connection's
   * `pan.value` should be set to.
   *
   * @public
   * @method changePanTo
   */
  changePanTo(value) {
    if (value > 1) {
      value = 1;
    } else if (value < -1) {
      value = -1;
    }

    this.getNodeFrom('panner').pan.value = value;
  },

  /**
   * Gets the `gain` connection and changes it's gain value to the value passed in.
   * returns a pojo with the `from` method that `value` is curried to, allowing
   * one to specify which type of value is being provided.
   *
   * @example
   *     // these all result in gainNode.gain.value === 0.9
   *     soundInstance.changeGainTo(0.9).from('ratio');
   *     soundInstance.changeGainTo(0.1).from('inverseRatio')
   *     soundInstance.changeGainTo(90).from('percent');
   *
   * @param {number} value The value that the `gain` connection's `gain.value` should
   * be set to. Can be a ratio, an inverseRatio or a percentage.
   *
   * @public
   * @method changeGainTo
   *
   * @return {object} Intermediary POJO containing the `from` method which will
   * determine the type of value that `gain.value` is being set to and make the
   * change accordingly.
   */
  changeGainTo(value) {
    const gainNode = this.getNodeFrom('gain');
    const notify = () => this.notifyPropertyChange('percentGain');

    function adjustGain(newValue) {
      if (newValue > 1) {
        newValue = 1;
      } else if (newValue < 0) {
        newValue = 0;
      }

      gainNode.gain.value = newValue;
      notify();
    }

    return {
      from(type) {
        if (type === 'ratio') {
          adjustGain(value);
        } else if (type === 'inverseRatio') {
          adjustGain(-value + 1);
        } else if (type === 'percent') {
          adjustGain(value / 100);
        }
      }
    };
  },

  /**
   * Gets the bufferSource and stops the audio,
   * changes it's play position, and restarts the audio.
   *
   * returns a pojo with the `from` method that `value` is curried to, allowing
   * one to specify which type of value is being provided.
   *
   * @example
   *     // for a Sound instance with a duration of 100 seconds, these will all
   *     // move the play position to 90 seconds.
   *     soundInstance.seek(0.9).from('ratio');
   *     soundInstance.seek(0.1).from('inverseRatio')
   *     soundInstance.seek(90).from('percent');
   *     soundInstance.seek(90).from('seconds');
   *
   * @param {number} amount The new play position value.
   *
   * @public
   * @method seek
   *
   * @return {object} Intermediary POJO containing the `from` method which will
   * determine the type of value that play position is being set to and make the
   * change accordingly.
   */
  seek(amount) {
    const duration = this.get('duration.raw');

    const moveToOffset = (offset) => {
      const isPlaying = this.get('isPlaying');

      if (offset > duration) {
        offset = duration;
      } else if (offset < 0) {
        offset = 0;
      }

      if (isPlaying) {
        this.stop();
        this.set('startOffset', offset);
        this.play();
      } else {
        this.set('startOffset', offset);
      }
    };

    return {
      from(type) {
        if (type === 'ratio') {
          moveToOffset(amount * duration);
        } else if (type === 'percent') {
          moveToOffset(amount * duration * 0.01);
        } else if (type === 'inverseRatio') {
          moveToOffset(duration - (amount * duration));
        } else if (type === 'seconds') {
          moveToOffset(amount);
        }
      }
    };
  }
});

export default Sound;
