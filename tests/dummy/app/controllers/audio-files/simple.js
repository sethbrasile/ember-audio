import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { on } from '@ember-decorators/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
const URL =
  'https://raw.githubusercontent.com/mudcube/MIDI.js/master/examples/soundfont/acoustic_grand_piano-mp3/B5.mp3';

@classic
export default class SimpleController extends Controller {
  @service
  audio;

  @on('init')
  initAudioFiles() {
    const audio = this.audio;

    // Db5.mp3 is an mp3 file located in this project's "public" folder
    audio
      .load('/ember-audio/Db5.mp3')
      .asSound('note-left')
      .then((sound) => {
        // You can pan a note left (any value between -1 and -0.1)
        sound.changePanTo(-0.7);
      });

    // This one is loaded from a URL somewhere on the internet
    audio
      .load(URL)
      .asSound('note-right')
      .then((sound) => {
        // You can pan a note right (any value between 0.1 and 1)
        sound.changePanTo(0.7);
      });
  }

  @action
  playNoteLeft() {
    this.audio.getSound('note-left').play();
  }

  @action
  playNoteRight() {
    this.audio.getSound('note-right').play();
  }

  @action
  playBothNotes() {
    const audio = this.audio;
    audio.getSound('note-left').play();
    audio.getSound('note-right').play();
  }
}
