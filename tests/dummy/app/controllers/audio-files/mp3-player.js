import Ember from 'ember';

const {
  computed,
  computed: { reads },
  inject: { service },
  Controller
} = Ember;

export default Controller.extend({
  audio: service(),
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

  percentPlayed: computed('selectedTrack.percentPlayed', function() {
    const percentPlayed = this.get('selectedTrack.percentPlayed');
    return Ember.String.htmlSafe(`width: ${percentPlayed}%;`);
  }),

  percentGain: computed('selectedTrack.percentGain', function() {
    const percentGain = this.get('selectedTrack.percentGain');
    return Ember.String.htmlSafe(`width: ${percentGain}%;`);
  }),

  actions: {
    selectTrack(newTrack) {
      const audio = this.get('audio');

      audio.load(`${newTrack.name}.mp3`).asTrack(newTrack.name)
        .then((track) => {
          track.set('details', newTrack);
          this.set('selectedTrack', track);
        });

      this.set('isPlaying', false);
      audio.pauseAll();
    },

    play() {
      this.get('selectedTrack').play();
      this.set('isPlaying', true);
    },

    pause() {
      this.get('selectedTrack').pause()
      this.set('isPlaying', false);
    },

    seek(e) {
      const width = e.target.offsetParent.offsetWidth;
      const newPosition = e.offsetX / width;
      this.get('selectedTrack').seek(newPosition).from('ratio');
    },

    changeVolume(e) {
      const height = e.target.offsetParent.offsetHeight;
      const offset = e.pageY - Ember.$(e.target).parent().offset().top;
      const adjustedHeight = height * 0.8;
      const adjustedOffset = offset - ((height - adjustedHeight) / 2);
      const newGain = adjustedOffset / adjustedHeight;

      this.get('selectedTrack').changeGain(newGain).from('inverseRatio');
    }
  }
});
