import Sound from 'ember-audio/utils/sound';
import ContextMock from '../../helpers/context-mock';
import AudioBufferMock from '../../helpers/audio-buffer-mock';
import { module, test } from 'qunit';

module('Unit | Utility | sound');

const audioContext = ContextMock.create();

test('it exists', function(assert) {
  let result = Sound.create({ audioContext });
  assert.ok(result);
});

test('on init, a gainNode, analyserNode, and pannerNode are created', function(assert) {
  let result = Sound.create({ audioContext });
  let ctx = result.get('audioContext');

  assert.ok(ctx.get('createGainCalled'));
  assert.ok(ctx.get('createAnalyserCalled'));
  assert.ok(ctx.get('createStereoPannerCalled'));
});

test('duration.raw works', function(assert) {
  const audioBuffer = AudioBufferMock.create();

  let result = Sound.create({ audioContext, audioBuffer });
  assert.equal(result.get('duration.raw'), 65);
});

test('duration.string works', function(assert) {
  const audioBuffer = AudioBufferMock.create();

  let result = Sound.create({ audioContext, audioBuffer });
  assert.equal(result.get('duration.string'), '01:05');

  result.set('audioBuffer.duration', 40);
  assert.equal(result.get('duration.string'), '00:40');

  result.set('audioBuffer.duration', 60);
  assert.equal(result.get('duration.string'), '01:00');

  result.set('audioBuffer.duration', 600);
  assert.equal(result.get('duration.string'), '10:00');

  result.set('audioBuffer.duration', 6001);
  assert.equal(result.get('duration.string'), '100:01');

  result.set('audioBuffer.duration', 6012);
  assert.equal(result.get('duration.string'), '100:12');
});

test('duration.pojo works', function(assert) {
  const audioBuffer = AudioBufferMock.create();

  let result = Sound.create({ audioContext, audioBuffer });
  assert.deepEqual(result.get('duration.pojo'), {
    minutes: 1,
    seconds: 5
  });

  result.set('audioBuffer.duration', 40);
  assert.deepEqual(result.get('duration.pojo'), {
    minutes: 0,
    seconds: 40
  });

  result.set('audioBuffer.duration', 60);
  assert.deepEqual(result.get('duration.pojo'), {
    minutes: 1,
    seconds: 0
  });
});

test('percentGain works', function(assert) {
  let result = Sound.create({ audioContext });
  assert.equal(result.get('percentGain'), 40);
});
