import Ember from 'ember';
const URL = 'https://gist.githubusercontent.com/sethbrasile/5438a4e2700837d6d0e0c3a134ba8ed4/raw/d6d50f3387659c2777f230ed91be51a0e09d75cd/notes-frequencies.json';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),

  initSynth: Ember.on('init', function() {
    this.get('audio').load(URL).asNoteMap('synth-note-map').then((notes) => {
      this.set('notes', notes.slice(34, 51));
    });
  }),

  actions: {
    playNote(note) {
      const osc = this.get('audio.audioContext').createOscillator();

      osc.type = 'square';
      osc.frequency.value = note.frequency; // value in hertz
      osc.start();
      osc.connect(this.get('audio.audioContext.destination'));

      this.set(note.get('identifier'), osc);
    },

    stopNote(note) {
      this.get(note.get('identifier')).stop();
    }
  }
});
