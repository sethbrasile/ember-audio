import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { on } from '@ember-decorators/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

@classic
export default class IndexController extends Controller {
  @service
  audio;

  @on('init')
  initAudioFile() {
    this.audio.load('Eb5.mp3').asSound('piano-note');
  }

  @action
  playSound() {
    this.audio.getSound('piano-note').play();
  }
}
