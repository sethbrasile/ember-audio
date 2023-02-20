import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { on } from '@ember-decorators/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { exponentialRatio } from 'ember-audio/utils';

@classic
export default class XyPadController extends Controller {
  @service
  audio;

  oscillator = null;
  padSize = 300;
  range = null;

  @on('init')
  initOscillator() {
    const oscillator = this.audio.createOscillator({ type: 'square' });
    this.set('oscillator', oscillator);

    if (!this.range) {
      this.range = { min: 100, max: 400 };
    }
  }

  @computed('oscillator.frequency')
  get frequency() {
    const frequency = this.get('oscillator.frequency');

    if (frequency) {
      return frequency.toFixed();
    }

    return null;
  }

  @computed('oscillator.gain')
  get gain() {
    const gain = this.get('oscillator.gain');

    if (gain) {
      return gain.toFixed(2);
    } else {
      return 0;
    }
  }

  _getFrequency(x) {
    const range = this.range;
    const padSize = this.padSize;

    return range.min + (range.max - range.min) * (x / padSize);
  }

  _getGain(y) {
    // Human senses are not linear.
    // http://stackoverflow.com/questions/1165026/what-algorithms-could-i-use-for-audio-volume-level
    return exponentialRatio(y / this.padSize);
  }

  @action
  play() {
    this.oscillator.play();
  }

  @action
  stop() {
    const oscillator = this.oscillator;

    if (oscillator.get('isPlaying')) {
      oscillator.stop();
    }
  }

  @action
  adjustSynthParams(x, y) {
    const oscillator = this.oscillator;
    const frequency = this._getFrequency(x);
    const gain = this._getGain(y);

    oscillator.update('frequency', frequency);
    oscillator.update('gain', gain);
  }
}
