import Ember from 'ember';
import { Oscillator } from 'ember-audio';
const URL = 'https://gist.githubusercontent.com/sethbrasile/5438a4e2700837d6d0e0c3a134ba8ed4/raw/d6d50f3387659c2777f230ed91be51a0e09d75cd/notes-frequencies.json';

const {
  inject: { service },
  on,
  Controller
} = Ember;

export default Controller.extend({
  audio: service(),

  initSynth: on('init', function() {
    this.get('audio').load(URL).asNoteMap('synth-note-map').then((notes) => {
      // Slicing here, just so the whole keyboard doesn't show up on the screen
      this.set('notes', notes.slice(51, 68));
    });
  }),

  actions: {
    playNote(note) {
      const oscillator = Oscillator.create({
        type: 'square',
        audioContext: this.get('audio.audioContext'),
        frequency: note.get('frequency')
      });

      this.set(note.get('identifier'), oscillator);

      oscillator.start();
    },

    stopNote(note) {
      this.get(note.get('identifier')).stop();
    }
  }
});
