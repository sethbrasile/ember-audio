import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  drums: null,
  isLoading: true,
  bpm: 120,

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
      // default is 4 beats, but we're going to use 8
      drums.map((drum) => drum.set('numBeats', 8));
      this.set('isLoading', false);
      this.set('drums', drums);
    });
  }),

  actions: {
    play() {
      this.get('drums').map((drum) => {
        drum.playBeats(this.get('bpm'));

        // /* playBeats() is a convenience method. For more control, you could do: */
        // const bps = 60 / this.get('bpm');
        // drum.get('beats').map((beat, beatIndex) => {
        //   /* whatever else you need to do */
        //   beat.play(beatIndex * bps);
        // });
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
