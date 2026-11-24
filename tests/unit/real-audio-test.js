import { module, test } from 'qunit';
import { settled } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { Sound, Sampler, Oscillator, Connection } from 'ember-audio';

// These tests use the browser's real Web Audio implementation. Each one renders
// a quarter second through an OfflineAudioContext and inspects the samples.
const RATE = 44100;
const FRAMES = RATE / 4;

function offlineContext() {
  const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  return new Ctx(2, FRAMES, RATE);
}

// A mono buffer holding a constant 1.0, so rendered peaks equal the gain applied.
function constantBuffer(ctx) {
  const buffer = ctx.createBuffer(1, FRAMES, RATE);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = 1;
  }
  return buffer;
}

function newSound(ctx) {
  return Sound.create({ audioContext: ctx, audioBuffer: constantBuffer(ctx) });
}

function peak(rendered, channel) {
  const data = rendered.getChannelData(channel);
  let max = 0;
  for (let i = 0; i < data.length; i++) {
    const v = Math.abs(data[i]);
    if (v > max) {
      max = v;
    }
  }
  return max;
}

function near(assert, actual, expected, message) {
  assert.ok(
    Math.abs(actual - expected) < 0.01,
    `${message}: expected ~${expected.toFixed(4)}, got ${actual.toFixed(4)}`
  );
}

// StereoPannerNode equal-power law for a mono input.
function pannedPeaks(gain, pan) {
  const x = ((pan + 1) / 2) * (Math.PI / 2);
  return [gain * Math.cos(x), gain * Math.sin(x)];
}

module('Unit | Real audio', function () {
  test('gain and pan can be set on the line after a sound is created', function (assert) {
    const sound = newSound(offlineContext());

    sound.changeGainTo(0.5).from('ratio');
    sound.changePanTo(0.25);

    assert.strictEqual(sound.getNodeFrom('gain').gain.value, 0.5);
    assert.strictEqual(sound.getNodeFrom('panner').pan.value, 0.25);
  });

  test('a sampler plays a brand new sound with its gain and pan applied', async function (assert) {
    const ctx = offlineContext();
    const sampler = Sampler.create({
      sounds: new Set([newSound(ctx)]),
      gain: 0.5,
      pan: 0.25,
    });

    sampler.play();

    const rendered = await ctx.startRendering();
    const [left, right] = pannedPeaks(0.5, 0.25);
    near(assert, peak(rendered, 0), left, 'left channel');
    near(assert, peak(rendered, 1), right, 'right channel');
  });

  test('a sound started before observers settle can still be stopped', async function (assert) {
    const ctx = offlineContext();
    const sound = newSound(ctx);

    sound.play();
    await settled();
    // Stops at context time zero, so the source that started must go silent.
    sound.stop();

    const rendered = await ctx.startRendering();
    assert.strictEqual(peak(rendered, 0), 0, 'left channel is silent');
    assert.strictEqual(peak(rendered, 1), 0, 'right channel is silent');
  });

  test('an inserted effect is usable on the next line and shapes the output', async function (assert) {
    const ctx = offlineContext();
    const sound = newSound(ctx);
    const trim = Connection.create({
      name: 'trim',
      source: 'audioContext',
      createCommand: 'createGain',
    });

    sound.get('connections').insertAt(1, trim);
    const node = sound.getNodeFrom('trim');
    assert.ok(node, 'the new connection has its audio node');
    node.gain.value = 0.5;

    sound.play();

    const rendered = await ctx.startRendering();
    const [left, right] = pannedPeaks(0.5, 0);
    near(assert, peak(rendered, 0), left, 'left channel');
    near(assert, peak(rendered, 1), right, 'right channel');
  });

  test('removing an effect restores the direct route', async function (assert) {
    const ctx = offlineContext();
    const sound = newSound(ctx);
    const mute = Connection.create({
      name: 'mute',
      source: 'audioContext',
      createCommand: 'createGain',
    });

    sound.get('connections').insertAt(1, mute);
    sound.getNodeFrom('mute').gain.value = 0;
    sound.removeConnection('mute');

    sound.play();

    const rendered = await ctx.startRendering();
    const [left, right] = pannedPeaks(1, 0);
    near(assert, peak(rendered, 0), left, 'left channel');
    near(assert, peak(rendered, 1), right, 'right channel');
  });

  test('an oscillator makes sound right after it is created', async function (assert) {
    const ctx = offlineContext();
    const oscillator = Oscillator.create({
      audioContext: ctx,
      frequency: 440,
      gain: 0.5,
    });

    oscillator.play();

    const rendered = await ctx.startRendering();
    const [left, right] = pannedPeaks(0.5, 0);
    near(assert, peak(rendered, 0), left, 'left channel');
    near(assert, peak(rendered, 1), right, 'right channel');
  });

  test('an oscillator started before observers settle can still be stopped', async function (assert) {
    const ctx = offlineContext();
    const oscillator = Oscillator.create({ audioContext: ctx, frequency: 440 });

    oscillator.play();
    await settled();
    oscillator.stop();

    const rendered = await ctx.startRendering();
    assert.strictEqual(peak(rendered, 0), 0, 'left channel is silent');
    assert.strictEqual(peak(rendered, 1), 0, 'right channel is silent');
  });

  test('a destroyed sound stops reacting to routing edits', async function (assert) {
    const sound = newSound(offlineContext());
    const connections = sound.get('connections');

    // Ember 2.18 only allows destroy inside a run loop while testing.
    run(() => sound.destroy());
    await settled();
    assert.strictEqual(sound.isDestroyed, true);

    const late = Connection.create({
      name: 'late',
      source: 'audioContext',
      createCommand: 'createGain',
    });
    run(() => connections.insertAt(1, late));
    await settled();
    assert.strictEqual(late.node, null, 'no node was created for it');
  });
});
