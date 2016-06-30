import Sound from 'ember-audio/utils/sound';
import ContextMock from '../../helpers/context-mock';
import { module, test } from 'qunit';

module('Unit | Utility | sound');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = Sound.create({ audioContext: ContextMock.create() });
  assert.ok(result);
});
