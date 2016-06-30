import Ember from 'ember';

const ContextMock = Ember.Object.extend({
  createBufferSourceCalled: false,
  connectCalled: false,
  startCalled: false,
  createGainCalled: false,
  createAnalyserCalled: false,
  bufferSource: null,
  destination: Ember.computed.reads('elementId'),

  createBufferSource() {
    this.set('createBufferSourceCalled', true);
    this.set('bufferSource', ContextMock.create());
    return this.get('bufferSource');
  },
  connect(object) {
    this.set('connectCalled', true);
    this.set('connectedObject', object);
  },
  start() {
    this.set('startCalled', true);
  },
  createStereoPanner() {
    this.set('panner', { pan: { value: 0 } });
    return this.get('panner');
  },
  createGain() {
    this.set('createGainCalled', true);
  },
  createAnalyser() {
    this.set('createAnalyserCalled', true);
  },
  decodeAudioData(data) {
    return new Ember.RSVP.Promise((resolve) => resolve(data));
  }
});

export default ContextMock;
