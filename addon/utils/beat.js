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
        parentPlay: this.play.bind(this),
        audioContext: this.get('audioContext')
      }));
    }

    return beats;
  }),

  playBeats(bpm) {
    const bps = 60 / bpm;

    this.get('beats').map((beat, beatIndex) => {
      // Get the offset for each beat by multiplying it's index by the beats per second
      beat.play(beatIndex * bps);
    });
  }
});

export default Beat;
