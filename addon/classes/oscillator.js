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
 * @todo figure out why `isPlaying` isn't working for Oscillator
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

  /**
   * Creates a Connection instance with a filter of the specified type.
   *
   * @private
   * @method _createFilter
   *
   * @param {string} type Determines what type of filter will be created.
   *
   * @return {Connection} A connection with a BiquadFilterNode of the specified
   * type.
   */
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

  /**
   * Determines the Frequency for the lowpass filter. The lowpass filter is
   * disabled if this is not provided.
   *
   * @public
   * @property lowpassFrequency
   * @type {number}
   */
  lowpassFrequency: null,

  /**
   * Determines the Frequency for the highpass filter. The highpass filter is
   * disabled if this is not provided.
   *
   * @public
   * @property highpassFrequency
   * @type {number}
   */
  highpassFrequency: null,

  /**
   * Determines the Frequency for the bandpass filter. The bandpass filter is
   * disabled if this is not provided.
   *
   * @public
   * @property bandpassFrequency
   * @type {number}
   */
  bandpassFrequency: null,

  /**
   * Determines the Frequency for the lowshelf filter. The lowshelf filter is
   * disabled if this is not provided.
   *
   * @public
   * @property lowshelfFrequency
   * @type {number}
   */
  lowshelfFrequency: null,

  /**
   * Determines the Frequency for the highshelf filter. The highshelf filter is
   * disabled if this is not provided.
   *
   * @public
   * @property highshelfFrequency
   * @type {number}
   */
  highshelfFrequency: null,

  /**
   * Determines the Frequency for the peaking filter. The peaking filter is
   * disabled if this is not provided.
   *
   * @public
   * @property peakingFrequency
   * @type {number}
   */
  peakingFrequency: null,

  /**
   * Determines the Frequency for the notch filter. The notch filter is
   * disabled if this is not provided.
   *
   * @public
   * @property notchFrequency
   * @type {number}
   */
  notchFrequency: null,

  /**
   * Determines the Frequency for the allpass filter. The allpass filter is
   * disabled if this is not provided.
   *
   * @public
   * @property allpassFrequency
   * @type {number}
   */
  allpassFrequency: null,

  /**
   * Determines the Q for the lowpass filter. Has No effect if lowpassFrequency
   * is not set.
   *
   * @public
   * @property lowpassQ
   * @type {number}
   */
  lowpassQ: null,

  /**
   * Determines the Q for the highpass filter. Has No effect if highpassFrequency
   * is not set.
   *
   * @public
   * @property highpassQ
   * @type {number}
   */
  highpassQ: null,

  /**
   * Determines the Q for the bandpass filter. Has No effect if bandpassFrequency
   * is not set.
   *
   * @public
   * @property bandpassQ
   * @type {number}
   */
  bandpassQ: null,

  /**
   * Determines the Q for the peaking filter. Has No effect if peakingFrequency
   * is not set.
   *
   * @public
   * @property peakingQ
   * @type {number}
   */
  peakingQ: null,

  /**
   * Determines the Q for the notch filter. Has No effect if notchFrequency
   * is not set.
   *
   * @public
   * @property notchQ
   * @type {number}
   */
  notchQ: null,

  /**
   * Determines the Q for the allpass filter. Has No effect if allpassFrequency
   * is not set.
   *
   * @public
   * @property allpassQ
   * @type {number}
   */
  allpassQ: null,

  /**
   * Determines the Gain for the lowshelf filter. Has no effect if
   * lowshelfFrequency is not set.
   *
   * @public
   * @property lowshelfGain
   * @type {number}
   */
  lowshelfGain: null,

  /**
   * Determines the Gain for the highshelf filter. Has no effect if
   * highshelfFrequency is not set.
   *
   * @public
   * @property highshelfGain
   * @type {number}
   */
  highshelfGain: null,

  /**
   * Determines the Gain for the peaking filter. Has no effect if
   * peakingFrequency is not set.
   *
   * @public
   * @property peakingGain
   * @type {number}
   */
  peakingGain: null
});

export default Oscillator;
