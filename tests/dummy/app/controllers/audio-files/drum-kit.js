import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  beats: Ember.A(),
  isLoading: true,

  loadSound(name) {
    return this.get('audio').load(`/ember-audio/${name}.wav`).asSound(name)
      .then((sound) => this.get('beats').pushObject({ name, sound }));
  },

  initBeats: Ember.on('init', function() {
    Ember.RSVP.all([
      this.loadSound('kick'),
      this.loadSound('snare'),
      this.loadSound('hihat')
    ])
    .then(() => this.set('isLoading', false));
  }),

  actions: {
    playBeat(beat) {
      beat.play();
    }
  }
});
