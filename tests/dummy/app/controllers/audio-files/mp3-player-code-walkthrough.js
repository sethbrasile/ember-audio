import Ember from 'ember';
import getProp from 'ember-audio/utils/get-prop';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  selectedTrack: null,
  isPlaying: false,

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

  duration: getProp('duration').fromTrack('selectedTrack.name'),
  position: getProp('position').fromTrack('selectedTrack.name'),

  percentPlayed: getProp('percentPlayed')
    .fromTrack('selectedTrack.name', function(percentPlayed) {
      return Ember.String.htmlSafe(`width: ${percentPlayed}%;`);
    }
  ),

  percentGain: getProp('percentGain')
    .fromTrack('selectedTrack.name', function(percentGain) {
      return Ember.String.htmlSafe(`height: ${percentGain}%;`);
    }
  ),

  actions: {
    selectTrack(track) {
      const audio = this.get('audio');

      this.set('isPlaying', false);
      audio.pauseAll();

      track.promise = audio.load(`${track.name}.mp3`).asTrack(track.name);
      this.set('selectedTrack', track);
    },

    fakePlay() {
      this.set('isPlaying', true);
    },

    fakePause() {
      this.set('isPlaying', false);
    },

    fakeSelectTrack(track) {
      const audio = this.get('audio');

      this.set('isPlaying', false);

      track.promise = audio.load(`${track.name}.mp3`).asTrack(track.name);
      this.set('selectedTrack', track);
    },

    play() {
      this.get('selectedTrack.promise').then((track) => {
        this.set('isPlaying', true);
        track.play();
      });
    },

    pause() {
      const trackName = this.get('selectedTrack.name');
      this.set('isPlaying', false);
      this.get('audio').getTrack(trackName).pause();
    },

    seek(e) {
      const audio = this.get('audio');
      const trackName = this.get('selectedTrack.name');

      const width = e.target.offsetParent.offsetWidth;
      const newPosition = e.offsetX / width;

      audio.getTrack(trackName).seek(newPosition).from('ratio');
    },

    changeVolume(e) {
      const audio = this.get('audio');
      const trackName = this.get('selectedTrack.name');

      const height = e.target.offsetParent.offsetHeight;
      const offset = e.pageY - Ember.$(e.target).parent().offset().top;
      const adjustedHeight = height * 0.8;
      const adjustedOffset = offset - ((height - adjustedHeight) / 2);
      const newGain = adjustedOffset / adjustedHeight;

      audio.getTrack(trackName).changeGain(newGain).from('inverseRatio');
    }
  }
});
