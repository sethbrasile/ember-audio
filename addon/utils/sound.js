import Ember from 'ember';
import zeroify from './zeroify';

const {
  A,
  computed,
  copy,
  on
} = Ember;

function getConnection(ctx, node) {
  const cmd = node ? node.createCommand : false;

  // if connection has "createCommand", the node needs to be created
  if (cmd && typeof cmd === 'string') {
    return { node: ctx[cmd]() };

  // if connection already has "node" then the node has already been created
} else if (node && node.node) {
    return node;
  }
}

const Sound = Ember.Object.extend({
  name: null,
  node: null,
  panner: null,
  audioContext: null,
  audioBuffer: null,
  connections: null,
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

  percentGain: computed('gainNode.gain.value', function() {
    return this.get('gainNode.gain.value') * 100;
  }),

  _initDefaultNodes: on('init', function() {
    if (!this.get('connections')) {
      this.set('connections', A([
        {
          name: 'pannerNode',
          createCommand: 'createStereoPanner',
        },
        {
          name: 'gainNode',
          createCommand: 'createGain',
        }
      ]));
    }

    this.get('connections').map((connection) => {
      const { name, node } = connection;
      this.set(name, node);
    });
  }),

  play() {
    const ctx = this.get('audioContext');
    const buffer = this.get('audioBuffer');
    const node = ctx.createBufferSource();
    const connections = A(copy(this.get('connections')));

    node.buffer = buffer;

    // Push bufferSource to first connection
    connections.unshiftObject({ name: 'bufferSource', node });

    // Push ctx.destination to last connection
    connections.pushObject({ name: 'destination', node: ctx.destination });

    // Each node is connected to the next node in the connections array
    connections.map((currentConnection, index) => {
      const nextConnectionIndex = index + 1;
      const nextConnection = getConnection(ctx, connections[nextConnectionIndex]);

      // Assign getConnection'd connection back to connections array.
      // Since we're referencing the next item in the array,
      // that node would be created twice if we didn't
      connections[nextConnectionIndex] = nextConnection;

      if (nextConnection) {
        currentConnection.node.connect(nextConnection.node);
      }
    });

    this.set('startedPlayingAt', ctx.currentTime);

    if (this.get('simultaneousPlayAllowed')) {
      node.start();
    } else {
      node.start(0, this.get('startOffset') % buffer.duration);
    }

    this.set('node', node);
    this.set('isPlaying', true);
  },

  stop() {
    const node = this.get('node');

    if (node) {
      node.stop();
      this.set('isPlaying', false);
    }
  },

  pan(value) {
    this.get('pannerNode').pan.value = value;
  },

  changeGain(value) {
    const gainNode = this.get('gainNode');
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
  }
});

export default Sound;
