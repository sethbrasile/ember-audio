import Ember from 'ember';
import { Connectable, Playable } from 'ember-audio/mixins';
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
 * All filters from {{#crossLink "BiquadFilterNode"}}{{/crossLink}} are
 * available and can be enabled by providing a given filter's frequency.
 *
 *     // creates a sine wave oscillator with a highpass at 1000Hz
 *     const audioContext = this.get('audio.audioContext');
 *     const osc = Oscillator.create({
 *       audioContext,
 *       highpassFrequency: 1000
 *     });
 *
 * @public
 * @class Oscillator
 * @uses Connectable
 * @uses Playable
 */
const Oscillator = EmberObject.extend(Connectable, Playable, {

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
   * Initializes default connections on Oscillator instantiation. Runs `on('init')`.
   *
   * @protected
   * @method _initConnections
   */
  _initConnections: on('init', function() {
    const filters = [
      this._createFilter('lowpass'),
      this._createFilter('highpass'),
      this._createFilter('bandpass'),
      this._createFilter('lowshelf'),
      this._createFilter('highshelf'),
      this._createFilter('peaking'),
      this._createFilter('notch'),
      this._createFilter('allpass')
    ];

    const bufferSource = Connection.create({
      name: 'audioSource',
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

    // always start with source
    const connections = A([ bufferSource ]);

    // Add filters if they have been defined
    filters.map((filter) => {
      const filterIsDefined = !!this.get(`${filter.get('name')}Frequency`);

      if (filterIsDefined) {
        connections.pushObject(filter);
      }
    });

    // add gain, panner, and destination connections
    connections.pushObjects([ gain, panner, destination ]);

    this.set('connections', connections);
    this._wireConnections();
  }),

  _createFilter(type) {
    return Connection.create({
      name: type,
      source: 'audioContext',
      createCommand: 'createBiquadFilter',
      onPlaySetAttrsOnNode: [
        {
          attrNameOnNode: 'type',
          value: type
        },
        {
          attrNameOnNode: 'frequency.value',
          relativePath: `${type}Frequency`
        },
        {
          attrNameOnNode: 'q.value',
          relativePath: `${type}Q`
        },
        {
          attrNameOnNode: 'gain.value',
          relativePath: `${type}Gain`
        }
      ]
    });
  },

  /*
  * The below properties are for the various filter settings. Read about them
  * here: https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
  */
  lowpassFrequency: null,
  highpassFrequency: null,
  bandpassFrequency: null,
  lowshelfFrequency: null,
  highshelfFrequency: null,
  peakingFrequency: null,
  notchFrequency: null,
  allpassFrequency: null,

  lowpassQ: null,
  highpassQ: null,
  bandpassQ: null,
  peakingQ: null,
  notchQ: null,
  allpassQ: null,

  lowshelfGain: null,
  highshelfGain: null,
  peakingGain: null,
});

export default Oscillator;
