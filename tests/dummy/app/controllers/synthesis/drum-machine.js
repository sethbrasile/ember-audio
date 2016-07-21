import Ember from 'ember';
import { Oscillator, Sound, Connection, LayeredSound } from 'ember-audio';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  drums: null,

  initDrums: Ember.on('init', function() {
    this.set('drums', [
      { name: 'kick', sound: this._createKick() },
      { name: 'snare', sound: this._createSnare() },
      { name: 'hihat', sound: this._createHihat() }
    ]);
  }),

  _createHihat() {
    const audioContext = this.get('audio.audioContext');

    var fundamental = 40;
    var ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];

    const oscillators = ratios.map((ratio) => {
      return Oscillator.create({
        audioContext,
        type: 'square',
        highpassFrequency: 7000,
        bandpassFrequency: 10000,
        frequency: fundamental * ratio
      });
    });

    oscillators.map((osc) => {
      const gainConnection = osc.getConnection('gain');

      gainConnection.get('startingValues').pushObject({
        key: 'gain',
        value: 0.00001,
        time: 0
      });

      gainConnection.get('exponentialRampToValueAtTime').pushObjects([
        {
          key: 'gain',
          value: 1,
          time: 0.02
        },
        {
          key: 'gain',
          value: 0.3,
          time: 0.03
        },
        {
          key: 'gain',
          value: 0.00001,
          time: 0.3
        }
      ]);
    });

    return LayeredSound.create({ sounds: oscillators });
  },

  _createKick() {
    const audioContext = this.get('audio.audioContext');

    // `kick` is an Ember Audio Oscillator instance
    const kick = Oscillator.create({ audioContext });
    const oscillatorConnection = kick.getConnection('audioSource');
    const gainConnection = kick.getConnection('gain');

    // const osc = kick.getConnection('audioSource');
    // const gain = kick.getConnection('gain');

    // Set initial values that are reset on each play
    // osc.setValueFor('frequency').to(150).at(0);
    // gain.setValueFor('gain').to(1).at(0);

    // Set timed values that are reset on each play
    // osc.setValueFor('frequency').to(0.01).at(0.1)
    // gain.setValueFor('gain').to(0.01).at(0.1);

    oscillatorConnection.get('startingValues').pushObject({
      key: 'frequency',
      value: 150
    });

    gainConnection.get('startingValues').pushObject({
      key: 'gain',
      value: 1
    });

    oscillatorConnection.get('exponentialRampToValueAtTime').pushObject({
      key: 'frequency',
      value: 0.01,
      time: 0.1
    });

    gainConnection.get('exponentialRampToValueAtTime').pushObject({
      key: 'gain',
      value: 0.01,
      time: 0.1
    });

    return kick;
  },

  _createSnare() {
    const audio = this.get('audio');
    const audioContext = audio.get('audioContext');
    const audioBuffer = audio.createWhiteNoiseBuffer();
    const noise = Sound.create({
      audioContext,
      audioBuffer,
      name: 'snare',
      highpassFrequency: 1000
    });

    const noiseEnvelope = noise.getConnection('gain');

    noiseEnvelope.get('startingValues').pushObject({
      key: 'gain',
      value: 1
    });

    noiseEnvelope.get('exponentialRampToValueAtTime').pushObject({
      key: 'gain',
      value: 0.001,
      time: 0.1
    });

    const osc = Oscillator.create({ audioContext, type: 'triangle' });
    // `oscillatorConnection` is the Connection instance that contains the actual oscillator
    const oscillatorConnection = osc.getConnection('audioSource');

    // `gainConnection` is the Connection instance that contains the gain AudioNode
    const gainConnection = osc.getConnection('gain');

    oscillatorConnection.get('startingValues').pushObject({
      key: 'frequency',
      value: 100
    });

    gainConnection.get('startingValues').pushObject({
      key: 'gain',
      value: 1
    });

    gainConnection.get('exponentialRampToValueAtTime').pushObject({
      key: 'gain',
      value: 0.01,
      time: 0.1
    });

    return LayeredSound.create({ sounds: [ noise, osc ] });
  },

  actions: {
    playDrum(drum) {
      drum.sound.playFor(0.1);
    }
  }
});
