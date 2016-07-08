import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  drums: null,
  isLoading: true,
  bpm: 200,

  loadSound(name) {
    return this.get('audio').load(`/ember-audio/${name}.wav`).asBeat(name);
  },

  initBeats: Ember.on('init', function() {
    Ember.RSVP.all([
      this.loadSound('kick'),
      this.loadSound('snare'),
      this.loadSound('hihat')
    ])
    .then((drums) => {
      drums.map((drum) => drum.set('numBeats', 8));
      this.set('isLoading', false);
      this.set('drums', drums);
    });
  }),

  actions: {
    play() {
      // Beats per second is 60 (seconds) divided by beats per minute
      const bps = 60 / this.get('bpm');

      this.get('drums').map((drum) => {
        drum.get('beats').map((beat, beatIndex) => {
          // Get the offset for each beat by multiplying it's index by the beats per second
          beat.play(beatIndex * bps);
        });
      });
    },

    toggleActive(beat, drum) {
      if (beat.get('active')) {
        beat.set('active', false);
      } else {
        beat.set('active', true);
        drum.play();
      }
    }
  }
});
