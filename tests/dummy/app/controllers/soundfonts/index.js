import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import Controller from '@ember/controller';

export default Controller.extend({
  audio: service(),
  isLoading: true,
  notes: null,

  initSoundFont: on('init', function () {
    // piano.js is a soundfont created with MIDI.js' Ruby-based soundfont converter
    this.audio
      .load('/ember-audio/piano.js')
      .asFont('piano')
      .then((font) => {
        // Slicing just so the whole keyboard doesn't show up on the screen
        this.set('notes', font.get('notes').slice(39, 51));
        this.set('isLoading', false);
      });
  }),

  actions: {
    playPianoNote(note) {
      note.play();
    },
  },
});
