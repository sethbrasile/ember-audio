import Track from 'dummy/utils/track';
import ContextMock from '../../helpers/context-mock';
import { module, test } from 'qunit';

module('Unit | Utility | track');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = Track.create({ audioContext: ContextMock.create() });
  assert.ok(result);
});
