import Ember from 'ember';
import Sound from './sound';
import zeroify from './zeroify';

const Track = Sound.extend({
  simultaneousPlayAllowed: false,

  position: Ember.computed('startOffset', function() {
    const startOffset = this.get('startOffset');
    let minutes = Math.floor(startOffset / 60);
    let seconds = startOffset - (minutes * 60);

    return {
      raw: startOffset,
      string: `${zeroify(minutes)}:${zeroify(seconds)}`,
      pojo: { minutes, seconds }
    };
  }),

  percentPlayed: Ember.computed('duration', 'startOffset', function() {
    const ratio = this.get('startOffset') / this.get('duration.raw');
    return ratio * 100;
  }),

  watchPosition: Ember.observer('isPlaying', function() {
    const ctx = this.get('audioContext');
    const startOffset = this.get('startOffset');
    const startedPlayingAt = this.get('startedPlayingAt');

    const animate = () => {
      if (this.get('isPlaying')) {
        this.set('startOffset', startOffset + ctx.currentTime - startedPlayingAt);
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }),

  play() {
    this._super();
    this.get('bufferSourceNode').onended = () => this.stop();
  },

  pause() {
    if (this.get('isPlaying')) {
      this.get('bufferSourceNode').onended = function() {};
      this.get('bufferSourceNode').stop();
      this.set('isPlaying', false);
    }
  },

  stop() {
    this.set('startOffset', 0);

    if (this.get('isPlaying')) {
      this.get('bufferSourceNode').onended = function() {};
      this._super();
    }
  },
});

export default Track;
