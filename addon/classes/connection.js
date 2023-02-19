import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { on } from '@ember/object/evented';

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
 * @public
 * @class Connection
 */
const Connection = EmberObject.extend({

  /**
   * The name of the connection. This is the name that can be used to
   * get an AudioNode instance via the
   * {{#crossLink "Connectable/getNodeFrom:method"}}{{/crossLink}} method, or a
   * Connection instance via the
   * {{#crossLink "Connectable/getConnection"}}{{/crossLink}} method.
   *
   * @public
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
   * @public
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
   * @public
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
  *     // results in the `node` property being created like:
  *     // this.get('audioContext').createGain();
  *     {
  *       source: 'audioContext'
  *       createCommand: 'createGain'
  *     }
  *
  * @public
  * @property createCommand
  * @type {string}
  */
  createCommand: null,

  /**
   * An array of POJOs that specify properties that need to be set on a node
   * when any of the {{#crossLink "Playable/play:method"}}{{/crossLink}} methods
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
   * @public
   * @property onPlaySetAttrsOnNode
   * @type {Ember.MutableArray}
   * @default Ember.A() via _initArrays
   */
  onPlaySetAttrsOnNode: null,

  /**
   * Items in this array are set at play-time on the `node` via an exponential
   * ramp that ends at the specified time.
   *
   * A convenience setter method called
   * {{#crossLink "Connection/onPlaySet:method"}}{{/crossLink}} exists for this
   * array and should be used unless it does not allow enough freedom for your
   * use-case.
   *
   * @example
   *     // at play time: connection.node.gain.exponentialRampToValueAtTime(0.1, 1)
   *     {
   *       key: 'gain',
   *       value: 0.1,
   *       endTime: 1
   *     }
   *     // the same thing can be accomplished like:
   *     connection.onPlaySet('gain').to(0.1).endingAt(1)
   *
   * @public
   * @property exponentialRampToValuesAtTime
   * @type {Ember.MutableArray}
   * @default Ember.A() via _initArrays
   */
  exponentialRampToValuesAtTime: null,

  /**
   * Items in this array are set at play-time on the `node` via a linear ramp
   * that ends at the specified time.
   *
   * A convenience setter method called
   * {{#crossLink "Connection/onPlaySet:method"}}{{/crossLink}} exists for this
   * array and should be used unless it does not allow enough freedom for your
   * use-case.
   *
   * @example
   *     // at play time: connection.node.gain.linearRampToValueAtTime(0.1, 1)
   *     {
   *       key: 'gain',
   *       value: 0.1,
   *       endTime: 1
   *     }
   *     // the same thing can be accomplished like:
   *     connection.onPlaySet('gain').to(0.1).endingAt(1, 'linear')
   *
   * @public
   * @property linearRampToValuesAtTime
   * @type {Ember.MutableArray}
   * @default Ember.A() via _initArrays
   */
  linearRampToValuesAtTime: null,

  /**
   * Items in this array are set at play-time on the `node` via an exponential
   * ramp that ends at the specified time.
   *
   * A convenience setter method called
   * {{#crossLink "Connection/onPlaySet:method"}}{{/crossLink}} exists for this
   * array and should be used unless it does not allow enough freedom for your
   * use-case.
   *
   * @example
   *     // at play time: connection.node.gain.setValueAtTime(0.1, 1)
   *     {
   *       key: 'gain',
   *       value: 0.1,
   *       startTime: 1
   *     }
   *     // the same thing can be accomplished like:
   *     connection.onPlaySet('gain').to(0.1).at(1)
   *
   * @public
   * @property setValuesAtTime
   * @type {Ember.MutableArray}
   * @default Ember.A() via _initArrays
   */
  setValuesAtTime: null,

  /**
   * Items in this array are set immediately at play-time on the `node`.
   *
   * A convenience setter method called
   * {{#crossLink "Connection/onPlaySet:method"}}{{/crossLink}} exists for this
   * array and should be used unless it does not allow enough freedom for your
   * use-case.
   *
   * @example
   *     // at play time: connection.node.gain.setValueAtTime(0.1, audioContext.currentTime)
   *     {
   *       key: 'gain',
   *       value: 0.1
   *     }
   *     // the same thing can be accomplished like:
   *     connection.onPlaySet('gain').to(0.1)
   *
   * @public
   * @property startingValues
   * @type {Ember.MutableArray}
   * @default Ember.A() via _initArrays
   */
  startingValues: null,

  /**
   * This is the main attraction here in connection-land. All the other
   * properties in the Connection class exist to create or mutate this property.
   * Houses an AudioNode instance that will be used by an instance of the Sound
   * class.
   *
   * If this property is set directly, all of the other properties on this class
   * (except `name`) are rendered useless.
   *
   * @public
   * @property node
   * @type {AudioNode}
   */
  node: null,

  /**
   * If this is true, the AudioNode will be created every time the consuming
   * Sound instance is played.
   *
   * @public
   * @property createdOnPlay
   * @type {boolean}
   * @default false
   */
  createdOnPlay: false,

  /**
   * Allows an AudioNode's values to be set at a specific time
   * relative to the moment that it is played, every time it is played.
   *
   * Especially useful for creating/shaping an "envelope" (think "ADSR").
   *
   * @example
   *     // results in an oscillator that starts at 150Hz and quickly drops
   *     // down to 0.01Hz each time it's played
   *     const kick = audio.createOscillator({ name: 'kick' });
   *     const osc = kick.getConnection('audioSource');
   *
   *     osc.onPlaySet('frequency').to(150).at(0);
   *     osc.onPlaySet('frequency').to(0.01).at(0.1);
   *
   * @public
   * @method onPlaySet
   * @todo document 'exponential' and 'linear' options
   */
  onPlaySet(key) {
    const startingValues = this.startingValues;
    const exponentialValues = this.exponentialRampToValuesAtTime;
    const linearValues = this.linearRampToValuesAtTime;
    const valuesAtTime = this.setValuesAtTime;

    return {
      to(value) {
        const startValue = { key, value };

        startingValues.pushObject(startValue);

        return {
          at(startTime) {
            startingValues.removeObject(startValue);
            valuesAtTime.pushObject({ key, value, startTime });
          },
          endingAt(endTime, type='exponential') {
            startingValues.removeObject(startValue);

            switch (type) {
              case 'exponential':
                exponentialValues.pushObject({ key, value, endTime });
                break;
              case 'linear':
                linearValues.pushObject({ key, value, endTime });
                break;
            }
          }
        };
      }
    };
  },

  /**
   * Convenience method that uses
   * {{#crossLink "Connection/onPlaySet:method"}}{{/crossLink}} twice to set an
   * initial value, and a ramped value in succession.
   *
   * Especially useful for creating/shaping an "envelope" (think "ADSR").
   *
   * @example
   *     // results in an oscillator that starts at 150Hz and quickly drops
   *     // down to 0.01Hz each time it's played
   *     const kick = audio.createOscillator({ name: 'kick' });
   *     const osc = kick.getConnection('audioSource');
   *
   *     osc.onPlayRamp('frequency').from(150).to(0.01).in(0.1);
   *
   * @public
   * @method onPlaySet
   */
  onPlayRamp(key) {
    const onPlaySet = this.onPlaySet.bind(this);

    return {
      from(startValue) {
        return {
          to(endValue) {
            return {
              in(endTime) {
                onPlaySet(key).to(startValue);
                onPlaySet(key).to(endValue).endingAt(endTime);
              }
            };
          }
        };
      }
    };
  },

  /**
   * If any of the array types are null on init, set them to an
   * Ember.MutableArray
   *
   * @private
   * @method _initArrays
   */
  _initArrays: on('init', function() {
    const arrays = [
      'onPlaySetAttrsOnNode',
      'exponentialRampToValuesAtTime',
      'linearRampToValuesAtTime',
      'setValuesAtTime',
      'startingValues'
    ];

    arrays.map((name) => {
      if (!this.get(name)) {
        this.set(name, A());
      }
    });
  })
});

export default Connection;
