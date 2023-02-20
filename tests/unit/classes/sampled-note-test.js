import { SampledNote } from 'ember-audio';
import ContextMock from '../../helpers/context-mock';
import { module, test } from 'qunit';

module('Unit | Class | sampled note', function () {
  // Replace this with your real tests.
  test('it exists', function (assert) {
    let audioContext = ContextMock.create();
    let result = SampledNote.create({ audioContext });
    assert.ok(result);
  });
});
