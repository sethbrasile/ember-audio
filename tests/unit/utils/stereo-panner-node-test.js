import StereoPannerNode from 'ember-audio/utils/stereo-panner-node';
import { module, test } from 'qunit';

// The panner itself only runs in browsers without a native one (Safari before
// 14.1). Current browsers reject the channel settings it relies on, so these
// tests cover what loads and runs everywhere.
module('Unit | Utility | stereo panner node', function() {
  test('it can be imported and offers polyfill and install', function(assert) {
    assert.strictEqual(typeof StereoPannerNode, 'function');
    assert.strictEqual(typeof StereoPannerNode.polyfill, 'function');
    assert.strictEqual(typeof StereoPannerNode.install, 'function');
  });

  test('polyfill leaves a native createStereoPanner alone', function(assert) {
    const original = window.AudioContext.prototype.createStereoPanner;
    assert.ok(original, 'this browser has a native panner');

    StereoPannerNode.polyfill();

    assert.strictEqual(window.AudioContext.prototype.createStereoPanner, original);
  });

  test('a native panner counts as a StereoPannerNode', function(assert) {
    const ctx = new window.OfflineAudioContext(2, 128, 44100);

    assert.ok(ctx.createStereoPanner() instanceof StereoPannerNode);
    assert.notOk(ctx.createGain() instanceof StereoPannerNode);
  });
});
