import withinRange from 'ember-audio/utils/within-range';
import { module, test } from 'qunit';

module('Unit | Utility | within range', function () {
  test('it exists', function (assert) {
    let result = withinRange(1, 0, 1);
    assert.ok(result);
  });

  test('it returns value if it falls within range', function (assert) {
    let result = withinRange(1.5, 1, 2);
    assert.strictEqual(result, 1.5);
  });

  test('it returns min if value is less than min', function (assert) {
    let result = withinRange(0.5, 1, 2);
    assert.strictEqual(result, 1);
  });

  test('it returns max if value is greater than max', function (assert) {
    let result = withinRange(3, 1, 2);
    assert.strictEqual(result, 2);
  });
});
