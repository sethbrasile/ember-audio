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

  playBeats(bpm, beatLength=1/4, beatsInMeasure=4) {
    const bps = 60 / bpm;

    this.get('beats').map((beat, beatIndex) => {
      beat.play(beatIndex * bps * beatLength * beatsInMeasure);
    });
  }
});

export default Beat;
