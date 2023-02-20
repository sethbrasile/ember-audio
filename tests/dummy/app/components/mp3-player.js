import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class Mp3Player extends Component {
  get percentPlayed() {
    const percentPlayed = this.args.track.percentPlayed;
    return htmlSafe(`width: ${percentPlayed}%;`);
  }

  get percentGain() {
    const percentGain = this.args.track.percentGain;
    return htmlSafe(`height: ${percentGain}%;`);
  }

  @action
  togglePlay() {
    const { track } = this.args;

    if (track.isPlaying) {
      track.pause();
    } else {
      track.play();
    }
  }

  @action
  seek(e) {
    const width = e.target.offsetParent.offsetWidth;
    const newPosition = e.offsetX / width;
    this.args.track.seek(newPosition).from('ratio');
  }

  @action
  changeVolume(e) {
    const height = e.target.offsetParent.offsetHeight;
    const parentOffset =
      e.target.parentNode.getBoundingClientRect().top + window.pageYOffset;
    const offset = e.pageY - parentOffset - document.documentElement.clientTop;
    const adjustedHeight = height * 0.8;
    const adjustedOffset = offset - (height - adjustedHeight) / 2;
    const newGain = adjustedOffset / adjustedHeight;

    this.args.track.changeGainTo(newGain).from('inverseRatio');
  }
}
