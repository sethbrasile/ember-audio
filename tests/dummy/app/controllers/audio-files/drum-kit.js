import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  drums: Ember.A(),
  isLoading: true,

  loadSound(name) {
    return this.get('audio').load(`/ember-audio/${name}.wav`).asSound(name)
      .then((drum) => this.get('drums').pushObject(drum));
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
    playDrum(drum) {
      drum.play();
    }
  }
});
