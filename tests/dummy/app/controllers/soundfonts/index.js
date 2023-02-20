import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';

export default class IndexController extends Controller {
  @service audio;
  @tracked isLoading = true;
  notes = null;

  constructor() {
    super(...arguments);

    // piano.js is a soundfont created with MIDI.js' Ruby-based soundfont converter
    this.audio
      .load('/ember-audio/piano.js')
      .asFont('piano')
      .then((font) => {
        // Slicing just so the whole keyboard doesn't show up on the screen
        this.notes = font.notes.slice(39, 51);
        this.isLoading = false;
      });
  }

  @action
  playPianoNote(note) {
    note.play();
  }
}
