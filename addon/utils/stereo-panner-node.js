/**
 * A StereoPannerNode for browsers that have the Web Audio API but lack
 * `createStereoPanner` (Safari before 14.1).
 *
 * Adapted from stereo-panner-node 1.4.0 by Nao Yonamine, MIT licensed:
 * https://github.com/mohayonao/stereo-panner-node
 *
 * The npm package reads the audio context classes from `global`, which
 * browser bundlers no longer define, so importing it threw
 * "global is not defined". This copy reads them from `window` instead.
 *
 * @private
 * @module utils
 * @submodule stereo-panner-node
 */

const WS_CURVE_SIZE = 4096;
const curveL = new Float32Array(WS_CURVE_SIZE);
const curveR = new Float32Array(WS_CURVE_SIZE);
const curveFix = new Float32Array([ 0, 0 ]);
const curveDC = new Float32Array([ 1, 1 ]);

for (let i = 0; i < WS_CURVE_SIZE; i++) {
  curveL[i] = Math.cos((i / WS_CURVE_SIZE) * Math.PI * 0.5);
  curveR[i] = Math.sin((i / WS_CURVE_SIZE) * Math.PI * 0.5);
}

function getBaseAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const BaseAudioContext = window.BaseAudioContext || (OfflineAudioContext && Object.getPrototypeOf(OfflineAudioContext));

  return (typeof BaseAudioContext === 'function' && BaseAudioContext.prototype) ? BaseAudioContext : AudioContext;
}

function StereoPannerNode(audioContext, opts) {
  opts = opts || {};

  const splitter = audioContext.createChannelSplitter(2);
  const wsDC = audioContext.createWaveShaper();
  const wsFix = audioContext.createWaveShaper();
  const pan = audioContext.createGain();
  const wsL = audioContext.createWaveShaper();
  const wsR = audioContext.createWaveShaper();
  const gainL = audioContext.createGain();
  const gainR = audioContext.createGain();
  const merger = audioContext.createChannelMerger(2);
  const panValue = typeof opts.pan === 'number' ? opts.pan : 0;

  splitter.channelCount = 2;
  splitter.channelCountMode = 'explicit';
  splitter.channelInterpretation = 'speakers';
  splitter.connect(gainL, 0);
  splitter.connect(gainR, 1);
  splitter.connect(wsDC, 1);
  splitter.connect(wsFix, 1);

  wsDC.channelCount = 1;
  wsDC.channelCountMode = 'explicit';
  wsDC.channelInterpretation = 'discrete';
  wsDC.curve = curveDC;
  wsDC.connect(pan);

  // A GainNode mutes its output when its gain is 0. This keeps the pan signal
  // flowing so a pan of 0 still positions the sound.
  wsFix.channelCount = 1;
  wsFix.channelCountMode = 'explicit';
  wsFix.channelInterpretation = 'discrete';
  wsFix.curve = curveFix;
  wsFix.connect(pan.gain);

  pan.channelCount = 1;
  pan.channelCountMode = 'explicit';
  pan.channelInterpretation = 'discrete';
  pan.gain.value = panValue;
  pan.connect(wsL);
  pan.connect(wsR);

  wsL.channelCount = 1;
  wsL.channelCountMode = 'explicit';
  wsL.channelInterpretation = 'discrete';
  wsL.curve = curveL;
  wsL.connect(gainL.gain);

  wsR.channelCount = 1;
  wsR.channelCountMode = 'explicit';
  wsR.channelInterpretation = 'discrete';
  wsR.curve = curveR;
  wsR.connect(gainR.gain);

  gainL.channelCount = 1;
  gainL.channelCountMode = 'explicit';
  gainL.channelInterpretation = 'discrete';
  gainL.gain.value = 0;
  gainL.connect(merger, 0, 0);

  gainR.channelCount = 1;
  gainR.channelCountMode = 'explicit';
  gainR.channelInterpretation = 'discrete';
  gainR.gain.value = 0;
  gainR.connect(merger, 0, 1);

  merger.channelCount = 1;
  merger.channelCountMode = 'explicit';
  merger.channelInterpretation = 'discrete';

  Object.defineProperties(splitter, {
    pan: {
      value: pan.gain,
      enumerable: true, writable: false, configurable: true
    },
    connect: {
      value: AudioNode.prototype.connect.bind(merger),
      enumerable: false, writable: false, configurable: true
    },
    disconnect: {
      value: AudioNode.prototype.disconnect.bind(merger),
      enumerable: false, writable: false, configurable: true
    }
  });

  return splitter;
}

/**
 * Adds `createStereoPanner` to audio contexts that do not have it. Does nothing
 * when the browser already provides one.
 *
 * @private
 * @method polyfill
 */
StereoPannerNode.polyfill = function() {
  const BaseAudioContext = getBaseAudioContext();

  if (BaseAudioContext && !('createStereoPanner' in BaseAudioContext.prototype)) {
    StereoPannerNode.install();
  }
};

/**
 * Replaces `createStereoPanner` on audio contexts with this implementation.
 *
 * @private
 * @method install
 */
StereoPannerNode.install = function() {
  Object.defineProperty(getBaseAudioContext().prototype, 'createStereoPanner', {
    value: function() {
      return new StereoPannerNode(this);
    },
    enumerable: false, writable: false, configurable: true
  });
};

if (typeof Symbol === 'function' && typeof Symbol.hasInstance === 'symbol') {
  Object.defineProperty(StereoPannerNode, Symbol.hasInstance, {
    value: function(value) {
      return value instanceof AudioNode && value.pan instanceof AudioParam;
    }
  });
}

export default StereoPannerNode;
