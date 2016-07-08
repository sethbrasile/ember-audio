import Ember from 'ember';

function getBeats() {
  const arr = [];

  // Push 8 Ember.Objects onto an array. This is just to simplify handling "beats" later
  for (let i = 0; i < 8; i++) {
    arr.push(
      Ember.Object.create({
        active: false,
        isPlaying: false,

        // Lets the object have "isPlaying" true for 100ms
        // so that it's easy to make each beat flash as it plays
        markPlaying() {
          this.set('isPlaying', true);

          Ember.run.later(() => this.set('isPlaying', false), 100);
        }
      })
    );
  }

  return arr;
}

export default Ember.Controller.extend({
  audio: Ember.inject.service(),
  drums: null,
  isLoading: true,
  shouldLoop: true,
  bpm: 200,

  loadSound(name) {
    return this.get('audio').load(`/ember-audio/${name}.wav`).asSound(name);
  },

  initBeats: Ember.on('init', function() {
    Ember.RSVP.all([
      this.loadSound('kick'),
      this.loadSound('snare'),
      this.loadSound('hihat')
    ])
    .then((drums) => {
      this.set('isLoading', false);

      const drumObjects = drums.map((sound) => {
        return Ember.Object.create({ sound, beats: getBeats() });
      });

      this.set('drums', drumObjects);
    });
  }),

  actions: {
    play() {
      // Grab the current time
      const time = this.get('audio.context.currentTime');

      // Each drum has beats
      this.get('drums').map((drum) => {

        // And each beat is either active or not
        drum.get('beats').map((beat, beatIndex) => {

          // If a beat is active:
          if (beat.get('active')) {

            // Multiply it's index by the beats per second for the current tempo
            const beatOffset = beatIndex * (60 / this.get('bpm'));

            // Call play on the drum's sound specifying the amount of time from now
            // that it should play; currentTime + beatOffset should do the trick
            drum.get('sound').play(time + beatOffset);

            // Tell the beat to mark itself as "playing" at the same time
            // Ember.run.later accepts milliseconds instead of seconds, so multiply by 1000
            Ember.run.later(() => beat.markPlaying(), beatOffset * 1000);
          }
        });
      });
    },

    toggleActive(beat, drum) {
      if (beat.active) {
        beat.set('active', false);
      } else {
        beat.set('active', true);
        drum.play();
      }
    }
  }
});
