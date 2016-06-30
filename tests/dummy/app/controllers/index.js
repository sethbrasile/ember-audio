import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),

  initAudioFile: Ember.on('init', function() {
    this.get('audio').load('Eb5.mp3').asSound('piano-note');
  }),

  actions: {
    playSound() {
      this.get('audio').getSound('piano-note').play();
    }
  }
});
