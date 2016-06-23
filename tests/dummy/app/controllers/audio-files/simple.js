import Ember from 'ember';
const URL = 'https://raw.githubusercontent.com/mudcube/MIDI.js/master/examples/soundfont/acoustic_grand_piano-mp3/B5.mp3';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),

  initAudioFiles: Ember.on('init', function() {
    const audio = this.get('audio');

    // Db5.mp3 is an mp3 file located in this project's "public" folder
    audio.load('note-left', 'Db5.mp3').then((sound) => {
      // You can pan a note left (any value between -1 and -0.1)
      sound.pan(-0.7);
    });

    // This one is loaded from a URL somewhere on the internet
    audio.load('note-right', URL).then((sound) => {
      // You can pan a note right (any value between 0.1 and 1)
      sound.pan(0.7);
    });
  }),

  actions: {
    playSingleNoteLeft() {
      this.get('audio').play('note-left');
    },

    playSingleNoteRight() {
      this.get('audio').play('note-right');
    },

    playBothNotes() {
      const audio = this.get('audio');
      audio.play('note-left');
      audio.play('note-right');
    }
  }
});
