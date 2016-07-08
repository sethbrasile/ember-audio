import Ember from 'ember';
import Sound from './sound';

const {
  computed,
  run: { later }
} = Ember;

const BeatObject = Ember.Object.extend({
  active: false,
  isPlaying: false,
  playingTime: 100,
  duration: null,

  // Lets the object have "isPlaying" true for "playingTime" then back to false,
  // so that it's easy to make each beat flash as it plays
  markPlaying() {
    let playingTime = this.get('playingTime');
    this.set('isPlaying', true);

    if (playingTime === 'duration') {
      playingTime = this.get('duration');
    }

    later(() => this.set('isPlaying', false), playingTime);
  }
});

const Beat = Sound.extend({
  numBeats: 4,
  playingTime: 100,

  beats: computed('numBeats', function() {
    const beats = [];
    const numBeats = this.get('numBeats');
    const playingTime = this.get('playingTime');
    const duration = this.get('audioBuffer.duration') * 1000;

    for (let i = 0; i < numBeats; i++) {
      beats.push(BeatObject.create({ playingTime, duration }));
    }

    return beats;
  }),
});

export default Beat;
