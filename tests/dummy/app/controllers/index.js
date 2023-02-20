import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class IndexController extends Controller {
  @service audio;

  constructor() {
    super(...arguments);
    this.audio.load('Eb5.mp3').asSound('piano-note');
  }

  @action
  playSound() {
    this.audio.getSound('piano-note').play();
  }
}
