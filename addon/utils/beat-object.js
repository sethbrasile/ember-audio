import Ember from 'ember';

const {
  run: { later }
} = Ember;

const BeatObject = Ember.Object.extend({
  active: false,
  currentTimeIsPlaying: false,
  isPlaying: false,
  playingDuration: 100,
  duration: 100,

  // Lets the object have "isPlaying" and "currentTimeIsPlaying" true then back to
  // false after "playingDuration" has elapsed, so that it's easy to make each
  // beat flash as it plays
  markPlaying() {
    let playingDuration = this.get('playingDuration');

    // if "playingDuration" is "duration" then we use the duration of the
    // AudioBuffer instead of a ms value
    if (playingDuration === 'duration') {
      playingDuration = this.get('duration') * 1000;
    }

    // "currentTimeIsPlaying" is switched on whether it is active or not
    this.set('currentTimeIsPlaying', true);
    later(() => this.set('currentTimeIsPlaying', false), playingDuration);

    // "isPlaying" is only switched on if the beat is active (playing audio)
    if (this.get('active')) {
      this.set('isPlaying', true);
      later(() => this.set('isPlaying', false), playingDuration);
    }
  },

  play(offset) {
    if (this.get('active')) {
      const currentTime = this.get('audioContext.currentTime');
      this.get('parentPlay')(currentTime + offset);
    }

    later(() => this.markPlaying(), offset * 1000);
  }
});

export default BeatObject;
