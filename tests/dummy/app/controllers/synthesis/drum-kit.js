import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import Controller from '@ember/controller';
import { LayeredSound } from 'ember-audio';

export default Controller.extend({
  audio: service(),
  drums: null,

  initDrums: on('init', function() {
    this.set('drums', [
      this._createKick(),
      this._createSnare(),
      this._createHihat()
    ]);
  }),

  _createKick() {
    const audio = this.audio;
    const kick = audio.createOscillator({ name: 'kick' });
    const osc = kick.getConnection('audioSource');
    const gain = kick.getConnection('gain');

    osc.onPlayRamp('frequency').from(150).to(0.01).in(0.1);
    gain.onPlayRamp('gain').from(1).to(0.01).in(0.1);

    return kick;
  },

  _createSnare() {
    const noise = this._createSnareNoise();
    const oscillator = this._createSnareOscillator();

    return LayeredSound.create({ name: 'snare', sounds: [ noise, oscillator ] });
  },

  _createSnareOscillator() {
    const audio = this.audio;
    const snare = audio.createOscillator({ type: 'triangle' });
    const oscillator = snare.getConnection('audioSource');
    const gain = snare.getConnection('gain');

    oscillator.onPlayRamp('frequency').from(100).to(60).in(0.1);
    gain.onPlayRamp('gain').from(1).to(0.01).in(0.1);

    return snare;
  },

  _createSnareNoise() {
    const audio = this.audio;
    const noise = audio.createWhiteNoise({ name: 'snare', highpassFrequency: 1000 });
    const gain = noise.getConnection('gain');

    gain.onPlayRamp('gain').from(1).to(0.001).in(0.1);

    return noise;
  },

  _createHihat() {
    // http://joesul.li/van/synthesizing-hi-hats/
    const ratios = [ 2, 3, 4.16, 5.43, 6.79, 8.21 ];

    const oscillators = ratios
      .map(this._createHihatOscillator.bind(this))
      .map(this._createHihatEnvelope);

    return LayeredSound.create({ name: 'hihat', sounds: oscillators });
  },

  _createHihatOscillator(ratio) {
    const fundamental = 40;

    return this.audio.createOscillator({
      type: 'square',
      highpass: { frequency: 7000 },
      bandpass: { frequency: 10000 },
      frequency: fundamental * ratio
    });
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
    },

    playBassDrop() {
      const audio = this.audio;
      const bassDrop = audio.createOscillator();
      const osc = bassDrop.getConnection('audioSource');
      const gain = bassDrop.getConnection('gain');

      // We can specify 'linear' to get a linear ramp instead of an exponential one
      osc.onPlayRamp('frequency', 'linear').from(100).to(0.01).in(10);

      // We automate gain as well, so we don't end up with a loud click when the audio stops
      gain.onPlayRamp('gain').from(1).to(0.01).in(10);

      bassDrop.playFor(10);
    },

    playSnareMeat() {
      this._createSnareOscillator().playFor(0.1);
    },

    playSnareCrack() {
      this._createSnareNoise().playFor(0.1);
    }
  }
});
