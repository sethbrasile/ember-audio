import { schedule } from '@ember/runloop';
import Component from '@ember/component';
import layout from '../templates/components/xy-pad';

export default Component.extend({
  layout,

  didInsertElement() {
    schedule('afterRender', this, '_drawGrid');
    schedule('afterRender', this, '_drawText');
  },

  _drawText() {
    const [ canvas ] = this.$('canvas');
    const ctx = canvas.getContext('2d');
    const pad = 10;

    ctx.fillStyle = 'white';
    ctx.font = '24px serif';
    ctx.textAlign = 'left';

    // save orientation
    ctx.save();

    // rotate canvas
    ctx.translate(0, 0);
    ctx.rotate(Math.PI / 2);

    // draw 'Gain'
    ctx.fillText('Gain', pad, -pad);

    // restore orientation
    ctx.restore();

    // draw 'Frequency'
    ctx.fillText('Frequency', pad, canvas.height - pad);
  },

  _drawGrid() {
    const [ canvas ] = this.$('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const gridSize = 30;

    ctx.strokeStyle = 'gray';
    ctx.strokeWidth = 1;

    ctx.beginPath();

    for (let i = 1; i <= width / gridSize; i++) {
      const x = (i * gridSize);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let i = 1; i <= height / gridSize; i++) {
      const y = (i * gridSize);
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.closePath();
  },

  actions: {
    activate(e) {
      e.preventDefault();
      this.send('updateCoordinates', e);
      this.activate();
    },

    deactivate() {
      this.deactivate();
    },

    updateCoordinates(e) {
      e.preventDefault();

      const [ canvas ] = this.$('canvas');
      const canvasLocation = canvas.getBoundingClientRect();
      const xRelToScreen = e.x || e.touches[0].screenX;
      const yRelToScreen = e.y || e.touches[0].screenY;
      const x = xRelToScreen - canvasLocation.left;

      // 'y' is measured from top, so invert for value from bottom
      const y = this.get('padSize') + (yRelToScreen - canvasLocation.top) * -1;

      this.updateCoordinates(x, y);
    }
  }
});
