import Ember from 'ember';
import { Connection } from 'ember-audio';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  distortionEnabled: false,

  initAudioFile: Ember.on('init', function() {
    // Eb5.mp3 is an mp3 file located in the "public" folder
    this.get('audio').load('/ember-audio/Eb5.mp3').asSound('piano-note').then((note) => {

      // Create the connection and insert it into the note's connections array
      note.get('connections').insertAt(1, Connection.create({
        name: 'distortionNode',
        source: 'audioContext',
        createCommand: 'createWaveShaper'
      }));

      this.set('note', note);
    });
  }),

  _makeDistortionCurve(amount) {
    // I stole this straight from the Mozilla Web Audio API docs site
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; ++i) {
      let x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }

    return curve;
  },

  _addDistortion() {
    const curve = this._makeDistortionCurve(400);
    const note = this.get('note');

    this.set('distortionEnabled', true);

    // lower note's gain because distorted signal has much more apparent volume
    note.changeGainTo(0.1).from('ratio');

    // Set distortionNode's curve to enable distortion
    note.getNode('distortionNode').curve = curve;
  },

  _removeDistortion() {
    const note = this.get('note');

    this.set('distortionEnabled', false);

    // raise note's gain because clean signal has much less apparent volume
    note.changeGainTo(1).from('ratio');

    // Set distortionNode's curve to null to disable distortion
    note.getNode('distortionNode').curve = null;
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
