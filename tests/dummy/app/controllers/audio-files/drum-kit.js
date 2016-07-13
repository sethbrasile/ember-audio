import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  drums: Ember.A(),
  isLoading: true,

  initBeats: Ember.on('init', function() {
    Ember.RSVP.all([
      this._loadSamplerFor('kick'),
      this._loadSamplerFor('snare'),
      this._loadSamplerFor('hihat')
    ])
    .then(() => this.set('isLoading', false));
  }),

  _loadSamplerFor(name) {
    // 'snare1.wav', 'kick2.wav', etc..., from this project's public folder
    const drums = [
      `/ember-audio/drum-samples/${name}1.wav`,
      `/ember-audio/drum-samples/${name}2.wav`,
      `/ember-audio/drum-samples/${name}3.wav`
    ];

    // If name === 'kick', this creates a Sampler instance called
    // 'kick' that contains the sounds 'kick1', 'kick2', and 'kick3'
    return this.get('audio').load(drums).asSampler(name).then((drum) => {
      this.get('drums').pushObject(drum);
    });
  },

  actions: {
    playDrum(drum) {
      drum.play();
    }
  }
});
