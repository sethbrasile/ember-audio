import { Note } from 'ember-audio';
import { module, test } from 'qunit';
import ContextMock from '../../helpers/context-mock';

module('Unit | Class | note', function () {
  test('it exists', function (assert) {
    let audioContext = ContextMock.create();
    let result = Note.create({ audioContext });
    assert.ok(result);
  });
});
