import Ember from 'ember';

const {
  Object: EmberObject,
  on,
  RSVP: { Promise }
} = Ember;

const NodeObject = EmberObject.extend({
  connectCalled: false,
  startCalled: false,

  startTime: null,
  stopTime: null,

  pan: { value: null },
  gain: { value: null },

  connect(obj) {
    this.set('connectCalled', true);
    this.set('connectedObject', obj);
  },

  start(time) {
    this.set('startTime', time);
    this.set('startCalled', true);
  },

  stop(time) {
    this.set('stopTime', time);
    this.set('stopCalled', true);
  }
});

const ContextMock = EmberObject.extend({
  currentTime: 110,
  createBufferSourceCalled: false,
  createGainCalled: false,
  createAnalyserCalled: false,
  createStereoPannerCalled: false,
  createBiqaudFilterCalled: false,
  createOscillatorCalled: false,

  initDestination: on('init', function() {
    this.destination = {};
  }),

  createBufferSource() {
    this.set('createBufferSourceCalled', true);
    return NodeObject.create();
  },

  createStereoPanner() {
    this.set('createStereoPannerCalled', true);
    return NodeObject.create();
  },

  createGain() {
    this.set('createGainCalled', true);
    return NodeObject.create({
      gain: { value: 0.4 }
    });
  },

  createAnalyser() {
    this.set('createAnalyserCalled', true);
    return NodeObject.create();
  },

  createBiqaudFilter() {
    this.set('createBiqaudFilterCalled', true);
    return NodeObject.create();
  },

  createOscillator() {
    this.set('createOscillatorCalled', true);
    return NodeObject.create();
  },

  decodeAudioData(data) {
    return new Promise((resolve) => resolve(data));
  }
});

export default ContextMock;
