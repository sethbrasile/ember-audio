import Ember from 'ember';

export const Sound = Ember.Object.extend({
  name: null,
  node: null,
  panner: null,
  audioContext: null,
  audioBuffer: null,
  startTime: 0,
  startOffset: 0,
  isPlaying: false,

  pannerNode: null,
  gainNode: null,
  analyzerNode: null,
  analyzePreGain: false,

  _initNodes: Ember.on('init', function() {
    const ctx = this.get('audioContext');

    this.set('pannerNode', ctx.createStereoPanner());
    this.set('gainNode', ctx.createGain());
    this.set('analyzerNode', ctx.createAnalyser());
  }),

  position: Ember.computed('startOffset', function() {
    const startOffset = this.get('startOffset');
    let minutes = Math.floor(startOffset / 60);
    let seconds = (startOffset - (minutes * 60)).toFixed();

    if (seconds === '60') {
      seconds = '00';
      minutes += 1;
    } else if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return {
      raw: startOffset,
      string: `${minutes}:${seconds}`,
      obj: { minutes, seconds }
    };
  }),

  percentPlayed: Ember.computed('duration', 'startOffset', function() {
    const ratio = this.get('startOffset') / this.get('duration.raw');
    return ratio * 100;
  }),

  percentGain: Ember.computed('gainNode.gain.value', function() {
    return this.get('gainNode.gain.value') * 100;
  }),

  watchPosition: Ember.observer('isPlaying', function() {
    const ctx = this.get('audioContext');
    const startOffset = this.get('startOffset');
    const startTime = this.get('startTime');

    const animate = () => {
      if (this.get('isPlaying')) {
        this.set('startOffset', startOffset + ctx.currentTime - startTime);
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }),

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

  /**
   * play - play an audio file or a note from a sound font.
   *
   * @param  {string}   name The name of the audio file or sound font you wish to play
   * @param  {string}   note The name of the note you wish to play if "name"
   * refers to a sound font. If "name" refers to a sound font, this parameter
   * is **required**
   */
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

    node.start(0, this.get('startOffset') % buffer.duration);

    node.onended = () => this.stop();

    this.set('node', node);
    this.set('isPlaying', true);
  },

  pause() {
    this.get('node').onended = function() {};
    this.get('node').stop();
    this.set('isPlaying', false);
  },

  stop() {
    this.get('node').onended = function() {};
    this.set('startOffset', 0);
    this.get('node').stop();
    this.set('isPlaying', false);
  },

  pan(value) {
    this.get('pannerNode').pan.value = value;
  },

  changeGain(value) {
    const gainNode = this.get('gainNode');

    if (value > 1) {
      value = 1;
    } else if (value < 0) {
      value = 0;
    }

    gainNode.gain.value = value;

    this.notifyPropertyChange('percentGain')
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

    moveToOffset(amount);

    return {
      percent() {
        moveToOffset(amount * duration * 0.01);
      },

      ratio() {
        moveToOffset(amount * duration);
      }
    };
  }
});
