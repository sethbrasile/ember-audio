import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import Controller from '@ember/controller';

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
