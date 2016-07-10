import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  drums: null,
  isLoading: true,
  bpm: 120,

  loadDrum(name) {
    return this.get('audio').load(`/ember-audio/${name}.wav`).asBeatTrack(name);
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
        // playActiveBeats() optionally accepts "noteType" which defaults to "1/4"
        // notes, but we want to use eighth notes
        drum.playActiveBeats(this.get('bpm'), 1/8);

        // /* playActiveBeats() is a convenience method. For more control, you could do:
        // http://bradthemad.org/guitar/tempo_explanation.php */
        // const eighthNoteDuration = (240 * 1/8) / this.get('bpm');
        // drum.get('beats').map((beat, beatIndex) => {
        //   /* whatever else you need to do */
        //   beat.ifActivePlayIn(beatIndex * eighthNoteDuration);
        // });
      });
    },

    toggleActive(beat) {
      if (beat.get('active')) {
        beat.set('active', false);
      } else {
        beat.play();
        beat.set('active', true);
      }
    }
  }
});
