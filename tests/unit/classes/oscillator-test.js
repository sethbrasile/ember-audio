import { Oscillator } from 'ember-audio';
import ContextMock from '../../helpers/context-mock';
import { module, test } from 'qunit';

module('Unit | Class | oscillator');

// Replace this with your real tests.
test('it exists', function(assert) {
  let audioContext = ContextMock.create();
  let result = Oscillator.create({ audioContext });
  assert.ok(result);
});
