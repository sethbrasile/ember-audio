import Ember from 'ember';

const {
  inject: { service },
  on,
  Controller
} = Ember;

export default Controller.extend({
  audio: service(),
  isLoading: true,
  notes: null,

  initSoundFont: on('init', function() {
    // piano.js is a soundfont created with MIDI.js' Ruby-based soundfont converter
    this.get('audio').load('/ember-audio/piano.js').asFont('piano')
      // The promise from asFont() resolves to an array of sorted
      // note objects (sorted the way they would appear on a piano).
      .then((notes) => {
        // Slicing here, just so the whole keyboard doesn't show up on the screen
        this.set('notes', notes.slice(39, 51));
        this.set('isLoading', false);
      });
  }),

  actions: {
    playPianoNote(noteIdentifier) {
      this.get('audio').getFont('piano').play(noteIdentifier);
    }
  }
});
