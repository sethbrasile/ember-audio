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

  playIn(offset=0) {
    const msOffset = offset * 1000;

    this.get('parentPlayIn')(offset);

    later(() => this._markPlaying(), msOffset);
    later(() => this._markCurrentTimePlaying(), msOffset);
  },

  ifActivePlayIn(offset=0) {
    const msOffset = offset * 1000;

    if (this.get('active')) {
      this.get('parentPlayIn')(offset);
      later(() => this._markPlaying(), msOffset);
    }

    later(() => this._markCurrentTimePlaying(), msOffset);
  },

  play() {
    this.get('parentPlay')();
    this._markPlaying();
    this._markCurrentTimePlaying();
  },

  playIfActive() {
    if (this.get('active')) {
      this.get('parentPlay')();
      this._markPlaying();
    }

    this._markCurrentTimePlaying();
  },

  _getPlayingDuration() {
    let duration = this.get('playingDuration');

    // if playingDuration === "duration" then we use the duration of the AudioBuffer
    // instead of a ms value (AudioBuffer duration is passed-in at object creation)
    return duration === 'duration' ? this.get('duration') * 1000 : duration;
  },

  // Lets the object have "isPlaying" and "currentTimeIsPlaying" true then back to
  // false after "playingDuration" has elapsed, so that it's easy to give each
  // beat some visual indicator as it plays
  _markPlaying() {
    this.set('isPlaying', true);
    later(() => this.set('isPlaying', false), this._getPlayingDuration());
  },

  _markCurrentTimePlaying() {
    this.set('currentTimeIsPlaying', true);
    later(() => this.set('currentTimeIsPlaying', false), this._getPlayingDuration());
  },
});

export default BeatObject;
