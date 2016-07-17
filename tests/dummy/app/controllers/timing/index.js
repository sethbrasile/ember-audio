import Ember from 'ember';

const {
  inject: { service },
  on,
  Controller
} = Ember;

export default Controller.extend({
  audio: service(),

  initSound: on('init', function() {
    this.get('audio').load('/ember-audio/Db5.mp3').asSound('delayed-note');
  }),

  actions: {
    playInOneSecond1() {
      const audio = this.get('audio');
      const currentTime = audio.get('audioContext.currentTime');
      audio.getSound('delayed-note').playAt(currentTime + 1);
    },

    playInOneSecond2() {
      this.get('audio').getSound('delayed-note').playIn(1);
    }
  }
});
