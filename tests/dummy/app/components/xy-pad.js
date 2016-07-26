import Ember from 'ember';
import layout from '../templates/components/xy-pad';

export default Ember.Component.extend({
  layout,

  actions: {
    activate() {
      this.sendAction('activate');
    },

    deactivate() {
      this.sendAction('deactivate');
    },

    updateCoordinates(e) {
      const canvas = this.$('canvas')[0];
      const canvasLocation = canvas.getBoundingClientRect();
      const x = e.x - canvasLocation.left;
      const y = e.y - canvasLocation.top;

      this.sendAction('updateCoordinates', x, y);
    }
  }
});
