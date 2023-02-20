import { Track } from 'ember-audio';
import ContextMock from '../../helpers/context-mock';
import AudioBufferMock from '../../helpers/audio-buffer-mock';
import { module, test } from 'qunit';

module('Unit | Class | track', function () {
  const audioContext = ContextMock.create();

  test('position.raw works', function (assert) {
    let result = Track.create({ audioContext, startOffset: 65 });
    assert.strictEqual(result.get('position.raw'), 65);
  });

  test('position.string works', function (assert) {
    let result = Track.create({ audioContext, startOffset: 65 });

    assert.strictEqual(result.get('position.string'), '01:05');

    result.set('startOffset', 40);
    assert.strictEqual(result.get('position.string'), '00:40');

    result.set('startOffset', 40.12765);
    assert.strictEqual(result.get('position.string'), '00:40');

    result.set('startOffset', 60);
    assert.strictEqual(result.get('position.string'), '01:00');

    result.set('startOffset', 600);
    assert.strictEqual(result.get('position.string'), '10:00');

    result.set('startOffset', 6001);
    assert.strictEqual(result.get('position.string'), '100:01');

    result.set('startOffset', 6012);
    assert.strictEqual(result.get('position.string'), '100:12');
  });

  test('position.pojo works', function (assert) {
    let result = Track.create({ audioContext, startOffset: 65 });
    assert.deepEqual(result.get('position.pojo'), {
      minutes: 1,
      seconds: 5,
    });

    result.set('startOffset', 40);
    assert.deepEqual(result.get('position.pojo'), {
      minutes: 0,
      seconds: 40,
    });

    result.set('startOffset', 60);
    assert.deepEqual(result.get('position.pojo'), {
      minutes: 1,
      seconds: 0,
    });
  });

  test('percentPlayed works', function (assert) {
    const audioBuffer = AudioBufferMock.create({ duration: 90 });

    let result = Track.create({ audioContext, audioBuffer, startOffset: 63 });
    assert.strictEqual(result.get('percentPlayed'), 70);
  });
});
