import Ember from 'ember';

export const Sound = Ember.Object.extend({
  name: null,
  node: null,
  panner: null,
  audioContext: null,
  audioBuffer: null,
  startTime: 0,
  position: 0,
  durationOutputType: false, // default

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

    if (panner) {
      node.connect(panner);
      panner.connect(ctx.destination);
    } else {
      node.connect(ctx.destination);
    }

    node.buffer = buffer;

    this.set('startTime', ctx.currentTime);

    node.start(0, this.get('position') % buffer.duration);

    this.set('node', node);
  },

  pause() {
    const ctx = this.get('audioContext');
    const startTime = this.get('startTime');
    const position = this.get('position');
    const newOffset = position + (ctx.currentTime - startTime);

    this.get('node').stop();

    this.set('position', newOffset);
  },

  stop() {
    this.set('position', 0);
    this.get('node').stop();
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
