import Ember from 'ember';
import Sound from './sound';
import BeatObject from './beat-object';

const {
  computed
} = Ember;

const Beat = Sound.extend({
  numBeats: 4,
  playingTime: 100,

  beats: computed('numBeats', function() {
    const beats = [];
    const numBeats = this.get('numBeats');

    for (let i = 0; i < numBeats; i++) {
      beats.push(BeatObject.create({
        playingTime: this.get('playingTime'),
        duration: this.get('audioBuffer.duration'),
        parentPlayIn: this.playIn.bind(this),
        parentPlay: this.play.bind(this),
        audioContext: this.get('audioContext')
      }));
    }

    return beats;
  }),

  playBeats(bpm, beatLength=1/4) {
    // http://bradthemad.org/guitar/tempo_explanation.php
    const beatDuration = (240 * beatLength) / bpm;

    this.get('beats').map((beat, beatIndex) => {
      beat.playIn(beatIndex * beatDuration);
    });
  }
});

export default Beat;
