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
      description: `I used to play bass and sing ("clean" vocals) in a metalcore
        band called "Bringing Down Broadway" and this is one of our songs.<br>
        <br>This is from like 10 years ago (I'm sooooo oooooollldddd).<br><br>
        The album is titled, "It's all Gone South", I recorded it myself, and it
        was a commercial falure. I think it's awesome.`
    },
    {
      name: 'do-wah-diddy',
      description: `My friend David Denison and I recorded this song in a living
        room with a laptop and a broken logitech PC mic, for fun.<br><br> This
        is from about 8 years ago (please see comment on "Barely There" about
        being old).<br><br>David is "rapping" and I'm singing.<br><br>Please
        keep in mind that this is from a time when "autotune" was in it's
        infancy. Also, "autotune" is for assholes.`
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

      const promise = audio.load(trackName, `${trackName}.mp3`, 'track')
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
