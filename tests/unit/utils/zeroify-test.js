import { zeroify } from 'ember-audio/utils';
import { module, test } from 'qunit';

module('Unit | Utility | zeroify', function () {
  test('it exists', function (assert) {
    let result = zeroify();
    assert.ok(result);
  });

  test('it works for 4', function (assert) {
    let result = zeroify(4);
    assert.strictEqual(result, '04');
  });

  test('it works for 4.77865', function (assert) {
    let result = zeroify(4.77865);
    assert.strictEqual(result, '04');
  });

  test('it works for 10', function (assert) {
    let result = zeroify(10);
    assert.strictEqual(result, '10');
  });

  test('it works for 17', function (assert) {
    let result = zeroify(17);
    assert.strictEqual(result, '17');
  });

  test('it works for 175', function (assert) {
    let result = zeroify(175);
    assert.strictEqual(result, '175');
  });
});
