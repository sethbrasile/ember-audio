import Component from '@glimmer/component';
import { schedule } from '@ember/runloop';
import Prism, { highlightAll } from 'prismjs';

export default class CodeBlock extends Component {
  constructor() {
    super(...arguments);
    schedule('afterRender', Prism, highlightAll);
  }
}
