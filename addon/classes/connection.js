import Ember from 'ember';

const {
  A,
  on
} = Ember;

/**
 * Provides classes that interact with the Web Audio API indirectly by providing
 * data models for the classes in the Audio module to consume.
 *
 * @module AudioHelpers
 */

/**
 * This class represents a single connection in a Sound instance's connections
 * array. It is mostly just a wrapper around an AudioNode instance. It defines
 * some standards for how to handle the behaviors of different AudioNode types.
 * Most connections create their corresponding AudioNode immediately, but some
 * AudioNodes are "throw-away" and have to be created each time a Sound instance
 * is played.
 *
 * Most properties in this class just define how to go about getting/creating an
 * AudioNode instance and setting it on this class' `node` property. Some define
 * how to set properties on the AudioNode instance after it has been created.
 *
 * @class Connection
 */
const Connection = Ember.Object.extend({

  /**
   * The name of the connection. This is the name that can be used to
   * get an AudioNode instance via the
   * {{#crossLink "Sound/getNodeFrom:method"}}{{/crossLink}} method.
   *
   * @property name
   * @type {string}
   */
  name: null,

  /**
   * If an AudioNode instance already exists and is accessible to the Sound
   * instance, the path to the node can be placed here. If this value is
   * specified, all options except `name` become useless. If `node` is specified,
   * it will override this option and the AudioNode supplied to `node` will be
   * used.
   *
   * @example
   *     // Uses the Audio Node instance from:
   *     // soundInstance.get('audioContext.destination')
   *     {
   *       name: 'destination',
   *       path: 'audioContext.destination'
   *     }
   *
   * @property path
   * @type {string}
   */
  path: null,

  /**
   * If `createCommand` is specified, the object at this location (relative to
   * the Sound instance) will be used as the "source" of the `createCommand`.
   *
   * @example
   *     // Creates the AudioNode by calling:
   *     // this.get('audioContext')[createCommand]();
   *     {
   *       source: 'audioContext'
   *       createCommand: createGain
   *     }
   *
   * @property source
   * @type {string}
   */
  source: null,

  /**
  * If `source` is specified, this method will be called on the object that was
  * retrieved from `source`. The value returned from this method is set on the
  * `node` property.
  *
  * @example
  *     // Creates the AudioNode by calling:
  *     // this.get('audioContext')[createCommand]();
  *     {
  *       source: 'audioContext'
  *       createCommand: createGain
  *     }
   *
   * @property createCommand
   * @type {string}
   */
  createCommand: null,

  /**
   * An array of POJOs that specify properties that need to be set on a node
   * when any of the {{#crossLink "Sound/play:method"}}{{/crossLink}} methods
   * are called. For instance, an
   * {{#crossLink "AudioBufferSourceNode"}}{{/crossLink}} must be created at
   * play time, because they can only be played once and then they are
   * immediately thrown away.
   *
   * Valid keys are:
   *
   * `attrNameOnNode` {string} Determines which property on the node should be
   * set to the value. This can be a nested accessor (ie. `'gain.value'`).
   *
   * `relativePath` {string} Determines where on `this` (the Sound instance) to
   * get the value. This can be a nested accessor (ie. `'gainNode.gain.value'`).
   *
   * `value` {mixed} The direct value to set. If used along with `relativePath`,
   * this will act as a default value and the value at `relativePath` will take
   * precedence.
   *
   * @example
   *     // Causes gainNode.gain.value = soundInstance.get('gainValue') || 1;
   *     // to be called at play-time
   *
   *     {
   *       name: 'gainNode',
   *       onPlaySetAttrsOnNode: [
   *         {
   *           attrNameOnNode: 'gain.value',
   *           relativePath: 'gainValue',
   *           value: 1
   *         }
   *       ]
   *     }
   *
   * @property onPlaySetAttrsOnNode
   * @type {array}
   */
  onPlaySetAttrsOnNode: null,

  /**
   * This is the main attraction here in connection-land. All the other
   * properties in the Connection class exist to create or mutate this property.
   * Houses an AudioNode instance that will be used by an instance of the Sound
   * class.
   *
   * If this property is set directly, all of the other properties on this class
   * (except `name`) are rendered useless.
   *
   * @property node
   * @type {AudioNode}
   */
  node: null,

  /**
   * If this is true, the AudioNode will be created every time the consuming
   * Sound instance is played.
   *
   * @property createdOnPlay
   * @type {boolean}
   * @default false
   */
  createdOnPlay: false,

  /**
   * If any of the array types are null on init, set them to an
   * Ember.MutableArray
   *
   * @private
   * @method _initArrays
   */
  _initArrays: on('init', function() {
    const arrays = ['onPlaySetAttrsOnNode'];

    arrays.map((name) => {
      if (!this.get(name)) {
        this.set(name, A());
      }
    });
  })
});

export default Connection;
