import Ember from 'ember';
import zeroify from '../utils/zeroify';

const {
  A,
  computed,
  on,
  set,
  run: { later }
} = Ember;

/**
 * This is the base class for all Sound types. It represents a sound. It
 * prepares an audio source, provides various methods for interacting with
 * the audio source, creates
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNodes}
 * from the connections array, sets up the necessary connections/routing
 * between them, and provides a few methods to {@link Sound#play play} and
 * {@link Sound#stop stop} the audio source.
 *
 * <style>
 *   .ignore-this--this-is-here-to-hide-constructor,
 *   #Sound { display: none; }
 * </style>
 *
 * @see Track
 * @see Note
 * @see BeatTrack
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
 *
 * @class Sound
 * @extends Ember.Object
 *
 * @property {string} name Name that this Sound instance is registered as on
 * it's parent register.
 *
 * @property {AudioContext} audioContext The parent
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
 * instance.
 *
 * @property {number} startOffset When a Sound instance plays, this is value is
 * passed to the AudioBufferSourceNode's `offset` param. Determines `where`
 * (in seconds) the play will start, along the duration of the audio source.
 *
 * @property {boolean} isPlaying Whether the instance currently playing audio.
 *
 * @property {object<Computed>} duration Computed property. See
 * {@link Sound#duration duration}.
 *
 * @property {number<Computed>} percentGain Computed property. See
 * {@link Sound#percentGain percentGain}
 */
const Sound = Ember.Object.extend({

  /**
   * Name that this Sound instance is registered as on it's parent register.
   *
   * @memberof Sound
   * @type {string}
   * @instance
   * @readonly
   */
  name: null,

  /**
   * The Sound instance's audio source node.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode AudioBufferSourceNode}
   *
   * @memberof Sound
   * @type {AudioBufferSourceNode}
   * @instance
   * @readonly
   * @private
   */
  bufferSourceNode: null,

  /**
   * The
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer AudioBuffer}
   * instance that provides audio data to the
   * {@link Sound#bufferSourceNode bufferSourceNode}.
   *
   * @memberof Sound
   * @type {AudioBuffer}
   * @instance
   * @readonly
   * @private
   */
  audioBuffer: null,

  /**
   * The parent
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
   * instance that all audio events are occurring within. It is useful for
   * getting currentTime, as well as creating new
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNodes}.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
   *
   * @memberof Sound
   * @type {AudioContext}
   * @instance
   * @readonly
   */
  audioContext: null,

  /**
   * When a Sound instance plays, this is set to the `audioContext.currentTime`.
   * It will always reflect the start time of the most recent Sound#_play.
   *
   * @memberof Sound
   * @type {number}
   * @instance
   * @readonly
   * @private
   */
  startedPlayingAt: 0,

  /**
   * When a Sound instance plays, this value is passed to the
   * AudioBufferSourceNode#start `offset` param. Determines `where` (in seconds)
   * the play will start, along the duration of the audio source.
   *
   * @memberof Sound
   * @type {number}
   * @instance
   */
  startOffset: 0,

  /**
   * Whether a sound is playing or not. Becomes true when a Sound instance
   * starts playing audio. Becomes false when the Sound instance is stopped or
   * ends via reaching the end of it's duration.
   *
   * @memberof Sound
   * @type {number}
   * @instance
   * @readonly
   */
  isPlaying: false,

  /**
   * Computed property. Value is an object containing the duration of the
   * {@link Sound#audioBuffer audioBuffer} in three formats. The three formats
   * are `raw`, `string`, and `pojo`.
   *
   * 6 minutes would be output as:
   *
   *     {
   *       raw: 360, // seconds
   *       string: '06:00',
   *       pojo: {
   *         minutes: '06',
   *         seconds: '00'
   *       }
   *     }
   *
   * @memberof Sound
   * @type {object}
   * @observes 'audioBuffer.duration'
   * @instance
   * @readonly
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
   * @memberof Sound
   * @type {number}
   * @instance
   * @readonly
   */
  percentGain: computed(function() {
    return this.getNode('gainNode').gain.value * 100;
  }),

  // Keep in mind that this is recomputed when the connections array changes.
  // Adjustments to node parameter values must take place AFTER connections are
  // set up and again any time the connections array is changed, otherwise the
  // adjusted values will be ignored, and default values will be used instead

  /**
   * Computed property. Recreates all the connection's AudioNodes whenever the
   * connections array changes.
   *
   * @memberof Sound
   * @type {number}
   * @instance
   * @readonly
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
   * @memberof Sound
   * @instance
   */
  play() {
    this._play(this.get('audioContext.currentTime'));
  },

  /**
   * Plays the audio source at the specified time. A "moment in time" is
   * measured in seconds from the moment that {@link Sound#audioContext} was
   * instantiated.
   *
   * @method playAt
   *
   * @param {number} time Moment in time when the audio source should be played.
   *
   * @memberof Sound
   * @instance
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
   *
   * @memberof Sound
   * @instance
   */
  playIn(amount) {
    this._play(this.get('audioContext.currentTime') + amount);
  },

  stop() {
    const node = this.get('bufferSourceNode');

    if (node) {
      node.stop();
      this.set('isPlaying', false);
    }
  },

  pan(value) {
    this.getNode('pannerNode').pan.value = value;
  },

  getNode(name) {
    const connection = this.get('createdConnections').findBy('name', name);

    if (connection) {
      return connection.node;
    }
  },

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
      from(type='ratio') {
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

  removeConnection(name) {
    const connections = this.get('connections');
    const node = connections.findBy('name', name);
    connections.removeObject(node);
  },

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

  _createNode(node) {
    const { name, createdOnPlay, source, createCommand, onPlaySetAttrsOnNode } = node;

    if (createdOnPlay) {
      node.node = this.get(source)[createCommand]();
      this.set(name, node.node);
    }

    if (onPlaySetAttrsOnNode) {
      onPlaySetAttrsOnNode.map((attr) => {
        let { attrNameOnNode, relativePath } = attr;
        set(node.node, attrNameOnNode, this.get(relativePath));
      });
    }

    return node;
  }
});

export default Sound;
