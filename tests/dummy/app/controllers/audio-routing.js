import Ember from 'ember';

export default Ember.Controller.extend({
  audio: Ember.inject.service(),

  initAudioFile: Ember.on('init', function() {
    // Eb5.mp3 is an mp3 file located in the "public" folder
    this.get('audio').load('Eb5.mp3').asSound('piano-note').then((note) => {
      this.set('note', note);
    });
  }),

  distortionNode: Ember.computed.filterBy('note.connections', 'name', 'distortionNode'),
  distortionEnabled: Ember.computed.gt('distortionNode.length', 0),

  actions: {
    playSound() {
      this.get('audio').getSound('piano-note').play();
    },

    toggleDistortion() {
      const distortion = this.get('audio.context').createWaveShaper();

      if (this.get('distortionEnabled')) {
        const node = this.get('distortionNode.firstObject');
        node.node.disconnect();
        this.get('note.connections').removeObject(node);
        return;
      }

      function makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        let x;

        for (let i = 0; i < n_samples; ++i) {
          x = i * 2 / n_samples - 1;
          curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
        }

        return curve;
      };

      distortion.curve = makeDistortionCurve(400);
      distortion.oversample = '4x';

      this.get('note.connections').insertAt(1, {
        name: 'distortionNode',
        node: distortion
      });
    }
  }
});
