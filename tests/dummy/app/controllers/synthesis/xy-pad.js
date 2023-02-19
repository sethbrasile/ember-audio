import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import Controller from '@ember/controller';
import { exponentialRatio } from 'ember-audio/utils';

export default Controller.extend({
  audio: service(),
  oscillator: null,
  padSize: 300,
  range: { min: 100, max: 400 },

  initOscillator: on('init', function () {
    const oscillator = this.audio.createOscillator({ type: 'square' });
    this.set('oscillator', oscillator);
  }),

  frequency: computed('oscillator.frequency', function () {
    const frequency = this.get('oscillator.frequency');

    if (frequency) {
      return frequency.toFixed();
    }
  }),

  gain: computed('oscillator.gain', function () {
    const gain = this.get('oscillator.gain');

    if (gain) {
      return gain.toFixed(2);
    } else {
      return 0;
    }
  }),

  _getFrequency(x) {
    const range = this.range;
    const padSize = this.padSize;

    return range.min + (range.max - range.min) * (x / padSize);
  },

  _getGain(y) {
    // Human senses are not linear.
    // http://stackoverflow.com/questions/1165026/what-algorithms-could-i-use-for-audio-volume-level
    return exponentialRatio(y / this.padSize);
  },

  actions: {
    play() {
      this.oscillator.play();
    },

    stop() {
      const oscillator = this.oscillator;

      if (oscillator.get('isPlaying')) {
        oscillator.stop();
      }
    },

    adjustSynthParams(x, y) {
      const oscillator = this.oscillator;
      const frequency = this._getFrequency(x);
      const gain = this._getGain(y);

      oscillator.update('frequency', frequency);
      oscillator.update('gain', gain);
    },
  },
});
