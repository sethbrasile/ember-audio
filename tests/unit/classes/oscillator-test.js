import { Oscillator } from 'ember-audio';
import ContextMock from '../../helpers/context-mock';
import { module, test } from 'qunit';

module('Unit | Class | oscillator', function () {
  // Replace this with your real tests.
  test('it exists', function (assert) {
    let audioContext = ContextMock.create();
    let result = Oscillator.create({ audioContext });
    assert.ok(result);
  });

  test('creates one oscillator at initialization and a fresh one for playback', function (assert) {
    let sourceCount = 0;
    const audioContext = ContextMock.extend({
      createOscillator() {
        sourceCount++;
        return this._super(...arguments);
      },
    }).create();

    const oscillator = Oscillator.create({ audioContext });
    assert.strictEqual(sourceCount, 1);
    oscillator.play();
    assert.strictEqual(sourceCount, 2);
    assert.true(oscillator.getNodeFrom('audioSource').startCalled);
  });
});
