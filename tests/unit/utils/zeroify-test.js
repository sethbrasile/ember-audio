import { zeroify } from 'ember-audio/utils';
import { module, test } from 'qunit';

module('Unit | Utility | zeroify');

test('it exists', function(assert) {
  let result = zeroify();
  assert.ok(result);
});

test('it works for 4', function(assert) {
  let result = zeroify(4);
  assert.equal(result, '04');
});

test('it works for 4.77865', function(assert) {
  let result = zeroify(4.77865);
  assert.equal(result, '04');
});

test('it works for 10', function(assert) {
  let result = zeroify(10);
  assert.equal(result, '10');
});

test('it works for 17', function(assert) {
  let result = zeroify(17);
  assert.equal(result, '17');
});

test('it works for 175', function(assert) {
  let result = zeroify(175);
  assert.equal(result, '175');
});
