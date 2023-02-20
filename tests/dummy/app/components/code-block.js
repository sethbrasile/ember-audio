import classic from 'ember-classic-decorator';
import { layout as templateLayout } from '@ember-decorators/component';
import Component from '@ember/component';
import layout from '../templates/components/mp3-player';
import Prism from 'prismjs';

@classic
@templateLayout(layout)
export default class CodeBlock extends Component {
  didRender() {
    super.didRender(...arguments);
    Prism.highlightAll();
  }
}
