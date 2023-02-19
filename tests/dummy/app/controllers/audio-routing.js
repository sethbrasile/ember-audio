import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import Controller from '@ember/controller';
import { Connection } from 'ember-audio';

export default Controller.extend({
  audio: service(),
  distortionEnabled: false,

  initAudioFile: on('init', function() {
    // Eb5.mp3 is an mp3 file located in the "public" folder
    this.audio.load('/ember-audio/Eb5.mp3').asSound('distorted-piano-note').then((note) => {

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
    const numSamples = 44100;
    const curve = new Float32Array(numSamples);
    const deg = Math.PI / 180;

    for (let i = 0; i < numSamples; ++i) {
      let x = i * 2 / numSamples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }

    return curve;
  },

  _addDistortion() {
    const curve = this._makeDistortionCurve(400);
    const note = this.note;

    this.set('distortionEnabled', true);

    // lower note's gain because distorted signal has much more apparent volume
    note.changeGainTo(0.1).from('ratio');

    // Set distortionNode's curve to enable distortion
    note.getNodeFrom('distortionNode').curve = curve;
  },

  _removeDistortion() {
    const note = this.note;

    this.set('distortionEnabled', false);

    // raise note's gain because clean signal has much less apparent volume
    note.changeGainTo(1).from('ratio');

    // Set distortionNode's curve to an empty Float32Array to disable distortion
    note.getNodeFrom('distortionNode').curve = new Float32Array();
  },

  actions: {
    playSound() {
      this.note.play();
    },

    toggleDistortion() {
      if (this.distortionEnabled) {
        this._removeDistortion();
      } else {
        this._addDistortion();
      }
    }
  }
});
