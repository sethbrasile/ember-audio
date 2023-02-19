import Component from '@ember/component';
import layout from '../templates/components/mp3-player';
import Prism from 'prismjs';

export default Component.extend({
  layout,
  didRender() {
    this._super(...arguments);
    Prism.highlightAll();
  },
});
