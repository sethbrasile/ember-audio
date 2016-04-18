import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),

  initAudioFiles: Ember.on('init', function() {
    const audio = this.get('audio');
    audio.load('single-note-left', 'Eb5.mp3');
    audio.load('single-note-right', 'Db5.mp3');
    audio.pan('single-note-left',  -1);
    audio.pan('single-note-right',  1);
  }),

  actions: {
    playSingleNoteLeft() {
      this.get('audio').play('single-note-left');
    },
    playSingleNoteRight() {
      this.get('audio').play('single-note-right');
    },
    playTwoPannedNotes() {
      const audio = this.get('audio');
      audio.play('single-note-left');
      audio.play('single-note-right');
    }
  }
});
