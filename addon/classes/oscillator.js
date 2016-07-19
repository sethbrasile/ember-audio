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
   * Initializes default connections on Sound instantiation. Runs `on('init')`.
   *
   * @protected
   * @method _initConnections
   */
  _initConnections: on('init', function() {
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

    this.set('connections', A([ bufferSource, gain, panner, destination ]));
    this._wireConnections();
  })
});

export default Oscillator;
