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

    osc.onPlayRamp('frequency').from(150).to(0.01).in(0.1);
    gain.onPlayRamp('gain').from(1).to(0.01).in(0.1);

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
    const snare = audio.createOscillator({ type: 'triangle' });
    const oscillator = snare.getConnection('audioSource');
    const gain = snare.getConnection('gain');

    oscillator.onPlayRamp('frequency').from(100).to(60).in(0.1);
    gain.onPlayRamp('gain').from(1).to(0.01).in(0.1);

    return snare;
  },

  _createSnareNoise() {
    const audio = this.get('audio');
    const noise = audio.createWhiteNoise({ name: 'snare', highpassFrequency: 1000 });
    const gain = noise.getConnection('gain');

    gain.onPlayRamp('gain').from(1).to(0.001).in(0.1)

    return noise;
  },

  _createHihatEnvelope(oscillator) {
    const gain = oscillator.getConnection('gain');

    gain.onPlayRamp('gain').from(0.00001).to(1).in(0.02);

    gain.onPlaySet('gain').to(0.3).endingAt(0.03);
    gain.onPlaySet('gain').to(0.00001).endingAt(0.3);

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
