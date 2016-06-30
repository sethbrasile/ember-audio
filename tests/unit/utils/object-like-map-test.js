import ObjectLikeMap from 'dummy/utils/object-like-map';
import { module, test } from 'qunit';

module('Unit | Utility | object like map');

test('it exists', function(assert) {
  let object = ObjectLikeMap.create();
  assert.ok(object);
});

test('"has()" returns false when it should', function(assert) {
  let object = ObjectLikeMap.create();
  assert.equal(object.has('test'), false);
});

test('"has()" returns false when no key is provided', function(assert) {
  let object = ObjectLikeMap.create();
  assert.equal(object.has(), false);
});

test('"has()" returns true when it should', function(assert) {
  let object = ObjectLikeMap.create();
  object.set('test', 'some-value');
  assert.equal(object.has('test'), true);
});

test('"values()" returns an array of everything that has been set on it', function(assert) {
  let object = ObjectLikeMap.create();
  object.set('test', 'some-value');
  object.set('test2', 'some-other-value');
  assert.deepEqual(object.values(), ['some-value', 'some-other-value']);
});
