import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  selectedTrack: null,
  loadingTrack: false,
  isPlaying: false,

  tracks: [
    {
      name: 'barely-there',
      description: 'blah blah'
    },
    {
      name: 'do-wah-diddy',
      description: 'blah blah'
    }
  ],

  actions: {
    selectTrack(track) {
      this.set('selectedTrack', track);
    },

    play() {
      const audio = this.get('audio');
      const track = this.get('selectedTrack.name');

      if (this.get('isPlaying')) {
        this.send('stop');
      }

      this.set('loadingTrack', true);

      audio.load(track, `${track}.mp3`).then(() => {
        this.set('loadingTrack', false);
        this.set('isPlaying', true);
        audio.play(track);
      });
    },

    stop() {
      this.get('audio').stop();
      this.set('isPlaying', false);
    }
  }
});
