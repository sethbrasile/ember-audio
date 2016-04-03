import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),

  actions: {
    doSomething() {
      this.get('audio').load('piano', 'vendor/Eb5.mp3').play();
    }
  }
});
