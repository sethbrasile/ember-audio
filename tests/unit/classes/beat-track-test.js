import { BeatTrack } from 'ember-audio';
import ContextMock from '../../helpers/context-mock';
import { module, test } from 'qunit';

module('Unit | Class | beat track');

// Replace this with your real tests.
test('it works', function(assert) {
  let audioContext = ContextMock.create();
  let result = BeatTrack.create({ audioContext });
  assert.ok(result);
});
