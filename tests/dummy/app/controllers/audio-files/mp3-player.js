import Ember from 'ember';
import getProp from 'ember-audio/utils/get-prop-from-sound';

const {
  inject: { service },
  Controller
} = Ember;

export default Controller.extend({
  audio: service(),
  selectedTrack: null,
  trackLoading: false,
  isPlaying: false,

  duration: getProp('duration').fromSound('selectedTrack.name'),
  position: getProp('position').fromSound('selectedTrack.name'),

  percentPlayed: getProp('percentPlayed')
    .fromSound('selectedTrack.name', function(percent) {
      return Ember.String.htmlSafe(`width: ${percent}%;`);
    }
  ),

  percentGain: getProp('percentGain')
    .fromSound('selectedTrack.name', function(percent) {
      return Ember.String.htmlSafe(`height: ${percent}%;`);
    }
  ),

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
    seek(e) {
      const audio = this.get('audio');
      const trackName = this.get('selectedTrack.name');

      const width = e.target.offsetParent.offsetWidth;
      const ratio = e.offsetX / width;

      audio.seek(trackName, ratio).ratio();
    },

    changeVolume(e) {
      const audio = this.get('audio');
      const trackName = this.get('selectedTrack.name');

      const height = e.target.offsetParent.offsetHeight;
      const offset = e.pageY - Ember.$(e.target).parent().offset().top;
      const adjustedHeight = height * 0.8;
      const adjustedOffset = offset - ((height - adjustedHeight) / 2);

      let ratio = (adjustedOffset / adjustedHeight);

      audio.getSound(trackName).changeGain((ratio * -1) + 1);
    },

    selectTrack(track) {
      const audio = this.get('audio');
      const trackName = track.name;

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
