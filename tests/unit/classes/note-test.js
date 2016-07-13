import { module, test } from 'qunit';
import noteFactory from '../../helpers/note-factory';

module('Unit | Class | note');

const A1  = noteFactory('A', null, 1);
const Ab1 = noteFactory('A', 'b', 1);


test('identifier is formatted properly', function(assert) {
  assert.expect(1);
  assert.equal(Ab1.get('identifier'), 'Ab1');
});

test('identifier is formatted properly when note has no accidental', function(assert) {
  assert.expect(1);
  assert.equal(A1.get('identifier'), 'A1');
});

test('name is formatted properly', function(assert) {
  assert.expect(1);
  assert.equal(Ab1.get('name'), 'Ab');
});
