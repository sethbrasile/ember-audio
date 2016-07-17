import Ember from 'ember';

const {
  inject: { service },
  on,
  Controller
} = Ember;

export default Controller.extend({
  audio: service(),

  initAudioFile: on('init', function() {
    this.get('audio').load('Eb5.mp3').asSound('piano-note');
  }),

  actions: {
    playSound() {
      this.get('audio').getSound('piano-note').play();
    }
  }
});
