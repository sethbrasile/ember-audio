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
  durationOutputType: false, // default

  position: Ember.computed('startOffset', function() {
    const startOffset = this.get('startOffset');
    const minutes = (startOffset / 60).toFixed();
    let seconds = (startOffset % 60).toFixed();

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }),

  trackPlayhead: Ember.observer('isPlaying', function() {
    const ctx = this.get('audioContext');
    const startOffset = this.get('startOffset');
    const startTime = this.get('startTime');

    const animate = () => {
      if (this.get('isPlaying')) {
        this.set('startOffset', startOffset + ctx.currentTime - startTime);
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }),

  duration: Ember.computed('audioBuffer.duration', function() {
    const duration = this.get('audioBuffer.duration');
    const outputType = this.get('durationOutputType');
    const minutes = (duration / 60).toFixed();
    const seconds = (duration % 60).toFixed();

    switch(outputType) {
      case 'raw':
        return duration;
      case 'string':
        return `${minutes}:${seconds}`;
      default:
        return { minutes, seconds };
    }
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
    const buffer = this.get('audioBuffer');
    const panner = this.get('panner');
    const node = ctx.createBufferSource();
    const analyser = ctx.createAnalyser();
    let lastConnection;

    node.buffer = buffer;

    node.connect(analyser);

    if (panner) {
      analyser.connect(panner);
      lastConnection = panner;
    } else {
      lastConnection = analyser;
    }

    lastConnection.connect(ctx.destination);

    this.set('startTime', ctx.currentTime);

    node.start(0, this.get('startOffset') % buffer.duration);

    this.set('analyser', analyser);
    this.set('node', node);
    this.set('isPlaying', true);
  },

  pause() {
    this.get('node').stop();
    this.set('isPlaying', false);
  },

  stop() {
    this.set('startOffset', 0);
    this.get('node').stop();
    this.set('isPlaying', false);
  },

  pan(value) {
    let panner = this.get('panner');

    if (!panner) {
      panner = this.get('audioContext').createStereoPanner();
    }

    panner.pan.value = value;

    this.set('panner', panner);
  }
});
