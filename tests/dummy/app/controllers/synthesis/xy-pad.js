import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { exponentialRatio } from 'ember-audio/utils';

export default class XyPadController extends Controller {
  @service audio;
  @tracked oscillator;
  @tracked range;

  padSize = 300;

  constructor() {
    super(...arguments);

    this.oscillator = this.audio.createOscillator({ type: 'square' });

    if (!this.range) {
      this.range = { min: 100, max: 400 };
    }
  }

  get frequency() {
    const frequency = this.oscillator.frequency;

    if (frequency) {
      return frequency.toFixed();
    }

    return null;
  }

  get gain() {
    const gain = this.oscillator.gain;

    if (gain) {
      return gain.toFixed(2);
    } else {
      return 0;
    }
  }

  @action
  play() {
    this.oscillator.play();
  }

  @action
  stop() {
    const { oscillator } = this;

    if (oscillator.isPlaying) {
      oscillator.stop();
    }
  }

  @action
  adjustSynthParams(x, y) {
    const { oscillator, range, padSize } = this;
    const frequency = range.min + (range.max - range.min) * (x / padSize);

    // Human senses are not linear.
    // http://stackoverflow.com/questions/1165026/what-algorithms-could-i-use-for-audio-volume-level
    const gain = exponentialRatio(y / this.padSize);

    oscillator.update('frequency', frequency);
    oscillator.update('gain', gain);

    // Must reassign in order for @tracked to pick up changes to complex object
    this.oscillator = oscillator;
  }
}
