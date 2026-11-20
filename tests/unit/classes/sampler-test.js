import { Sampler, Sound } from 'ember-audio';
import { settled } from '@ember/test-helpers';
import ContextMock from '../../helpers/context-mock';
import { module, test } from 'qunit';

module('Unit | Class | sampler', function () {
  // Replace this with your real tests.
  test('it exists', function (assert) {
    let result = Sampler.create();
    assert.ok(result);
  });

  test('a new sound can play immediately and stop after observers settle', async function (assert) {
    const sound = Sound.create({ audioContext: ContextMock.create() });
    const sampler = Sampler.create({
      sounds: new Set([sound]),
      gain: 0.5,
      pan: 0.25,
    });

    sampler.play();
    const source = sound.getNodeFrom('audioSource');
    assert.true(source.startCalled);
    assert.strictEqual(sound.getNodeFrom('gain').gain.value, 0.5);
    assert.strictEqual(sound.getNodeFrom('panner').pan.value, 0.25);

    await settled();
    sound.stop();
    assert.strictEqual(source.stopTime, sound.audioContext.currentTime);
  });
});
