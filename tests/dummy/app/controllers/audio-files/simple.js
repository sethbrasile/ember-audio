import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import Controller from '@ember/controller';
const URL = 'https://raw.githubusercontent.com/mudcube/MIDI.js/master/examples/soundfont/acoustic_grand_piano-mp3/B5.mp3';

export default Controller.extend({
  audio: service(),

  initAudioFiles: on('init', function() {
    const audio = this.audio;

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
      this.audio.getSound('note-left').play();
    },

    playNoteRight() {
      this.audio.getSound('note-right').play();
    },

    playBothNotes() {
      const audio = this.audio;
      audio.getSound('note-left').play();
      audio.getSound('note-right').play();
    }
  }
});
