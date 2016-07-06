import Ember from 'ember';
import zeroify from './zeroify';

const {
  A,
  computed,
  copy,
  on
} = Ember;

const Sound = Ember.Object.extend({
  name: null,
  node: null,
  panner: null,
  audioContext: null,
  audioBuffer: null,
  startedPlayingAt: 0,
  startOffset: 0,
  isPlaying: false,
  simultaneousPlayAllowed: true,

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

  percentGain: computed(function() {
    return this.getNode('gainNode').gain.value * 100;
  }),

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
        onPlaySetAttrOnNode: {
          attrNameOnNode: 'buffer',
          relativePath: 'audioBuffer'
        }
      },
      {
        name: 'gainNode',
        source: 'audioContext',
        createCommand: 'createGain',
      },
      {
        name: 'pannerNode',
        source: 'audioContext',
        createCommand: 'createStereoPanner',
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

  play() {
    const connections = copy(this.get('createdConnections'));

    // Each node is connected to the next node in the connections array
    connections.map((currentConnection, index) => {
      const nextConnectionIndex = index + 1;
      const nextConnection = this._getConnection(connections[nextConnectionIndex]);
      currentConnection = this._getConnection(currentConnection);

      const { createdOnPlay, name, node } = currentConnection;

      if (createdOnPlay) {
        this.set(name, node);
      }

      if (nextConnection) {
        // Assign nextConnection back to connections array.
        // Since we're working one step ahead, we don't want
        // each connection created twice
        connections[nextConnectionIndex] = nextConnection;

        // Make the connection from current to next
        currentConnection.node.connect(nextConnection.node);
      }

      return currentConnection;
    });

    let node = A(connections).get('firstObject.node');

    if (this.get('simultaneousPlayAllowed')) {
      node.start();
    } else {
      node.start(0, this.get('startOffset') % node.buffer.duration);
    }

    this.set('startedPlayingAt', this.get('audioContext.currentTime'));
    this.set('isPlaying', true);
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
    return this.get('createdConnections').findBy('name', name).node;
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

  _getConnection(node) {
    if (node) {
      const { createdOnPlay, source, createCommand, onPlaySetAttrOnNode } = node;

      if (createdOnPlay) {
        node.node = this.get(source)[createCommand]();
      }

      if (onPlaySetAttrOnNode) {
        let { attrNameOnNode, relativePath } = onPlaySetAttrOnNode;
        node.node[attrNameOnNode] = this.get(relativePath);
      }

      return node;
    }
  }
});

export default Sound;
