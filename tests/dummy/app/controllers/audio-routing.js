import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),

  initAudioFile: Ember.on('init', function() {
    // Eb5.mp3 is an mp3 file located in the "public" folder
    this.get('audio').load('/ember-audio/Eb5.mp3').asSound('piano-note').then((note) => {
      this.set('note', note);
    });
  }),

  distortionEnabled: Ember.computed('note.connections.[]', function() {
    const note = this.get('note');

    if (note) {
      return !!note.getNode('distortionNode');
    }
  }),

  _makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    let x;

    for (let i = 0; i < n_samples; ++i) {
      x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }

    return curve;
  },

  _addDistortion() {
    const distortion = this.get('audio.context').createWaveShaper();

    distortion.curve = this._makeDistortionCurve(400);
    distortion.oversample = '4x';

    // insert the distortion node right after the audio source
    // (audio source is at index 0)
    this.get('note.connections').insertAt(1, {
      name: 'distortionNode',
      node: distortion
    });

    // Reduce gain since the distorted sound has much more apparent volume
    this.get('note').changeGainTo(0.1).from('ratio');
  },

  _removeDistortion() {
    this.get('note').removeNode('distortionNode');
    return;
  },

  actions: {
    playSound() {
      this.get('note').play();
    },

    toggleDistortion() {
      if (this.get('distortionEnabled')) {
        this._removeDistortion();
      } else {
        this._addDistortion();
      }
    }
  }
});
