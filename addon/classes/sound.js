import Ember from 'ember';
import zeroify from '../utils';

/**
 * The Sound class provides the core functionality for interacting with the Web
 * Audio API's AudioContext, and is the base class for all of the other classes
 * in the Audio module.
 *
 * @module Audio
 * @submodule Sound
 */

const {
  A,
  computed,
  on,
  set,
  run: { later }
} = Ember;

/**
 * The Sound class provides the core functionality for
 * interacting with the Web Audio API's AudioContext, and is the base class for
 * all other {{#crossLinkModule "Audio"}}{{/crossLinkModule}} types. It prepares
 * an audio source, provides various methods for interacting with the audio source,
 * creates {{#crossLink "AudioNode"}}AudioNodes{{/crossLink}} from the
 * connections array, sets up the necessary connections/routing between them,
 * and provides some methods to {{#crossLink "Sound/play:method"}}{{/crossLink}}
 * and {{#crossLink "Sound/stop:method"}}{{/crossLink}} the audio source.
 *
 * @class Sound
 */
const Sound = Ember.Object.extend({

  /**
   * When using the {{#crossLink "Audio-Service"}}{{/crossLink}}, The name that
   * this Sound instance is registered as on it's parent register.
   *
   * @property name
   * @type {string}
   */
  name: null,

  /**
   * The Sound instance's [audio source node](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode).
   *
   * @property bufferSourceNode
   * @type {AudioBufferSourceNode}
   * @private
   */
  bufferSourceNode: null,

  /**
   * The AudioBuffer instance that provides audio data to the
   * {{#crossLink "Sound/bufferSourceNode:property"}}bufferSourceNode{{/crossLink}}.
   *
   * @property audioBuffer
   * @type {AudioBuffer}
   * @private
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
   * @property audioContext
   * @type {AudioContext}
   */
  audioContext: null,

  /**
   * When a Sound instance plays, this is set to the `audioContext.currentTime`.
   * It will always reflect the start time of the most recent
   * {{#crossLink "Sound/_play:method"}}{{/crossLink}}.
   *
   * @property startedPlayingAt
   * @type {number}
   * @private
   */
  startedPlayingAt: 0,

  /**
   * When a Sound instance is played, this value is passed to the
   * {{#crossLink "AudioBufferSourceNode/start:method"}}AudioBufferSourceNode.start(){{/crossLink}}
   * `offset` param. Determines `where` (in seconds) the play will start, along
   * the duration of the audio source.
   *
   * @property startOffset
   * @type {number}
   */
  startOffset: 0,

  /**
   * Whether a sound is playing or not. Becomes true when a Sound instance
   * starts playing audio. Becomes false when the Sound instance is stopped or
   * ends by reaching the end of it's duration.
   *
   * @property isPlaying
   * @type {boolean}
   * @default false
   */
  isPlaying: false,

  /**
   * Determines what AudioNodes are connected to one-another and the order in
   * which they are connected. Starts as `null` but set to an array on `init`
   * via the {{#crossLink "Sound/initConnections:method"}}
   * initConnections{{/crossLink}} method.
   *
   * @property connections
   * @type {Ember.MutableArray}
   */
  connections: null,

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
   * `gainNode` of the `connections` array, formatted as a percentage.
   *
   * @property percentGain
   * @type {number}
   */
  percentGain: computed(function() {
    return this.getNode('gainNode').gain.value * 100;
  }),

  /**
   * Computed property. Recreates all the connection's AudioNodes whenever the
   * connections array changes. Any values that have been set on a node before
   * the connections array changes will need to be re-set after the connections
   * array changes.
   *
   * Doesn't create an AudioNode for any connection that has `createdOnPlay === true`
   *
   * @todo Get rid of need to re-set AudioNode param values after changing.
   * Probably just get rid of this.
   * [This](https://github.com/sethbrasile/ember-audio/blob/master/tests/dummy/app/controllers/audio-routing.js#L50)
   * should be OK at the top of the method, but right now it's not.
   *
   * @private
   * @property createdConnections
   * @type {number}
   */
  createdConnections: computed('connections.[]', function() {
    const connections = this.get('connections').map((connection) => {
      const { path, name, createCommand, source, createdOnPlay } = connection;

      if (path) {
        connection.node = this.get(path);
      } else if (createCommand && source && !createdOnPlay) {
        connection.node = this.get(source)[createCommand]();
      } else if (!createdOnPlay && !connection.node) {
        console.error('ember-audio:', `The ${name} connection is not configured correctly. Please fix this connection.`);
        return;
      }

      return connection;
    });

    return A(connections);
  }),

  /**
   * Initializes default connections on Sound instantiation. Runs `on('init')`.
   *
   * @method initConnections
   *
   * @todo Create an actual Connection class to clarify the API for creating
   * custom AudioNodes
   */
  initConnections: on('init', function() {
    this.set('connections', A([
      {
        name: 'bufferSourceNode',
        createdOnPlay: true,
        source: 'audioContext',
        createCommand: 'createBufferSource',
        onPlaySetAttrsOnNode: [
          {
            attrNameOnNode: 'buffer',
            relativePath: 'audioBuffer'
          }
        ]
      },
      {
        name: 'gainNode',
        source: 'audioContext',
        createCommand: 'createGain'
      },
      {
        name: 'pannerNode',
        source: 'audioContext',
        createCommand: 'createStereoPanner'
      },
      {
        name: 'destination',
        path: 'audioContext.destination'
      }
    ]));

    // We're not consuming the CP anywhere until "play" is called, but we want
    // the nodes available before that
    this.get('createdConnections');
  }),

  /**
   * Plays the audio source immediately.
   *
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
   * Functionally equivalent to {{#crossLink "Sound/_play:method"}}{{/crossLink}}.
   *
   * @param {number} time The moment in time (in seconds, relative to the
   * {{#crossLink "AudioContext"}}AudioContext's{{/crossLink}} "beginning of
   * time") when the audio source should be played.
   *
   * @method playAt
   */
  playAt(time) {
    this._play(time);
  },

  /**
   * Plays the audio source in `${amount}` seconds.
   *
   * @method playIn
   *
   * @param {number} amount Number of seconds from "now" that the audio source
   * should be played.
   */
  playIn(amount) {
    this._play(this.get('audioContext.currentTime') + amount);
  },

  /**
   * Stops the audio source immediately.
   *
   * @todo add timed stop methods
   * @method stop
   */
  stop() {
    const node = this.get('bufferSourceNode');

    if (node) {
      node.stop();
      this.set('isPlaying', false);
    }
  },

  /**
   * returns a connection's AudioNode from the createdConnections array by it's
   * `name`.
   *
   * @param {string} name The name of the AudioNode that should be returned.
   *
   * @method getNode
   * @return {AudioNode} The requested AudioNode.
   */
  getNode(name) {
    const connection = this.get('createdConnections').findBy('name', name);

    if (connection) {
      return connection.node;
    }
  },

  /**
   * Gets the `pannerNode` and changes it's pan value to the value passed in.
   *
   * @param {number} value The value, between -1 and 1 that the `pannerNode`'s
   * `pan.value` should be set to.
   *
   * @method pan
   * @todo Make "API" match "changeGainTo"
   */
  pan(value) {
    this.getNode('pannerNode').pan.value = value;
  },

  /**
   * Gets the `gainNode` and changes it's gain value to the value passed in.
   * returns a pojo with the `from` method that `value` is curried to, allowing
   * one to specify which type of value is being provided.
   *
   * @example
   *     // these all result in gainNode.gain.value === 0.9
   *     soundInstance.changeGainTo(0.9).from('ratio');
   *     soundInstance.changeGainTo(0.1).from('inverseRatio')
   *     soundInstance.changeGainTo(90).from('percent');
   *
   * @param {number} value The value that the `gainNode`'s `gain.value` should
   * be set to. Can be a ratio, an inverseRatio or a percentage.
   *
   * @method changeGainTo
   *
   * @return {object} Intermediary POJO containing the `from` method which will
   * determine the type of value that `gain.value` is being set to and make the
   * change accordingly.
   */
  changeGainTo(value) {
    const gainNode = this.getNode('gainNode');
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
   * Gets the bufferSourceNode and stops the audio,
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
  },

  /**
   * Find's a connection in the connections array by it's `name` and removes it.
   *
   * @param {string} name The name of the connection that should be removed.
   *
   * @method removeConnection
   */
  removeConnection(name) {
    const connections = this.get('connections');
    const node = connections.findBy('name', name);
    connections.removeObject(node);
  },

  /**
   * The underlying method that backs the
   * {{#crossLink "Sound/play:method"}}{{/crossLink}},
   * {{#crossLink "Sound/playAt:method"}}{{/crossLink}}, and
   * {{#crossLink "Sound/playIn:method"}}{{/crossLink}} methods.
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
    const connections = this._wireUpConnections();
    const node = connections[0].node;

    node.start(playAt, this.get('startOffset'));

    this.set('startedPlayingAt', playAt);

    if (playAt === currentTime) {
      this.set('isPlaying', true);
    } else {
      later(() => this.set('isPlaying', true), (playAt - currentTime) * 1000);
    }
  },

  /**
   * Gets the array of connections from the
   * createdConnections computed property and
   * returns the same array with any AudioNodes that need to be created at
   * {{#crossLink "Sound/_play:method"}}{{/crossLink}} time having been created.
   *
   * @method _wireUpConnections
   * @private
   */
  _wireUpConnections() {
    // Each node is connected to the next node in the connections array
    return this.get('createdConnections').map((connection, idx, connections) => {
      const nextIdx = idx + 1;
      const currentNode = this._createNode(connection);

      if (nextIdx < connections.length) {
        const nextNode = this._createNode(connections[nextIdx]);

        // Assign nextConnection back to connections array.
        // Since we're working one step ahead, we don't want
        // each connection created twice
        connections[nextIdx] = nextNode;

        // Make the connection from current to next
        currentNode.node.connect(nextNode.node);
      }

      return currentNode;
    });
  },

  /**
   * Performs the actual AudioNode creation for the
   * {{#crossLink 'Sound/_wireUpConnections:method'}}{{/crossLink}} method.
   *
   * Also sets any properties from a connection's `onPlaySetAttrsOnNode` array
   * on the node.
   *
   * @method _createNode
   * @private
   */
  _createNode(connection) {
    const { name, createdOnPlay, source, createCommand, onPlaySetAttrsOnNode } = connection;

    if (createdOnPlay) {
      connection.node = this.get(source)[createCommand]();
      this.set(name, connection.node);
    }

    if (onPlaySetAttrsOnNode) {
      onPlaySetAttrsOnNode.map((attr) => {
        let { attrNameOnNode, relativePath } = attr;
        set(connection.node, attrNameOnNode, this.get(relativePath));
      });
    }

    return connection;
  }
});

export default Sound;
