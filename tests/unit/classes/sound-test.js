import { Sound } from 'ember-audio';
import { get } from '@ember/object';
import ContextMock from '../../helpers/context-mock';
import AudioBufferMock from '../../helpers/audio-buffer-mock';
import { module, test } from 'qunit';

module('Unit | Class | sound', function () {
  test('it exists', function (assert) {
    let audioContext = ContextMock.create();
    let result = Sound.create({ audioContext });
    assert.ok(result);
  });

  test('on init, a gain, and panner are created', function (assert) {
    let audioContext = ContextMock.create();
    let result = Sound.create({ audioContext });
    let ctx = get(result, 'audioContext');

    assert.ok(get(ctx, 'createGainCalled'));
    assert.ok(get(ctx, 'createStereoPannerCalled'));
  });

  test('duration.raw works', function (assert) {
    let audioContext = ContextMock.create();
    let audioBuffer = AudioBufferMock.create();

    let result = Sound.create({ audioContext, audioBuffer });
    assert.strictEqual(get(result, 'duration.raw'), 65);
  });

  test('duration.string works', function (assert) {
    let audioContext = ContextMock.create();
    let audioBuffer = AudioBufferMock.create();

    let result = Sound.create({ audioContext, audioBuffer });
    assert.strictEqual(get(result, 'duration.string'), '01:05');

    result.set('audioBuffer.duration', 40);
    assert.strictEqual(get(result, 'duration.string'), '00:40');

    result.set('audioBuffer.duration', 60);
    assert.strictEqual(get(result, 'duration.string'), '01:00');

    result.set('audioBuffer.duration', 600);
    assert.strictEqual(get(result, 'duration.string'), '10:00');

    result.set('audioBuffer.duration', 6001);
    assert.strictEqual(get(result, 'duration.string'), '100:01');

    result.set('audioBuffer.duration', 6012);
    assert.strictEqual(get(result, 'duration.string'), '100:12');
  });

  test('duration.pojo works', function (assert) {
    let audioContext = ContextMock.create();
    let audioBuffer = AudioBufferMock.create();

    let result = Sound.create({ audioContext, audioBuffer });
    assert.deepEqual(get(result, 'duration.pojo'), {
      minutes: 1,
      seconds: 5,
    });

    result.set('audioBuffer.duration', 40);
    assert.deepEqual(get(result, 'duration.pojo'), {
      minutes: 0,
      seconds: 40,
    });

    result.set('audioBuffer.duration', 60);
    assert.deepEqual(get(result, 'duration.pojo'), {
      minutes: 1,
      seconds: 0,
    });
  });

  test('percentGain works', function (assert) {
    let audioContext = ContextMock.create();
    let result = Sound.create({ audioContext });
    assert.strictEqual(get(result, 'percentGain'), 40);
  });

  test('play() calls node.connect(ctx.destination)', function (assert) {
    let audioContext = ContextMock.create();
    let result = Sound.create({ audioContext });

    result.getNodeFrom('audioSource').connectCalled = false;

    assert.notOk(result.getNodeFrom('audioSource').connectCalled);
    result.play();
    assert.ok(result.getNodeFrom('audioSource').connectCalled);
  });

  test('play() connects panner', function (assert) {
    let audioContext = ContextMock.create();
    let result = Sound.create({ audioContext });

    result.getNodeFrom('panner').connectCalled = false;

    assert.notOk(result.getNodeFrom('panner').connectCalled);
    result.play();
    assert.ok(result.getNodeFrom('panner').connectCalled);
  });

  test('play() connects gain', function (assert) {
    let audioContext = ContextMock.create();
    let result = Sound.create({ audioContext });

    result.getNodeFrom('gain').connectCalled = false;

    assert.notOk(result.getNodeFrom('gain').connectCalled);
    result.play();
    assert.ok(result.getNodeFrom('gain').connectCalled);
  });

  test(`changePanTo() gets the panner connection and changes it's node's pan value`, function (assert) {
    let audioContext = ContextMock.create();
    let result = Sound.create({ audioContext });
    let panner = result.getNodeFrom('panner');

    result.changePanTo(0.6);
    assert.strictEqual(panner.pan.value, 0.6);

    result.changePanTo(0.4);
    assert.strictEqual(panner.pan.value, 0.4);
  });

  test(`changeGainTo() gets the gain connection and changes it's node's gain value`, function (assert) {
    let audioContext = ContextMock.create();
    let result = Sound.create({ audioContext });
    let gain = result.getNodeFrom('gain');

    result.changeGainTo(0.6).from('ratio');
    assert.strictEqual(gain.gain.value, 0.6);

    result.changeGainTo(0.3).from('inverseRatio');
    assert.strictEqual(gain.gain.value, 0.7);

    result.changeGainTo(20).from('percent');
    assert.strictEqual(gain.gain.value, 0.2);
  });

  test('startOffset starts at 0', function (assert) {
    let audioContext = ContextMock.create();
    let result = Sound.create({ audioContext });
    assert.strictEqual(get(result, 'startOffset'), 0);
  });

  test('seek() sets startOffset', function (assert) {
    let audioContext = ContextMock.create();
    let audioBuffer = AudioBufferMock.create();
    let result = Sound.create({ audioContext, audioBuffer });

    result.seek(2).from('seconds');
    assert.strictEqual(get(result, 'startOffset'), 2);

    result.seek(30).from('percent');
    assert.strictEqual(get(result, 'startOffset'), 19.5);

    result.seek(0.2).from('ratio');
    assert.strictEqual(get(result, 'startOffset'), 13);

    result.seek(0.2).from('inverseRatio');
    assert.strictEqual(get(result, 'startOffset'), 52);
  });

  test('seek() calls stop then play when `isPlaying` is true', function (assert) {
    let audioContext = ContextMock.create();
    let audioBuffer = AudioBufferMock.create();
    let result = Sound.create({ audioContext, audioBuffer, isPlaying: true });

    result.set('stop', () => result.set('stopCalled', true));
    result.set('play', () => result.set('playCalled', true));

    assert.notOk(get(result, 'stopCalled'));
    assert.notOk(get(result, 'playCalled'));

    result.seek(2).from('seconds');

    assert.ok(get(result, 'stopCalled'));
    assert.ok(get(result, 'playCalled'));
  });
});
