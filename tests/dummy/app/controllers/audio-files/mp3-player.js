import Ember from 'ember';
import getDurationFor from 'ember-audio/utils/get-duration-for';

const {
  inject: { service },
  Controller
} = Ember;

export default Controller.extend({
  audio: service(),
  selectedTrack: null,
  trackLoading: false,
  isPlaying: false,

  duration: getDurationFor('selectedTrack.name'),

  tracks: [
    {
      name: 'barely-there',
      description: 'blah blah'
    },
    {
      name: 'do-wah-diddy',
      description: 'words and words'
    }
  ],

  actions: {
    selectTrack(track) {
      const audio = this.get('audio');
      const trackName = track.name;

      audio.set('durationOutputType', 'string');
      this.set('trackLoading', true);

      const promise = audio.load(trackName, `${trackName}.mp3`)
        .then((sound) => {
          this.set('trackLoading', true);
          return sound;
        });

      this.set('selectedTrack', track);
      this.set('selectedTrack.promise', promise);
    },

    play() {
      const audio = this.get('audio');
      const track = this.get('selectedTrack');

      if (this.get('isPlaying')) {
        this.send('stop');
      }

      track.promise.then(() => {
        this.set('isPlaying', true);
        audio.play(track.name);
      });
    },

    pause() {
      const trackName = this.get('selectedTrack.name');
      this.get('audio').pause(trackName);
      this.set('isPlaying', false);
    }
  }
});
