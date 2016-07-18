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
 * @public
 * @class Oscillator
 */
const Oscillator = EmberObject.extend(Connectable, {
  type: 'sine',

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
  }),

  start() {
    this.getNodeFrom('oscillator').start();
  },

  stop() {
    this.getNodeFrom('oscillator').stop();
  }
});

export default Oscillator;
