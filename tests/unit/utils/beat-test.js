import beat from 'ember-audio/utils/beat';
import ContextMock from '../../helpers/context-mock';
import { module, test } from 'qunit';

module('Unit | Utility | beat');

// Replace this with your real tests.
test('it works', function(assert) {
  let audioContext = ContextMock.create();
  let result = beat.create({ audioContext });
  assert.ok(result);
});
