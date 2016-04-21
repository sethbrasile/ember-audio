import Ember from 'ember';
import { sortNotes } from 'ember-audio/utils/note';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  isLoading: true,
  notes: null,

  initSoundFont: Ember.on('init', function() {
    // piano.js is a soundfont created with MIDI.js' Ruby-based soundfont converter
    this.get('audio').loadSoundFont('piano-font', 'piano.js')
      // The promise from loadSountFont resolves to an array of sorted
      // note objects (sorted the way they would appear on a piano).
      .then((notes) => {
        this.set('notes', sortNotes(notes).slice(27, 39));
        this.set('isLoading', false);
      });
  }),

  actions: {
    playNoteFromSoundFont(note) {
      this.get('audio').play('piano-font', note);
    }
  }
});
