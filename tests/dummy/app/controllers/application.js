import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),

  actions: {
    doSomething() {
      const audio = this.get('audio');

      audio.load('piano', 'vendor/Eb5.mp3');
      audio.load('piano2', 'vendor/Db5.mp3');
      audio.pan('piano', -1).play();
      audio.pan('piano2', 1).play();
    }
  }
});
