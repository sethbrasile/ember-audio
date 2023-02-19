import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import { all } from 'rsvp';
import Controller from '@ember/controller';

export default Controller.extend({
  audio: service(),
  beatTracks: null,
  isLoading: true,
  bpm: 120,

  initBeats: on('init', function () {
    all([
      this._loadBeatTrackFor('kick'),
      this._loadBeatTrackFor('snare'),
      this._loadBeatTrackFor('hihat'),
    ]).then((beatTracks) => {
      beatTracks.map((beatTrack) => {
        const name = beatTrack.get('name');

        // default is 4 beats, but we're going to use 16
        beatTrack.set('numBeats', 8);

        // snare and hihat are a little louder than kick, so we'll turn down the gain
        if (name === 'snare' || name === 'hihat') {
          beatTrack.set('gain', 0.4);
        }

        // and let's pan the hihat a little to the left
        if (name === 'hihat') {
          beatTrack.set('pan', -0.3);
        }
      });

      this.set('isLoading', false);
      this.set('beatTracks', beatTracks);
    });
  }),

  _loadBeatTrackFor(name) {
    return this.audio
      .load([
        `/ember-audio/drum-samples/${name}1.wav`,
        `/ember-audio/drum-samples/${name}2.wav`,
        `/ember-audio/drum-samples/${name}3.wav`,
      ])
      .asBeatTrack(name);
  },

  actions: {
    play() {
      this.beatTracks.map((beatTrack) => {
        // playActiveBeats() optionally accepts "noteType" which defaults to "1/4"
        // notes, but we want to use eighth notes
        beatTrack.playActiveBeats(this.bpm, 1 / 8);

        // /* playActiveBeats() is a convenience method. For more control, you could do:
        // http://bradthemad.org/guitar/tempo_explanation.php */
        // const eighthNoteDuration = (240 * 1/8) / this.get('bpm');
        // beatTrack.get('beats').map((beat, beatIndex) => {
        //   /* whatever else you need to do */
        //   beat.ifActivePlayIn(beatIndex * eighthNoteDuration);
        // });
      });
    },

    toggleActive(beat) {
      if (beat.get('active')) {
        beat.set('active', false);
      } else {
        beat.play();
        beat.set('active', true);
      }
    },

    engageLudicrousMode() {
      this.set('bpm', 1000000);

      this.beatTracks.map((beatTrack) => {
        beatTrack.get('beats').map((beat) => {
          beat.set('active', true);
        });
      });
    },
  },
});
