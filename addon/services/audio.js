import Ember from 'ember';

export default Ember.Service.extend({
  /**
  * The base Howler Object: Allows you to change global settings
  * https://github.com/goldfire/howler.js/tree/2.0#global-core-methods
  **/
  Howler,

  /**
   * The base Howl object: Has no use to the consuming app, exists here for testing purposes
   */
  Howl,

  /**
  * Array of strings (names of sounds) that acts as a registry for sound instances
  **/
  sounds: Ember.A(),

  context: new AudioContext(),

  /**
  * Instantiate a "sound" and place on this service by name
  *
  * @param {string}           name  The name that you will use to refer to the sound
  * @param {array || string}  src   path, as a string, or an array of strings, to the sound's mp3 file(s). Can be URLs or base64 data URIs. https://github.com/goldfire/howler.js/tree/2.0#src-array--required
  * @param {object}           opts  An optional POJO that accepts Howler options https://github.com/goldfire/howler.js/tree/2.0#more-playback-options
  * @return {object}                A Howler "Howl" object instance
  **/
  load(name, src, opts={}) {
    const ctx = this.get('context');
    return fetch(src)
      .then((response) => response.arrayBuffer())
      .then((response) => ctx.decodeAudioData(response))
      .then((decodedAudio) => {
        this.set(name, decodedAudio);
        this.get('sounds').pushObject(name);
      });
  },

  loadSoundFont(name, src) {
    const ctx = this.get('context');

    this.set(name, Ember.Object.create());

    return fetch(src)
      .then((response) => response.text())
      .then((text) => {
        // Strip out all the unnecessary stuff
        const array = text
          .replace(new RegExp('data:audio/mp3;base64,', 'g'), '')
          .replace(new RegExp('data:audio/mpeg;base64,', 'g'), '')
          .replace(new RegExp('data:audio/ogg;base64,', 'g'), '')
          .replace(new RegExp(':', 'g'), '')
          .replace(new RegExp('"', 'g'), '')
          // sometimes sound fonts have a blank line at the top and bottom
          .trim()
          .split('\n')
          .slice(3);

        // remove the trailing "}"
        array.pop();

        // Filter out empty string values
        return array.filter(Boolean);
      })
      .then((data) => {
        const promises = data.map((item) => {
          // Note names and values are separated with a space
          const note = item.split(' ');
          const noteName = note[0];

          // Transform base64 note value to Uint8Array
          const noteValue = this.base64DecodeToArray(note[1]);

          // Get web audio api audio data from array buffer, include note name
          return ctx.decodeAudioData(noteValue.buffer)
            .then((buffer) => [noteName, buffer]);
        });

        // Wait for array of promises to resolve before continuing
        return Ember.RSVP.all(promises);
      })
      .then((audio) => {
        // Set audio data on previously created Ember.Object called ${name}
        return audio.map((note) => {
          this.set(`${name}.${note[0]}`, note[1]);
          return note[0];
        });
      });
  },

  play(name, note) {
    const ctx = this.get('context');
    const panner = this.get(`${name}Panner`);
    const node = ctx.createBufferSource();
    let decodedAudio;

    if (note) {
      decodedAudio = this.get(`${name}.${note}`);
    } else {
      decodedAudio = this.get(name);
    }

    if (panner) {
      node.connect(panner);
      panner.connect(ctx.destination);
    } else {
      node.connect(ctx.destination);
    }

    node.buffer = decodedAudio;
    node.start();
  },

  /**
   * unload - Removes a sound from this service by "name" and unloads it from Howler
   *
   * @param  {string} name The name of the sound you would like to unload
   */
  unload(name) {
    this.get(name).unload();
    this.set(name, null);
    this.get('sounds').removeObject(name);
  },

  /**
   * pan - Pans a sound left or right
   *
   * @param  {type} name  The name of the sound you would like to pan
   * @param  {int} value  The direction and amount between -1 (hard left) and 1 (hard right)
   * @return {object}     The Howler "Howl" object instance
   */
  pan(name, value) {
    const panner = this.get('context').createStereoPanner();
    panner.pan.value = value;

    this.set(`${name}Panner`, panner);
  },

  base64DecodeToArray(sBase64, nBlocksSize) {
    var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, "");
    var nInLen = sB64Enc.length;
    var nOutLen = nBlocksSize ?
      Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize :
      nInLen * 3 + 1 >> 2;
    var taBytes = new Uint8Array(nOutLen);

    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
      nMod4 = nInIdx & 3;
      nUint24 |= this.b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
      if (nMod4 === 3 || nInLen - nInIdx === 1) {
        for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
          taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
        }
        nUint24 = 0;
      }
    }

    return taBytes;
  },

  b64ToUint6 (nChr) {
  return nChr > 64 && nChr < 91 ?
      nChr - 65
    : nChr > 96 && nChr < 123 ?
      nChr - 71
    : nChr > 47 && nChr < 58 ?
      nChr + 4
    : nChr === 43 ?
      62
    : nChr === 47 ?
      63
    :
      0;

}
});
