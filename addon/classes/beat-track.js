import Ember from 'ember';
import Beat from './beat';
import Sampler from './sampler';

/**
 * Provides classes that are capable of interacting with the Web Audio API's
 * AudioContext.
 *
 * @module Audio
 */

const {
  computed
} = Ember;

/**
 * An instance of this class has a single
 * {{#crossLink "AudioBuffer"}}{{/crossLink}} (a single "sound") but provides
 * methods to play that sound repeatedly and in a rhythmic way. An instance of
 * this class behaves very similarly to a "lane" on a drum machine.
 *
 * @class BeatTrack
 * @extends Sampler
 *
 * @todo need a way to stop a BeatTrack once it's started
 */
const BeatTrack = Sampler.extend({
  numBeats: 4,
  playingTime: 100,

  beats: computed('numBeats', function() {
    const beats = [];
    const numBeats = this.get('numBeats');

    for (let i = 0; i < numBeats; i++) {
      beats.push(Beat.create({
        audioBufferDuration: this.get('audioBuffer.duration'),
        parentPlayIn: this.playIn.bind(this),
        parentPlay: this.play.bind(this),
      }));
    }

    return beats;
  }),

  playBeats(bpm, noteType) {
    this._callPlayMethodOnBeats('playIn', bpm, noteType);
  },

  playActiveBeats(bpm, noteType) {
    this._callPlayMethodOnBeats('ifActivePlayIn', bpm, noteType);
  },

  _callPlayMethodOnBeats(method, bpm, noteType=1/4) {
    // http://bradthemad.org/guitar/tempo_explanation.php
    const duration = (240 * noteType) / bpm;
    this.get('beats').map((beat, idx) => beat[method](idx * duration));
  }
});

export default BeatTrack;
