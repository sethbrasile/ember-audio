import exponentialRatio from 'dummy/utils/exponential-ratio';
import { module, test } from 'qunit';

module('Unit | Utility | exponential ratio', function () {
  test('it works', function (assert) {
    let result = exponentialRatio(1);
    assert.ok(result);
  });

  test('it works for 0', function (assert) {
    let result = exponentialRatio(0);
    assert.strictEqual(result, 0);
  });

  test('it works for 0.21', function (assert) {
    let result = exponentialRatio(0.21);
    assert.strictEqual(result, 0.13599518780123843);
  });

  test('it works for 0.5', function (assert) {
    let result = exponentialRatio(0.5);
    assert.strictEqual(result, 0.3775406687981455);
  });

  test('it works for 0.75', function (assert) {
    let result = exponentialRatio(0.75);
    assert.strictEqual(result, 0.6500679912412274);
  });

  test('it works for 0.95', function (assert) {
    let result = exponentialRatio(0.95);
    // This will fail on chrome, pass on firefox.
    // The correct value for chrome is 0.9228460855795179
    assert.strictEqual(result, 0.9228460855795176);
  });

  test('it works for 1', function (assert) {
    let result = exponentialRatio(1);
    assert.strictEqual(result, 1);
  });
});
