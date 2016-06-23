import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),

  initAudioFile: Ember.on('init', function() {
    this.get('audio').load('piano-note', 'Eb5.mp3');
  }),

  actions: {
    playSound() {
      this.get('audio').getSound('piano-note').play();
    }
  }
});
