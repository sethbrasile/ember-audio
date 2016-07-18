import Ember from 'ember';
import { Connection } from 'ember-audio';

const {
  inject: { service },
  on,
  Controller
} = Ember;

export default Controller.extend({
  audio: service(),
  distortionEnabled: false,

  initAudioFile: on('init', function() {
    // Eb5.mp3 is an mp3 file located in the "public" folder
    this.get('audio').load('/ember-audio/Eb5.mp3').asSound('distorted-piano-note').then((note) => {

      // Create the connection and insert it into the note's connections array
      note.get('connections').insertAt(1, Connection.create({
        name: 'distortionNode',
        source: 'audioContext',
        createCommand: 'createWaveShaper'
      }));

      // Connections are usually lazily initilized when a sound is played.
      // We need connections to exist before then in case the user enables
      // distortion before the sound is played.
      note.initializeConnections();

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
    const note = this.get('note');

    this.set('distortionEnabled', true);

    // lower note's gain because distorted signal has much more apparent volume
    note.changeGainTo(0.1).from('ratio');

    // Set distortionNode's curve to enable distortion
    note.getNodeFrom('distortionNode').curve = curve;
  },

  _removeDistortion() {
    const note = this.get('note');

    this.set('distortionEnabled', false);

    // raise note's gain because clean signal has much less apparent volume
    note.changeGainTo(1).from('ratio');

    // Set distortionNode's curve to null to disable distortion
    note.getNodeFrom('distortionNode').curve = null;
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
