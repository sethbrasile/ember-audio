import Ember from 'ember';
const URL = 'https://raw.githubusercontent.com/mudcube/MIDI.js/master/examples/soundfont/acoustic_grand_piano-mp3/B5.mp3';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),

  initAudioFiles: Ember.on('init', function() {
    const audio = this.get('audio');

    // Db5.mp3 is an mp3 file located in this project's "public" folder
    audio.load('/ember-audio/Db5.mp3').asSound('note-left').then((sound) => {
      // You can pan a note left (any value between -1 and -0.1)
      sound.changePanTo(-0.7);
    });

    // This one is loaded from a URL somewhere on the internet
    audio.load(URL).asSound('note-right').then((sound) => {
      // You can pan a note right (any value between 0.1 and 1)
      sound.changePanTo(0.7);
    });
  }),

  actions: {
    playNoteLeft() {
      this.get('audio').getSound('note-left').play();
    },

    playNoteRight() {
      this.get('audio').getSound('note-right').play();
    },

    playBothNotes() {
      const audio = this.get('audio');
      audio.getSound('note-left').play();
      audio.getSound('note-right').play();
    }
  }
});
