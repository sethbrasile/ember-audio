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
  initSound() {
    this.audio.load('/ember-audio/Db5.mp3').asSound('delayed-note');
  }

  @action
  playInOneSecond1() {
    const audio = this.audio;
    const currentTime = audio.get('audioContext.currentTime');
    audio.getSound('delayed-note').playAt(currentTime + 1);
  }

  @action
  playInOneSecond2() {
    this.audio.getSound('delayed-note').playIn(1);
  }
}
