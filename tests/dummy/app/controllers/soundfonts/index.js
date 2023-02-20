import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { on } from '@ember-decorators/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

@classic
export default class IndexController extends Controller {
  @service
  audio;

  isLoading = true;
  notes = null;

  @on('init')
  initSoundFont() {
    // piano.js is a soundfont created with MIDI.js' Ruby-based soundfont converter
    this.audio
      .load('/ember-audio/piano.js')
      .asFont('piano')
      .then((font) => {
        // Slicing just so the whole keyboard doesn't show up on the screen
        this.set('notes', font.get('notes').slice(39, 51));
        this.set('isLoading', false);
      });
  }

  @action
  playPianoNote(note) {
    note.play();
  }
}
