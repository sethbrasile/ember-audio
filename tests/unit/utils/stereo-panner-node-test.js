import StereoPannerNode from 'ember-audio/utils/stereo-panner-node';
import { module, test } from 'qunit';

// The panner only runs in browsers without a native one (Safari before 14.1),
// and current browsers reject the channel settings it relies on. So its wiring
// is checked against stand-in nodes, not against real audio.
function fakeContext() {
  const created = [];
  const node = (kind) => () => {
    const made = {
      kind,
      gain: { value: 1 },
      connections: [],
      connect(target, output, input) {
        this.connections.push({ target, output, input });
      }
    };
    created.push(made);
    return made;
  };

  return {
    created,
    ofKind: (kind) => created.filter((made) => made.kind === kind),
    createChannelSplitter: node('splitter'),
    createChannelMerger: node('merger'),
    createWaveShaper: node('shaper'),
    createGain: node('gain')
  };
}

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

  test('a panner exposes pan, starting at the value it was given', function(assert) {
    assert.strictEqual(new StereoPannerNode(fakeContext()).pan.value, 0, 'centered by default');
    assert.strictEqual(new StereoPannerNode(fakeContext(), { pan: -0.5 }).pan.value, -0.5);
  });

  test('a panner splits the input, scales each side, and merges them back', function(assert) {
    const ctx = fakeContext();
    const panner = new StereoPannerNode(ctx, { pan: 0.25 });
    const [ splitter ] = ctx.ofKind('splitter');
    const [ merger ] = ctx.ofKind('merger');
    const [ dc, fix, left, right ] = ctx.ofKind('shaper');
    const [ pan, gainLeft, gainRight ] = ctx.ofKind('gain');
    const targets = (made) => made.connections.map((connection) => connection.target);

    assert.strictEqual(panner, splitter, 'the splitter is the node callers hold');
    assert.strictEqual(panner.pan, pan.gain, 'pan is the gain of the pan node');

    assert.deepEqual(splitter.connections, [
      { target: gainLeft, output: 0, input: undefined },
      { target: gainRight, output: 1, input: undefined },
      { target: dc, output: 1, input: undefined },
      { target: fix, output: 1, input: undefined }
    ], 'the splitter feeds both sides and the pan signal');
    assert.deepEqual(targets(dc), [ pan ]);
    assert.deepEqual(targets(fix), [ pan.gain ]);
    assert.deepEqual(targets(pan), [ left, right ]);
    assert.deepEqual(targets(left), [ gainLeft.gain ], 'the left curve drives the left gain');
    assert.deepEqual(targets(right), [ gainRight.gain ], 'the right curve drives the right gain');
    assert.deepEqual(gainLeft.connections, [{ target: merger, output: 0, input: 0 }]);
    assert.deepEqual(gainRight.connections, [{ target: merger, output: 0, input: 1 }]);

    assert.strictEqual(gainLeft.gain.value, 0, 'each side starts silent until the pan signal arrives');
    assert.strictEqual(gainRight.gain.value, 0);
  });

  test('the two curves are an equal-power pan law', function(assert) {
    const ctx = fakeContext();
    new StereoPannerNode(ctx);
    const [ , , left, right ] = ctx.ofKind('shaper');
    const middle = left.curve.length / 2;

    assert.strictEqual(left.curve.length, 4096);
    assert.strictEqual(left.curve[0], 1, 'hard left is all left');
    assert.strictEqual(right.curve[0], 0);
    assert.ok(Math.abs(left.curve[middle] - Math.SQRT1_2) < 1e-6, 'center is equal on both sides');
    assert.ok(Math.abs(right.curve[middle] - Math.SQRT1_2) < 1e-6);
    assert.ok(right.curve[4095] > 0.9999, 'hard right is all right');
  });

  test('the pan signal is a constant that the pan value scales', function(assert) {
    const ctx = fakeContext();
    new StereoPannerNode(ctx);
    const [ dc, fix ] = ctx.ofKind('shaper');

    assert.deepEqual(Array.from(dc.curve), [ 1, 1 ], 'any input becomes a steady 1 for pan to scale');
    assert.deepEqual(Array.from(fix.curve), [ 0, 0 ], 'the keep-alive signal adds nothing to pan');
  });

  test('every node gets the channel settings the pan math depends on', function(assert) {
    const ctx = fakeContext();
    new StereoPannerNode(ctx);
    const settings = (made) => [ made.channelCount, made.channelCountMode, made.channelInterpretation ];
    const [ splitter ] = ctx.ofKind('splitter');

    assert.deepEqual(settings(splitter), [ 2, 'explicit', 'speakers' ], 'the input is treated as stereo');
    ctx.created.filter((made) => made !== splitter).forEach((made) => {
      assert.deepEqual(settings(made), [ 1, 'explicit', 'discrete' ], `${made.kind} carries one plain channel`);
    });
    assert.strictEqual(ctx.created.length, 9);
  });

  test('connecting or disconnecting a panner acts on its output side', function(assert) {
    const { connect, disconnect } = window.AudioNode.prototype;
    const calls = [];
    const target = {};
    let ctx, panner;

    // The panner borrows these two methods from AudioNode when it is built.
    try {
      window.AudioNode.prototype.connect = function(...args) {
        calls.push({ method: 'connect', node: this, args });
      };
      window.AudioNode.prototype.disconnect = function(...args) {
        calls.push({ method: 'disconnect', node: this, args });
      };
      ctx = fakeContext();
      panner = new StereoPannerNode(ctx);
    } finally {
      window.AudioNode.prototype.connect = connect;
      window.AudioNode.prototype.disconnect = disconnect;
    }

    const [ merger ] = ctx.ofKind('merger');

    panner.connect(target);
    panner.disconnect(target);

    assert.deepEqual(calls, [
      { method: 'connect', node: merger, args: [ target ] },
      { method: 'disconnect', node: merger, args: [ target ] }
    ]);
  });

  test('polyfill adds createStereoPanner to a context class that lacks it', function(assert) {
    const original = window.BaseAudioContext;
    function LegacyContext() {
      Object.assign(this, fakeContext());
    }

    try {
      window.BaseAudioContext = LegacyContext;
      StereoPannerNode.polyfill();
    } finally {
      window.BaseAudioContext = original;
    }

    const panner = new LegacyContext().createStereoPanner();

    assert.ok('createStereoPanner' in LegacyContext.prototype);
    assert.strictEqual(panner.pan.value, 0);
    assert.strictEqual(window.BaseAudioContext, original, 'the real context class is back');
  });
});
