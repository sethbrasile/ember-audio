import Ember from 'ember';
import request from '../utils/request';
import { Sound } from '../utils/sound';
import { base64ToUint8, mungeSoundFont } from '../utils/decode-base64';
import { Note, sortNotes } from '../utils/note';

const {
  RSVP: { all },
  Service
} = Ember;

export default Service.extend({
  /**
   * request - Only set on this service so that it's easier to stub without
   * having to create another service.
   */
  request,

  /**
   * context - An AudioContext instance from the web audio api. **NOT**
   * available in all browsers. Not available in any version of IE (except EDGE)
   * as of April 2016.
   *
   * http://caniuse.com/#feat=audio-api
   */
  context: new AudioContext(),

  sounds: new Map(),

  /**
  * load - Loads and decodes an audio file and sets it on this service by "name"
  *
  * @param {string}   name  The name that you will use to refer to the sound
  * @param {string}   src   url (relative or fully qualified) to the audio file
  * @return {promise}       a promise that resolves when the sound file has
  * been successfully decoded. The resolved promise does not have a value.
  **/
  load(name, src) {
    const existingAudio = this.get('sounds').get(name);
    const audioContext = this.get('context');

    if (existingAudio) {
      return Ember.RSVP.resolve(existingAudio);
    }

    return this.get('request')(src)
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        const sound = Sound.create({ audioBuffer, audioContext });
        this.get('sounds').set(name, sound);
        return sound;
      })
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
    if (this.get('sounds').has(instrumentName)) {
      return this._alreadyLoadedError(instrumentName);
    }

    this.get('sounds').set(instrumentName, new Map());

    return this.get('request')(src, 'text')

      // Strip extraneous stuff from soundfont (which is currently a long string)
      // and split by line into an array
      .then(mungeSoundFont)

      // Decode base64 to audio data, splitting each line from the sound font
      // into a key and value like, [noteName, decodedAudio]
      .then((audioData) => this._extractDecodedKeyValuePairs(audioData))

      // Create a "note" Ember.Object for each note from the decoded audio data.
      // Also does this.set(`sounds.${instrumentName}.${noteName}`, note);
      // for each note
      .then((keyValue) => this._createNoteObjects(keyValue, instrumentName))

      .then(sortNotes)

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
    const sounds = this.get('sounds');
    const sound = sounds.get(name);

    if (!sounds.has(name)) {
      return this._soundNotLoadedError(name);
    }

    if (!note) {
      sound.play();
    } else {
      if (sound.has(note)) {
        sound.get(note).play();
      } else {
        return this._soundNotLoadedError(name, note);
      }
    }
  },

  stop(name) {
    const sounds = this.get('sounds');

    if (!name) {
      for (let sound of sounds.values()) {
        sound.get('node').stop();
      }
    }

    if (sounds.has(name)) {
      sounds.get(name).get('node').stop();
    }
  },

  // seek(name, time) {
    // something like this?
    // this.get(name).position = time;
  // },

  /**
   * pan - Pans a sound left or right - must be called after the sound has been
   * loaded
   *
   * @param  {type} name  The name of the sound you would like to pan
   * @param  {int} value  The direction and amount between -1 (hard left) and
   * 1 (hard right)
   */
  pan(name, value) {
    this.get('sounds').get(name).pan(value);
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
   * a sound that has not been loaded.
   *
   * @param  {string} name  The name of the sound that has not yet been loaded.
   * @private
   */
  _soundNotLoadedError(name, note) {
    if (note) {
      throw new Ember.Error(`ember-audio: You tried to play a note called "${note}" from the instrument "${name}" but that note does not exist.`);
    } else {
      throw new Ember.Error(`ember-audio: You tried to play a sound called "${name}" but that sound has not been loaded.`);
    }
  },

  /**
   * _extractDecodedKeyValuePairs - Takes an array of base64 encoded strings
   * (notes) and returns an array of arrays like [[name, audio], [name, audio]]
   *
   * @param  {array} data Array of base64 encoded strings.
   * @return {array}      Array of arrays. Each inner array has two values,
   * [noteName, decodedAudio]
   */
  _extractDecodedKeyValuePairs(notes) {
    const ctx = this.get('context');
    const promises = [];

    function decodeNote(noteName, buffer) {
      // Get web audio api audio data from array buffer
      return ctx.decodeAudioData(buffer)

      // Set promise value to array with note name and decoded note data
      .then((decodedNote) => [noteName, decodedNote]);
    }

    for (let noteName in notes) {
      if (notes.hasOwnProperty(noteName)) {

        // Transform base64 note value to Uint8Array
        const noteValue = base64ToUint8(notes[noteName]);

        promises.push(decodeNote(noteName, noteValue.buffer));
      }
    }

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
    const audioContext = this.get('context');

    return audioData.map((note) => {
      const noteName = note[0];
      const audioBuffer = note[1];
      const letter = noteName[0];

      let octave = noteName[2];
      let accidental;

      if (octave) {
        accidental = noteName[1];
      } else {
        octave = noteName[1];
      }

      note = Note.create({ letter, octave, accidental, audioBuffer, audioContext });

      this.get('sounds').get(instrumentName).set(noteName, note);

      return note;
    });
  }
});
