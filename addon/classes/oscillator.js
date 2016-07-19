import Ember from 'ember';
import { Connectable } from 'ember-audio/mixins';
import { Connection } from 'ember-audio';

/**
 * Provides classes that are capable of interacting with the Web Audio API's
 * AudioContext.
 *
 * @public
 * @module Audio
 */

const {
  A,
  on,
  Object: EmberObject
} = Ember;

/**
 * A class that represents an oscillator for a synthesizer. Capable of creating
 * and starting a waveform of specified `type` at a specified `frequency`.
 *
 * @public
 * @class Oscillator
 * @uses Connectable
 */
const Oscillator = EmberObject.extend(Connectable, {

  /**
   * Determines the type of wave output by the OscillatorNode instance.
   * Corresponds directly to `type` from
   * {{#crossLink "OscillatorNode"}}{{/crossLink}}
   *
   * @public
   * @property type
   * @type {string}
   * @default 'sine'
   */
  type: 'sine',

  /**
   * Determines the frequency of the wave output by the OscillatorNode instance.
   * Corresponds directly to `frequency` from
   * {{#crossLink "OscillatorNode"}}{{/crossLink}}
   *
   * @public
   * @property frequency
   * @type {number}
   */
  frequency: null,

  /**
   * Starts the oscillator immediately.
   *
   * @public
   * @method play
   */
  play() {
    this._play(this.get('audioContext.currentTime'));
  },

  playAt(time) {
    this._play(time);
  },

  playIn(amount) {
    this._play(amount + this.get('audioContext.currentTime'));
  },

  /**
   * Stops the oscillator immediately.
   *
   * @public
   * @method stop
   */
  stop() {
    this.getNodeFrom('oscillator').stop();
  },

  /**
   * Starts the oscillator at the specified time.
   *
   * The underlying method that backs play, playIn, and playAt.
   *
   * @private
   * @method _play
   *
   * @param {number} time The time relative to `audioContext`'s
   * "beginning of time" that the oscillator should start.
   */
  _play(time) {
    this._wireConnections();
    this.getNodeFrom('oscillator').start(time);
  },

  /**
   * Initializes default connections on Sound instantiation. Runs `on('init')`.
   *
   * @protected
   * @method _initConnections
   */
  _initConnections: on('init', function() {
    const bufferSource = Connection.create({
      name: 'oscillator',
      createdOnPlay: true,
      source: 'audioContext',
      createCommand: 'createOscillator',
      onPlaySetAttrsOnNode: [
        {
          attrNameOnNode: 'frequency.value',
          relativePath: 'frequency'
        },
        {
          attrNameOnNode: 'type',
          relativePath: 'type'
        }
      ]
    });

    const gain = Connection.create({
      name: 'gain',
      source: 'audioContext',
      createCommand: 'createGain'
    });

    const panner = Connection.create({
      name: 'panner',
      source: 'audioContext',
      createCommand: 'createStereoPanner'
    });

    const destination = Connection.create({
      name: 'destination',
      path: 'audioContext.destination'
    });

    this.set('connections', A([ bufferSource, gain, panner, destination ]));
    this._wireConnections();
  })
});

export default Oscillator;
