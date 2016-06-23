import Ember from 'ember';
import request from '../utils/request';
import Sound from '../utils/sound';
import Track from '../utils/track';
import { base64ToUint8, mungeSoundFont } from '../utils/decode-base64';
import { Note, sortNotes } from '../utils/note';

// This only exists at the moment because I'd like to use "new Map()" but
// haven't spent the time to verify that all browsers with web audio api also
// have Map()
const ObjectLikeMap = Ember.Object.extend({
  has(name) {
    if (name) {
      return !!this.get(name);
    }

    return false;
  },

  values() {
    return Object.keys(this).map((key) => this.get(key));
  }
});

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

  sounds: ObjectLikeMap.create(),

  /**
  * load - Loads and decodes an audio file and sets it on this service by "name"
  *
  * @param {string}   name  The name that you will use to refer to the sound
  * @param {string}   src   url (relative or fully qualified) to the audio file
  * @return {promise}       a promise that resolves when the sound file has
  * been successfully decoded. The resolved promise does not have a value.
  **/

  load(name, src, type='sound') {
    const audioContext = this.get('context');
    const sounds = this.get('sounds');

    if (sounds.has(name)) {
      return Ember.RSVP.resolve(sounds.get(name));
    }

    return this.get('request')(src)
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        let sound;

        if (type === 'sound') {
          sound = Sound.create({ audioBuffer, audioContext, name })
        } else if (type === 'track') {
          sound = Track.create({ audioBuffer, audioContext, name })
        }

        sounds.set(name, sound);

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
    const sounds = this.get('sounds');

    if (sounds.has(instrumentName)) {
      const err = new Ember.Error(`ember-audio: You tried to load a soundfont instrument called "${name}", but it already exists. Repeatedly loading the same soundfont all willy-nilly is unnecessary and would have a negative impact on performance, so the previously loaded instrument has been cached and will be reused unless you set it explicitly to "null" with "this.get('audio.sounds').set('${instrumentName}', null);".`);

      Ember.Logger.error(err);

      return Ember.RSVP.resolve(sounds.get(instrumentName));
    }

    sounds.set(instrumentName, ObjectLikeMap.create());

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

  getSound(name) {
    return this.get('sounds').get(name);
  },

  getFont(name) {
    const font = this.get('sounds').get(name);

    return {
      play(note) {
        if (font.has(note)) {
          font.get(note).play();
        } else {
          throw new Ember.Error(`ember-audio: You tried to play the note "${note}" from the soundfont "${name}" but the note "${note}" does not exist.`);
        }
      }
    }
  },

  stopAll() {
    for (let sound of this.get('sounds').values()) {
      if ('function' === typeof sound.stop) {
        sound.stop();
      }
    }
  },

  pauseAll() {
    for (let sound of this.get('sounds').values()) {
      if ('function' === typeof sound.pause) {
        sound.pause();
      }
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
