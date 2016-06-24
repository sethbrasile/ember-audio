import Ember from 'ember';

const Sound = Ember.Object.extend({
  name: null,
  node: null,
  panner: null,
  audioContext: null,
  audioBuffer: null,
  startTime: 0,
  startOffset: 0,
  isPlaying: false,
  simultaneousPlayAllowed: true,

  pannerNode: null,
  gainNode: null,
  analyzerNode: null,
  analyzePreGain: false,

  duration: Ember.computed('audioBuffer.duration', function() {
    const duration = this.get('audioBuffer.duration');
    const minutes = (duration / 60).toFixed();
    const seconds = (duration % 60).toFixed();

    return {
      raw: duration,
      string: `${minutes}:${seconds}`,
      obj: { minutes, seconds }
    };
  }),

  percentGain: Ember.computed('gainNode.gain.value', function() {
    return this.get('gainNode.gain.value') * 100;
  }),

  _initNodes: Ember.on('init', function() {
    const ctx = this.get('audioContext');

    this.set('pannerNode', ctx.createStereoPanner());
    this.set('gainNode', ctx.createGain());
    this.set('analyzerNode', ctx.createAnalyser());
  }),

  play() {
    const ctx = this.get('audioContext');

    const panner = this.get('pannerNode');
    const gainNode = this.get('gainNode');
    const analyzer = this.get('analyzerNode');

    const buffer = this.get('audioBuffer');
    const node = ctx.createBufferSource();

    node.buffer = buffer;

    node.connect(panner);
    panner.connect(gainNode);

    if (this.get('analyzePreGain')) {
      analyzer.connect(gainNode);
      gainNode.connect(ctx.destination);
    } else {
      gainNode.connect(analyzer);
      analyzer.connect(ctx.destination);
    }

    this.set('startTime', ctx.currentTime);

    if (this.get('simultaneousPlayAllowed')) {
      node.start();
    } else {
      node.start(0, this.get('startOffset') % buffer.duration);
    }

    this.set('node', node);
    this.set('isPlaying', true);
  },

  stop() {
    if (this.get('node')) {
      this.get('node').stop();
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
        } else if (type === 'reverseRatio') {
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
        } else if (type === 'seconds') {
          moveToOffset(amount);
        }
      }
    };
  }
});

export default Sound;
