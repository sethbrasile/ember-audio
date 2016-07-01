import Ember from 'ember';

const NodeObject = Ember.Object.extend({
  connectCalled: false,
  startCalled: false,

  connect(obj) {
    this.set('connectCalled', true);
    this.set('connectedObject', obj);
  },

  start() {
    this.set('startCalled', true);
  }
});

const ContextMock = Ember.Object.extend({
  createBufferSourceCalled: false,
  createGainCalled: false,
  createAnalyserCalled: false,
  createStereoPannerCalled: false,

  initDestination: Ember.on('init', function() {
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

  decodeAudioData(data) {
    return new Ember.RSVP.Promise((resolve) => resolve(data));
  }
});

export default ContextMock;
