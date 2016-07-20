import Ember from 'ember';
import { Oscillator, Sound, Connection, LayeredSound } from 'ember-audio';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  drums: null,

  // TODO: maybe something like...
  // const snare = audio.createSynthDrum({
  //   type: 'noise',
  //   filteredAt: 1000,
  //   length: 0.5
  // });
  // const kick = audio.createSynthDrum({
  //   type: 'triangle',
  //   length: 0.5
  // })
  // kick.playIn()
  // snare.playIn()
  initDrums: Ember.on('init', function() {
    const kick = this._createKick();
    const snare = this._createSnare();
    const hihat = this._createHihat();

    this.set('drums', [
      { name: 'kick', sound: kick },
      { name: 'snare', sound: snare },
      { name: 'hihat', sound: hihat }
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
        frequency: fundamental * ratio
      });
    });

    const bandpass = Connection.create({
      name: 'bandpass',
      source: 'audioContext',
      createCommand: 'createBiquadFilter',
      onPlaySetAttrsOnNode: [
        {
          attrNameOnNode: 'type',
          value: 'bandpass'
        },
        {
          attrNameOnNode: 'frequency.value',
          value: 10000
        }
      ]
    });

    const highpass = Connection.create({
      name: 'highpass',
      source: 'audioContext',
      createCommand: 'createBiquadFilter',
      onPlaySetAttrsOnNode: [
        {
          attrNameOnNode: 'type',
          value: 'highpass'
        },
        {
          attrNameOnNode: 'frequency.value',
          value: 7000
        }
      ]
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

      osc.get('connections').insertAt(1, bandpass);
      osc.get('connections').insertAt(1, highpass);
    });

    return LayeredSound.create({ sounds: oscillators });
  },

  _createKick() {
    const audioContext = this.get('audio.audioContext');

    // `kick` is an Ember Audio Oscillator instance
    const kick = Oscillator.create({ audioContext });

    // `oscillatorConnection` is the Connection instance that contains the actual oscillator
    const oscillatorConnection = kick.getConnection('audioSource');

    // `gainConnection` is the Connection instance that contains the gain AudioNode
    const gainConnection = kick.getConnection('gain');

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
    const noise = Sound.create({ name: 'snare', audioBuffer, audioContext });
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

    const noiseFilter = Connection.create({
      name: 'filter',
      source: 'audioContext',
      createCommand: 'createBiquadFilter',
      onPlaySetAttrsOnNode: [
        {
          attrNameOnNode: 'type',
          value: 'highpass'
        },
        {
          attrNameOnNode: 'frequency.value',
          value: 1000
        }
      ]
    });

    noise.get('connections').insertAt(1, noiseFilter);

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
