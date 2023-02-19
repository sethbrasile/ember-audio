import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import Controller from '@ember/controller';

export default Controller.extend({
  audio: service(),

  initSound: on('init', function() {
    this.audio.load('/ember-audio/Db5.mp3').asSound('delayed-note');
  }),

  actions: {
    playInOneSecond1() {
      const audio = this.audio;
      const currentTime = audio.get('audioContext.currentTime');
      audio.getSound('delayed-note').playAt(currentTime + 1);
    },

    playInOneSecond2() {
      this.audio.getSound('delayed-note').playIn(1);
    }
  }
});
