import Ember from 'ember';

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
        // Slicing here, just so the whole keyboard doesn't show up on the screen
        this.set('notes', notes.slice(39, 51));
        this.set('isLoading', false);
      });
  }),

  actions: {
    playNoteFromSoundFont(note) {
      this.get('audio').getFont('piano-font').play(note);
    }
  }
});
