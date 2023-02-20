import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class IndexController extends Controller {
  @service audio;

  constructor() {
    super(...arguments);
    this.audio.load('/ember-audio/Db5.mp3').asSound('delayed-note');
  }

  @action
  playInOneSecond1() {
    const { audio } = this;
    const currentTime = audio.get('audioContext.currentTime');
    audio.getSound('delayed-note').playAt(currentTime + 1);
  }

  @action
  playInOneSecond2() {
    this.audio.getSound('delayed-note').playIn(1);
  }
}
