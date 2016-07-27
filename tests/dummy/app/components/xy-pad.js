import Ember from 'ember';
import layout from '../templates/components/xy-pad';

const {
  Component
} = Ember;

export default Component.extend({
  layout,

  actions: {
    activate() {
      this.sendAction('activate');
    },

    deactivate() {
      this.sendAction('deactivate');
    },

    updateCoordinates(e) {
      const [ canvas ] = this.$('canvas');
      const canvasLocation = canvas.getBoundingClientRect();
      const x = e.x - canvasLocation.left;
      const y = e.y - canvasLocation.top;

      this.sendAction('updateCoordinates', x, y);
    }
  }
});
