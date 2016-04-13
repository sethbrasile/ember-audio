import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),

  initSoundFont: Ember.on('init', function() {
    const audio = this.get('audio');
    audio.load('single-note', 'Eb5.mp3');
    audio.loadSoundFont('piano-font', 'piano.js');

    audio.pan('single-note',  -1);
    audio.pan('piano-font', 1);
  }),

  actions: {
    playSingleNote() {
      this.get('audio').play('single-note');
    },

    playNoteFromSoundFont() {
      this.get('audio').play('piano-font', 'Eb5');
    }
  }
});
