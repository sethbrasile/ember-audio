import { arraySwap, flatten } from 'ember-audio/utils';
import { module, test } from 'qunit';

module('Unit | Utility | array methods', function () {
  test('arraySwap works', function (assert) {
    let result = arraySwap(['a', 'b', 'c', 'd', 'e'], 2);
    assert.deepEqual(['c', 'd', 'e', 'a', 'b'], result);
  });

  test('flatten works', function (assert) {
    let result = flatten([
      [1, 2],
      [3, 4],
    ]);
    assert.deepEqual([1, 2, 3, 4], result);
  });
});
