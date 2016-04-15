import Ember from 'ember';
import request from '../utils/request';
import { flatten } from '../utils/array-methods';
import { base64ToUint8, mungeSoundFont } from '../utils/decode-base64';
import {
  Note,
  octaveShift,
  octaveSort,
  extractOctaves,
  stripDuplicateOctaves,
  createOctavesWithNotes
} from '../utils/note';

const {
  RSVP: { all },
  Service
} = Ember;

export default Service.extend({
  /**
   * context - An AudioContext instance from the web audio api. **NOT**
   * available in all browsers. Not available in any version of IE (except EDGE)
   * as of April 2016.
   */
  context: new AudioContext(),

  /**
  * load - Loads and decodes an audio file and sets it on this service by "name"
  *
  * @param {string}   name  The name that you will use to refer to the sound
  * @param {string}   src   url (relative or fully qualified) to the audio file
  * @return {promise}       a promise that resolves when the sound file has
  * been successfully decoded. The resolved promise does not have a value.
  **/
  load(name, src) {
    if (this.get(name)) {
      return this._alreadyLoadedError(name);
    }

    return request(src)
      .then((arrayBuffer) => this._decodeAudioData(arrayBuffer))
      .then((decodedAudio) => this.set(name, decodedAudio))
      .catch((err) => console.error('ember-audio:', err));
  },

  /**
   * loadSoundFont - Loads a soundfont.js file and decodes it, placing it on
   * this service by "name"
   *
   * @param  {type}     name  the name that you will refer to this sound font by.
   * @param  {type}     src   URL (relative or fully qualified) to the sound font.
   * @return {promise}        a promise that resolves when the sound font has
   * been successfully decoded. The promise resolves to an array of sorted note
   * names.
   */
  loadSoundFont(name, src) {
    if (this.get(name)) {
      return this._alreadyLoadedError(name);
    }

    this.set(name, Ember.Object.create());

    return request(src, 'text')

      // Strip extraneous stuff from soundfont (which is currently a long string)
      // and split by line into an array
      .then(mungeSoundFont)

      // Split each line from the sound font into a key and value
      // key = note name, value = ready-to-play audio decoded from base64
      .then((audioData) => this._extractDecodedKeyValuePairs(audioData))

      // Create a "note" Ember.Object for each note from the decoded audio data
      .then((audioData) => this._createNoteObjects(audioData, name))

      // get octaves so that we can sort based on them
      .then(extractOctaves)

      // Each octave has tons of duplicates
      .then(stripDuplicateOctaves)

      // Create array of arrays. Each inner array contains all the notes in an octave
      .then(createOctavesWithNotes)

      // Sort the notes in each octave, alphabetically, flats before naturals
      .then(octaveSort)

      // Determine last note of first octave, then for each octave, split at
      // that note, then shift the beginning notes to the end
      .then(octaveShift)

      // Flatten array of arrays into a flat array
      .then(flatten);
  },

  /**
   * play - play an audio file or a note from a sound font.
   *
   * @param  {string}   name The name of the audio file or sound font you wish to play
   * @param  {string}   note The name of the note you wish to play if "name"
   * refers to a sound font. If "name" refers to a sound font, this parameter
   * is **required**
   */
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
   * pan - Pans a sound left or right - must be called after the sound has been
   * loaded
   *
   * @param  {type} name  The name of the sound you would like to pan
   * @param  {int} value  The direction and amount between -1 (hard left) and
   * 1 (hard right)
   */
  pan(name, value) {
    let panner = this.get(`${name}Panner`);

    if (!panner) {
      panner = this.get('context').createStereoPanner();
    }

    panner.pan.value = value;
    this.set(`${name}Panner`, panner);
  },

  /**
   * _decodeAudioData - calls context's decodeAudioData()
   * just a convenience method. Avoids having to call "this.get('context')" in
   * a couple places.
   *
   * @param  {ArrayBuffer}  data
   * @return {promise}      description
   * @private
   */
  _decodeAudioData(data) {
    return this.get('context').decodeAudioData(data);
  },

  /**
   * _alreadyLoadedError - Just throws an error. For when a sound's name is
   * accidentally used a 2nd time without being unloaded first
   *
   * @param  {string} name  The name of the sound that has already been loaded
   * @private
   */
  _alreadyLoadedError(name) {
    throw new Ember.Error(`You tried to load a sound or soundfont called "${name}", but it already exists. You need to use a different name, or set the first instance to "null".`);
  },

  _createNoteObjects(audioData, name) {
    // Set audio data on previously created Ember.Object called ${name}
    return audioData.map((note) => {
      const noteName = note[0];
      const noteBuffer = note[1];
      const letter = noteName[0];

      let octave = noteName[2];
      let accidental;

      if (octave) {
        accidental = noteName[1];
      } else {
        octave = noteName[1];
      }

      this.set(`${name}.${noteName}`, noteBuffer);

      return Note.create({ letter, octave, accidental });
    });
  },

  _extractDecodedKeyValuePairs(data) {
    const promises = data.map((item) => {
      // Note values always start with "//u"
      const note = item.split('//u');
      const noteName = note[0].trim();

      // Transform base64 note value to Uint8Array
      const noteValue = base64ToUint8(`//u${note[1]}`);

      // Get web audio api audio data from array buffer, include note name
      return this._decodeAudioData(noteValue.buffer)
        .then((buffer) => [noteName, buffer]);
    });

    // Wait for array of promises to resolve before continuing
    return all(promises);
  }
});
