import Ember from 'ember';
import { Connection } from 'ember-audio';
import { zeroify } from 'ember-audio/utils';

/**
 * Provides classes that are capable of interacting with the Web Audio API's
 * AudioContext.
 *
 * @module Audio
 */

const {
  A,
  computed,
  on,
  get,
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
   * The AudioBuffer instance that provides audio data to the bufferSource connection.
   *
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
   * An array of Connection instances. Determines which AudioNode instances are
   * connected to one-another and the order in which they are connected. Starts
   * as `null` but set to an array on `init` via the
   * {{#crossLink "Sound/initConnections:method"}} initConnections{{/crossLink}}
   * method.
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
   * `gain` connection from the `connections` array, formatted as a percentage.
   *
   * @property percentGain
   * @type {number}
   */
  percentGain: computed(function() {
    return this.getNodeFrom('gain').gain.value * 100;
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
   * Plays the audio source in specified amount of seconds from "now".
   *
   * @method playIn
   *
   * @param {number} seconds Number of seconds from "now" that the audio source
   * should be played.
   */
  playIn(seconds) {
    this._play(this.get('audioContext.currentTime') + seconds);
  },

  /**
   * Stops the audio source immediately.
   *
   * @todo add timed stop methods
   * @method stop
   */
  stop() {
    const node = this.getNodeFrom('bufferSource');

    if (node) {
      node.stop();
      this.set('isPlaying', false);
    }
  },

  /**
   * returns a connection's AudioNode from the connections array by the
   * connection's `name`.
   *
   * @method getNodeFrom
   *
   * @param {string} name The name of the AudioNode that should be returned.
   *
   * @return {AudioNode} The requested AudioNode.
   */
  getNodeFrom(name) {
    const connection = this.getConnection(name);

    if (connection) {
      return get(connection, 'node');
    }
  },

  /**
   * returns a connection from the connections array by it's name
   *
   * @method getConnection
   *
   * @param {string} name The name of the AudioNode that should be returned.
   *
   * @return {Connection} The requested Connection.
   */
  getConnection(name) {
    return this.get('connections').findBy('name', name);
  },

  /**
   * Gets the `panner` connection and changes it's pan value to the value passed in.
   *
   * @param {number} value The value, between -1 and 1 that the `panner` connection's
   * `pan.value` should be set to.
   *
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
    this.get('connections').removeObject(this.getConnection(name));
  },

  /**
   * Initializes default connections on Sound instantiation. Runs `on('init')`.
   *
   * @protected
   * @method _initConnections
   */
  _initConnections: on('init', function() {
    const bufferSource = Connection.create({
      name: 'bufferSource',
      createdOnPlay: true,
      source: 'audioContext',
      createCommand: 'createBufferSource',
      onPlaySetAttrsOnNode: [
        {
          attrNameOnNode: 'buffer',
          relativePath: 'audioBuffer'
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

    this._wireConnections();

    this.getNodeFrom('bufferSource').start(playAt, this.get('startOffset'));

    this.set('_startedPlayingAt', playAt);

    if (playAt === currentTime) {
      this.set('isPlaying', true);
    } else {
      later(() => this.set('isPlaying', true), (playAt - currentTime) * 1000);
    }
  },

  /**
   * Gets the array of Connection instances from the connections array and
   * returns the same array, having created any AudioNode instances that needed
   * to be created, and having connected the AudioNode instances to one another
   * in the order in which they were present in the connections array.
   *
   * @method _wireConnections
   * @private
   *
   * @return {array|Connection} Array of Connection instances collected from the
   * connections array, created, connected, and ready to play.
   */
  _wireConnections() {
    const createNode = this._createNode.bind(this);
    const setAttrsOnNode = this._setAttrsOnNode.bind(this);
    const wireConnection = this._wireConnection;
    const connections = this.get('connections');

    connections.map(createNode).map(setAttrsOnNode).map(wireConnection);
  },

  /**
   * Creates an AudioNode instance for a Connection instance and sets it on it's
   * `node` property. Unless the Connection instance's `createdOnPlay` property
   * is true, does nothing if the AudioNode instance has already been created.
   *
   * Also sets any properties from a connection's `onPlaySetAttrsOnNode` array
   * on the node.
   *
   * @method _createNode
   * @private
   *
   * @param {Connection} connection A Connection instance that should have it's
   * node created (if needed).
   *
   * @return {Connection} The input Connection instance after having it's node
   * created.
   */
  _createNode(connection) {
    const { path, name, createdOnPlay, source, createCommand, node } = connection;

    if (node && !createdOnPlay) {
      // The node is already created and doesn't need to be created again
      return connection;
    } else if (path) {
      connection.node = this.get(path);
    } else if (createCommand && source) {
      connection.node = this.get(source)[createCommand]();
    } else if (!connection.node) {
      console.error('ember-audio:', `The ${name} connection is not configured correctly. Please fix this connection.`);
      return;
    }

    return connection;
  },

  /**
   * Gets a Connection instance's `onPlaySetAttrsOnNode` and sets them on it's
   * node.
   *
   * @private
   * @method _setAttrsOnNode
   *
   * @param {Connection} The Connection instance that needs it's node's attrs
   * set.
   *
   * @return {Connection} The input Connection instance after having it's nodes
   * attrs set.
   */
  _setAttrsOnNode(connection) {
    connection.get('onPlaySetAttrsOnNode').map((attr) => {
      const { attrNameOnNode, relativePath, value } = attr;
      const attrValue = relativePath ? this.get(relativePath) || value : value;
      set(connection.node, attrNameOnNode, attrValue);
    });

    return connection;
  },

  /**
   * Meant to be passed to a Array.prototype.map function. Connects a Connection
   * instance's node to the next Connection instance's node.
   *
   * @private
   * @method _wireConnection
   *
   * @param {Connection} connection The current Connection instance in the
   * iteration.
   *
   * @param {number} idx The index of the current iteration.
   *
   * @param {array|Connection} connections The original array of connections.
   *
   * @return {Connection} The input Connection instance after having it's node
   * connected to the next Connection instance's node.
   */
  _wireConnection(connection, idx, connections) {
    const nextIdx = idx + 1;
    const currentNode = connection;

    if (nextIdx < connections.length) {
      const nextNode = connections[nextIdx];

      // Assign nextConnection back to connections array.
      // Since we're working one step ahead, we don't want
      // each connection created twice
      connections[nextIdx] = nextNode;

      // Make the connection from current to next
      currentNode.node.connect(nextNode.node);
    }

    return currentNode;
  }
});

export default Sound;
