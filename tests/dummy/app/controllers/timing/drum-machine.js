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
        // playBeats() optionally accepts beatLength which defaults to "1/4"
        // but we want to use eighth notes
        drum.playBeats(this.get('bpm'), 1/8);

        // /* playBeats() is a convenience method. For more control, you could do:
        // http://bradthemad.org/guitar/tempo_explanation.php */
        // const eighthNoteDuration = (240 * 1/8) / this.get('bpm');
        // drum.get('beats').map((beat, beatIndex) => {
        //   /* whatever else you need to do */
        //   beat.play(beatIndex * eighthNoteDuration);
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
