import Ember from 'ember';

const {
  inject: { service },
  on,
  Controller
} = Ember;

export default Controller.extend({
  audio: service(),
  oscillator: null,
  padSize: 300,
  range: { min: 100, max: 400 },

  initOscillator: on('init', function() {
    const oscillator = this.get('audio').createOscillator({ type: 'square' });
    this.set('oscillator', oscillator);
  }),

  _getFrequency(x) {
    const range = this.get('range');
    const padSize = this.get('padSize');

    return range.min + (range.max - range.min) * (x / padSize);
  },

  _getGain(y) {
    const padSize = this.get('padSize');
    return 1 + (y / padSize) * -1;
  },

  actions: {
    play() {
      this.get('oscillator').play();
    },

    stop() {
      const oscillator = this.get('oscillator');

      if (oscillator.get('isPlaying')) {
        oscillator.stop();
      }
    },

    adjustSynthParams(x, y) {
      const oscillator = this.get('oscillator');
      const frequency = this._getFrequency(x);
      const gain = this._getGain(y);

      oscillator.set('frequency', frequency);
      oscillator.set('gain', gain);
      oscillator.getNodeFrom('audioSource').frequency.value = frequency;
      oscillator.getNodeFrom('gain').gain.value = gain;
    }
  }
});
