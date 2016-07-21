import Ember from 'ember';
import { LayeredSound } from 'ember-audio';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  drums: null,

  initDrums: Ember.on('init', function() {
    this.set('drums', [
      this._createKick(),
      this._createSnare(),
      this._createHihat()
    ]);
  }),

  _createKick() {
    const audio = this.get('audio');
    const kick = audio.createOscillator({ name: 'kick' });
    const osc = kick.getConnection('audioSource');
    const gain = kick.getConnection('gain');

    osc.setValueFor('frequency').to(150).at(0);
    gain.setValueFor('gain').to(1).at(0);

    osc.setValueFor('frequency').to(0.01).at(0.1)
    gain.setValueFor('gain').to(0.01).at(0.1);

    return kick;
  },

  _createSnare() {
    const audio = this.get('audio');
    const noise = this._createSnareNoise();
    const oscillator = this._createSnareOscillator();

    return LayeredSound.create({ name: 'snare', sounds: [ noise, oscillator ] });
  },

  _createHihat() {
    const audio = this.get('audio');
    var fundamental = 40;
    var ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];

    const oscillators = ratios.map((ratio) => {
      return audio.createOscillator({
        type: 'square',
        highpassFrequency: 7000,
        bandpassFrequency: 10000,
        frequency: fundamental * ratio
      });
    }).map(this._createHihatEnvelope);

    return LayeredSound.create({ name: 'hihat', sounds: oscillators });
  },

  _createSnareOscillator() {
    const audio = this.get('audio');
    const oscillator = audio.createOscillator({ type: 'triangle' });
    const osc = oscillator.getConnection('audioSource');
    const gain = oscillator.getConnection('gain');

    osc.setValueFor('frequency').to(100).at(0);
    gain.setValueFor('gain').to(1).at(0);
    gain.setValueFor('gain').to(0.01).at(0.1);

    return oscillator;
  },

  _createSnareNoise() {
    const audio = this.get('audio');
    const noise = audio.createWhiteNoise({ name: 'snare', highpassFrequency: 1000 });
    const gain = noise.getConnection('gain');

    gain.setValueFor('gain').to(1).at(0);
    gain.setValueFor('gain').to(0.001).at(0.1);

    return noise;
  },

  _createHihatEnvelope(oscillator) {
    const gain = oscillator.getConnection('gain');

    gain.setValueFor('gain').to(0.00001).at(0);
    gain.setValueFor('gain').to(1).at(0.02);
    gain.setValueFor('gain').to(0.3).at(0.03);
    gain.setValueFor('gain').to(0.00001).at(0.3);

    return oscillator;
  },

  actions: {
    playDrum(drum) {
      // Only play for 0.1 seconds so that playing in quick succession doesn't
      // result in distortion
      drum.playFor(0.1);
    }
  }
});
