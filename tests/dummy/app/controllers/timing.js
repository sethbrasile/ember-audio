import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  drums: null,
  isLoading: true,
  bpm: 120,

  loadDrum(name) {
    return this.get('audio').load(`/ember-audio/${name}.wav`).asBeat(name);
  },

  initBeats: Ember.on('init', function() {
    Ember.RSVP.all([
      this.loadDrum('kick'),
      this.loadDrum('snare'),
      this.loadDrum('hihat')
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
        // playBeats() optionally accepts noteLength and beatsInMeasure
        // noteLength defaults to "1/4" and beatsInMeasure defaults to "4"
        drum.playBeats(this.get('bpm'));

        // /* playBeats() is a convenience method. For more control, you could do: */
        // const bps = 60 / this.get('bpm');
        // drum.get('beats').map((beat, beatIndex) => {
        //   /* whatever else you need to do */
        //   beat.play(beatIndex * bps);
        // });
      });
    },

    toggleActive(beat) {
      if (beat.get('isActive')) {
        beat.set('isActive', false);
      } else {
        beat.set('isActive', true);
        beat.play();
      }
    }
  }
});
