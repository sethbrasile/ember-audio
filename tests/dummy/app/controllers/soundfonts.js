import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  notes: null,

  initSoundFont: Ember.on('init', function() {
    this.get('audio').loadSoundFont('piano-font', 'piano.js')
      .then((notes) => this.set('notes', notes));
  }),

  actions: {
    playNoteFromSoundFont(note) {
      this.get('audio').play('piano-font', note);
    }
  }
});
