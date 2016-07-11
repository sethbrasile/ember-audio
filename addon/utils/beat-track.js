import Ember from 'ember';
import Sound from './sound';
import Beat from './beat';

const {
  computed
} = Ember;

/**
 * An instance of this class has a single
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer AudioBuffer}
 * (a single "sound") but provides methods to play that sound repeatedly and in
 * a rhythmic way. An instance of this class behaves very similarly to a "lane"
 * on a drum machine or a step sequencer.
 *
 * <style>
 *   .ignore-this--this-is-here-to-hide-constructor,
 *   #BeatTrack { display: none; }
 * </style>
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer}
 * @class BeatTrack
 * @extends Sound
 */
const BeatTrack = Sound.extend({
  numBeats: 4,
  playingTime: 100,

  beats: computed('numBeats', function() {
    const beats = [];
    const numBeats = this.get('numBeats');

    for (let i = 0; i < numBeats; i++) {
      beats.push(Beat.create({
        playingTime: this.get('playingTime'),
        duration: this.get('audioBuffer.duration'),
        parentPlayIn: this.playIn.bind(this),
        parentPlay: this.play.bind(this),
        audioContext: this.get('audioContext')
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
