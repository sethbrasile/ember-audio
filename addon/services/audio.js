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
   *
   * http://caniuse.com/#feat=audio-api
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
   * loadSoundFont - creates an Ember.Object called ${instrumentName} then
   * loads a soundfont.js file and decodes all the notes, placing each note on
   * "this.get(instrumentName)" like this.set(`${instrumentName}.${noteName}`)
   * and returns a promise that resolves to an array of properly sorted note
   * names. The notes are sorted the way that they would appear on a piano.
   *
   * @param  {string}     instrumentName  the name that you will refer to this sound font by.
   * @param  {string}     src             URL (relative or fully qualified) to the sound font.
   * @return {promise}                    a promise that resolves when the sound font has
   * been successfully decoded. The promise resolves to an array of sorted note
   * names.
   */
  loadSoundFont(instrumentName, src) {
    if (this.get(instrumentName)) {
      return this._alreadyLoadedError(instrumentName);
    }

    this.set(instrumentName, Ember.Object.create());

    return request(src, 'text')

      // Strip extraneous stuff from soundfont (which is currently a long string)
      // and split by line into an array
      .then(mungeSoundFont)

      // Decode base64 to audio data, splitting each line from the sound font
      // into a key and value like, [noteName, decodedAudio]
      .then((audioData) => this._extractDecodedKeyValuePairs(audioData))

      // Create a "note" Ember.Object for each note from the decoded audio data.
      // Also does this.set(`${instrumentName}.${noteName}`, audioData);
      .then((keyValue) => this._createNoteObjects(keyValue, instrumentName))

      /**
       * At this point, notes are playable. All further processing is so that
       * this method can return a sorted array of note names corresponding to
       * the notes that were decoded from the soundfont.
       */

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
      .then(flatten)

      .catch((err) => console.error('ember-audio:', err));
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
    let noteName;

    if (note) {
      noteName = `${name}.${note}`;
    } else {
      noteName = name;
    }

    let decodedAudio = this.get(noteName);

    if (!decodedAudio) {
      this._soundNotLoadedError(noteName);
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
    throw new Ember.Error(`ember-audio: You tried to load a sound or soundfont called "${name}", but it already exists. You need to use a different name, or set the first instance to "null".`);
  },

  /**
   * _soundNotLoadedError - Just throws an error. For when "play" tries to play
   * a sound that has not previously been loaded.
   *
   * @param  {string} name  The name of the sound that has not yet been loaded.
   * @private
   */
  _soundNotLoadedError(name) {
    throw new Ember.Error(`ember-audio: You tried to play a sound called "${name}" but that sound has not been loaded.`);
  },

  /**
   * _extractDecodedKeyValuePairs - Takes an array of base64 encoded strings
   * (notes) and returns an array of arrays like [[name, audio], [name, audio]]
   *
   * @param  {array} data Array of base64 encoded strings.
   * @return {array}      Array of arrays. Each inner array has two values,
   * [noteName, decodedAudio]
   */
  _extractDecodedKeyValuePairs(data) {
    const promises = data.map((item) => {
      // Note values always start with "//u"
      const note = item.split('//u');
      const noteName = note[0].trim();

      // Transform base64 note value to Uint8Array
      const noteValue = base64ToUint8(`//u${note[1]}`);

      // Get web audio api audio data from array buffer, include note name
      return this._decodeAudioData(noteValue.buffer)
        .then((decodedAudio) => [noteName, decodedAudio]);
    });

    // Wait for array of promises to resolve before continuing
    return all(promises);
  },

  /**
   * _createNoteObjects - Takes an array of arrays, each inner array acting as
   * a key-value pair in the form [noteName, audioData]. Each inner array is
   * transformed into an Ember.Object and the outer array is returned. This
   * method also sets each note on it's corresponding instrument's Ember.Object
   * instance by name. Each note is gettable by
   * this.get(`${instrumentName}.${noteName}`)
   *
   * @param  {array}  audioData       Array of arrays, each inner array like [noteName, audioData]
   * @param  {string} instrumentName  Name of the instrument each note belongs to
   * @return {array}                  Array of Ember.Objects
   */
  _createNoteObjects(audioData, instrumentName) {
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

      this.set(`${instrumentName}.${noteName}`, noteBuffer);

      return Note.create({ letter, octave, accidental });
    });
  }
});
