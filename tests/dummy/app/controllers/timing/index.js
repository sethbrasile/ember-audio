import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),

  initSound: Ember.on('init', function() {
    this.get('audio').load('/ember-audio/Db5.mp3').asSound('delayed-note');
  }),

  actions: {
    playInOneSecond1() {
      const audio = this.get('audio');
      const currentTime = audio.get('context.currentTime');
      audio.getSound('delayed-note').playAt(currentTime + 1);
    },

    playInOneSecond2() {
      this.get('audio').getSound('delayed-note').playIn(1);
    }
  }
});
