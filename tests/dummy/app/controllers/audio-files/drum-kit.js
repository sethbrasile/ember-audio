import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  beats: Ember.A(),

  loadSound(name) {
    this.get('audio').load(`/ember-audio/${name}.wav`).asSound(name)
      .then((sound) => this.get('beats').pushObject({ name, sound }));
  },

  initBeats: Ember.on('init', function() {
    this.loadSound('kick');
    this.loadSound('snare');
    this.loadSound('hihat');
  }),

  actions: {
    playBeat(beat) {
      beat.play();
    }
  }
});
