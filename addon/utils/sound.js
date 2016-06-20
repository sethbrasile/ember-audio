import Ember from 'ember';

export const Sound = Ember.Object.extend({
  node: null,
  panner: null,
  audioContext: null,
  audioBuffer: null,

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
    node.start();

    this.set('node', node);
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
