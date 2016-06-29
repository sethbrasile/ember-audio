import Ember from 'ember';
import layout from '../templates/components/mp3-player';

const {
  computed,
  Component
} = Ember;

export default Component.extend({
  layout,

  percentPlayed: computed('track.percentPlayed', function() {
    const percentPlayed = this.get('track.percentPlayed');
    return Ember.String.htmlSafe(`width: ${percentPlayed}%;`);
  }),

  percentGain: computed('track.percentGain', function() {
    const percentGain = this.get('track.percentGain');
    return Ember.String.htmlSafe(`height: ${percentGain}%;`);
  }),

  actions: {
    play() {
      this.get('track').play();
      this.set('isPlaying', true);
    },

    pause() {
      this.get('track').pause()
      this.set('isPlaying', false);
    },

    seek(e) {
      const width = e.target.offsetParent.offsetWidth;
      const newPosition = e.offsetX / width;
      this.get('track').seek(newPosition).from('ratio');
    },

    changeVolume(e) {
      const height = e.target.offsetParent.offsetHeight;
      const offset = e.pageY - Ember.$(e.target).parent().offset().top;
      const adjustedHeight = height * 0.8;
      const adjustedOffset = offset - ((height - adjustedHeight) / 2);
      const newGain = adjustedOffset / adjustedHeight;

      this.get('track').changeGain(newGain).from('inverseRatio');
    }
  }
});
