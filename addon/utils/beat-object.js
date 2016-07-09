import Ember from 'ember';

const {
  run: { later }
} = Ember;

const BeatObject = Ember.Object.extend({
  isActive: false,
  currentTimeIsPlaying: false,
  isPlaying: false,
  playingDuration: 100,
  duration: 100,

  // Lets the object have "isPlaying" and "currentTimeIsPlaying" true then back to
  // false after "playingDuration" has elapsed, so that it's easy to give each
  // beat some visual indicator as it plays
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
    if (this.get('isActive')) {
      this.set('isPlaying', true);
      later(() => this.set('isPlaying', false), playingDuration);
    }
  },

  playIn(offset=0) {
    if (this.get('isActive')) {
      this.get('parentPlayIn')(offset);
    }

    later(() => this.markPlaying(), offset * 1000);
  }
});

export default BeatObject;
