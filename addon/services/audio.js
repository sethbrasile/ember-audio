import Ember from 'ember';
import Sound from '../classes/sound';
import Track from '../classes/track';
import BeatTrack from '../classes/beat-track';
import { Note } from '../classes/note';
import { base64ToUint8, mungeSoundFont } from '../utils/decode-base64';
import { sortNotes } from '../utils/note-methods';
import fetch from 'ember-network/fetch';

const {
  RSVP: { all, resolve },
  Service
} = Ember;

/**
 * Audio Service
 *
 * @example
 * // injecting into an object
 * Ember.Something.extend({
 *   audio: Ember.inject.service()
 * });
 *
 * @example
 * // use
 * loadSound() {
 *   return this.get('audio').load('some.mp3').asSound('some-sound');
 * }
 *
 * @module
 * @extends Ember.Service
 */
export default Service.extend({
  /**
   * An AudioContext instance from the Web Audio API. **NOT** available in all
   * browsers. Not available in any version of IE (except EDGE)
   * as of April 2016.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext}
   * @see {@link http://caniuse.com/#feat=audio-api}
   * @type {AudioContext}
   */
  context: new AudioContext(),

  /**
   * This acts as a register for Sound instances. Sound instances are placed in
   * the register by name, and can be called via sounds.get('name')
   *
   * @type {Map.<string, Sound>}
   */
  sounds: new Map(),

  /**
   * This acts as a register for soundfonts. Soundfonts are plain Ember.Objects
   * which are placed in the register by name, and can be called via
   * fonts.get('name')
   *
   * @property fonts
   * @type {Map}
   */
  fonts: new Map(),

  /**
   * This acts as a register for Track instances. Track instances are placed in
   * the register by name, and can be called via tracks.get('name')
   *
   * @property tracks
   * @type {Map}
   */
  tracks: new Map(),

  /**
   * This acts as a register for BeatTrack instances. BeatTrack instances are
   * placed in the register by name, and can be called via beatTracks.get('name')
   *
   * @property beatTracks
   * @type {Map}
   */
  beatTracks: new Map(),

  /**
   * Acts as a proxy method, returns a POJO with methods that return the _load and
   * _loadFont methods so that in the end, the method signature looks something
   * like: audio.load('some-uri').asSound('some-name')
   *
   * @method load
   * @param {String} src The URI location of an audio file. Will be used by "fetch" to get the audio file. Can be a local or a relative URL
   * @return {Object} returns a POJO that contains a few methods that curry "src" "type" and "name" over to _load() and _loadFont()
   */
  load(src) {
    const _load = this._load.bind(this);
    const _loadFont = this._loadFont.bind(this);

    return {
      /**
       * Calls _load() with name, partially applied src param from load(), and type="sound"
       *
       * @method asSound
       * @param {String} name The name that this Sound instance will be registered as in the "sounds" register
       * @return {Promise<Sound>} Returns a promise that resolves to a Sound instance. The promise resolves when the Sound instance's AudioBuffer (audio data) is finished loading
       */
      asSound(name) {
        return _load(name, src, 'sound');
      },

      /**
       * Calls _load() with name, partially applied src param from load(), and type="track"
       *
       * @method asSound
       * @param {String} name The name that this Track instance will be registered as in the "tracks" register
       * @return {Promise<Track>} Returns a promise that resolves to a Track instance. The promise resolves when the Track instance's AudioBuffer (audio data) is finished loading
       */
      asTrack(name) {
        return _load(name, src, 'track');
      },

      /**
       * Calls _load() with name, partially applied src param from load(), and type="beatTrack"
       *
       * @method asBeatTrack
       * @param {String} name The name that this BeatTrack instance will be registered as in the "beatTracks" register
       * @return {Promise<Track>} Returns a promise that resolves to a BeatTrack instance. The promise resolves when the BeatTrack instance's AudioBuffer (audio data) is finished loading
       */
      asBeatTrack(name) {
        return _load(name, src, 'beatTrack');
      },

      /**
       * Calls _loadFont() with name, and partially applied src param from load()
       *
       * @method asFont
       * @param {String} name The name that this font will be registered as in the "fonts" register
       * @return {Promise<Array>} Returns a promise that resolves to an Array of sorted note names. The promise resolves when the soundfont file is finished loading and it's audio data has been successfully decoded
       */
      asFont(name) {
        return _loadFont(name, src);
      }
    };
  },

  /**
   * Gets a BeatTrack instance by name from the beatTracks register
   *
   * @method getBeatTrack
   * @param {String} name The name of the BeatTrack instance that you would like to retrieve from the beatTracks register
   * @return {BeatTrack} Returns the BeatTrack instance that matches the provided name
   */
  getBeatTrack(name) {
    return this.get('beatTracks').get(name);
  },

  /**
   * Gets a Sound instance by name from the sounds register
   *
   * @method getSound
   * @param {String} name The name of the sound that you would like to retrieve from the sounds register
   * @return {Sound} returns the Sound instance that matches the provided name
   */
  getSound(name) {
    return this.get('sounds').get(name);
  },

  /**
   * Gets a Track instance by name from the tracks register
   *
   * @method getTrack
   * @param {String} name The name of the Track instance that you would like to retrieve from the tracks register
   * @return {Track} Returns the Track instance that matches the provided name
   */
  getTrack(name) {
    return this.get('tracks').get(name);
  },

  /**
   * Gets a soundfont by name from the fonts register
   *
   * @method getFont
   * @param {String} name The name of the soundfont that you would like to retrieve from the fonts register
   * @return {Ember.Array} Returns the soundfont (an array of Note objects) that matches the provided name
   */
  getFont(name) {
    const font = this.get('fonts').get(name);

    return {
      play(note) {
        if (font.has(note)) {
          font.get(note).play();
        } else {
          throw new Ember.Error(`ember-audio: You tried to play the note "${note}" from the soundfont "${name}" but the note "${note}" does not exist.`);
        }
      }
    };
  },

  /**
   * Gets all instances from requested register and calls stop() on each instance
   *
   * @method stopAll
   * @param {String} [register='tracks'] The name of the register that you wish to stop all instances of
   */
  stopAll(register='tracks') {
    for (let sound of this.get(register).values()) {
      sound.stop();
    }
  },

  /**
   * Gets all instances from the tracks register and calls pause() on each. Only
   * works for the tracks register because only Track instances are pause-able
   *
   * @method pauseAll
   */
  pauseAll() {
    for (let sound of this.get('tracks').values()) {
      sound.pause();
    }
  },

  /**
   * Gets a register by it's name
   *
   * @private
   * @method _getRegisterFor
   * @param {String} type The type of register to return
   * @return {Map}
   */
  _getRegisterFor(type) {
    switch(type) {
      case 'track':
        return this.get('tracks');
      case 'beatTrack':
        return this.get('beatTracks');
      default:
        return this.get('sounds');
    }
  },

  /**
   * Creates a Sound, Track, or BeatTrack instance, based on "type" and passes "props"
   * to the new instance
   *
   * @private
   * @method _createSoundFor
   * @param {String} type The type of Sound to be created
   * @param {Object} props POJO to pass to the new instance
   * @return {Sound|Track|BeatTrack}
   */
  _createSoundFor(type, props) {
    switch(type) {
      case 'track':
        return Track.create(props);
      case 'beatTrack':
        return BeatTrack.create(props);
      default:
        return Sound.create(props);
    }
  },

  /**
   * Loads and decodes an audio file, creating a Sound, Track, or BeatTrack
   * instance (as determined by the "type" parameter) and places the instance
   * into it's corresponding register
   *
   * @private
   * @method _load
   * @param {String} name The name that the created instance should be registered as
   * @param {String} src The URI location of an audio file. Will be used by "fetch" to get the audio file. Can be a local or a relative URL
   * @param {String} type Determines the type of object that should be created, as well as which register the instance should be placed in
   * @return {Promise<Sound|Track|BeatTrack>} Returns a Promise which resolves to an instance of a Sound, Track, or BeatTrack
   */
  _load(name, src, type) {
    const audioContext = this.get('context');
    const register = this._getRegisterFor(type);

    if (register.has(name)) {
      return resolve(register.get(name));
    }

    return fetch(src)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        const sound = this._createSoundFor(type, { audioBuffer, audioContext, name });
        register.set(name, sound);
        return sound;
      })
      .catch((err) => {
        console.error('ember-audio:', err);
        console.error('ember-audio:', 'This error was probably caused by a 404 or an incompatible audio file type');
      });
  },

  /**
   * 1. Creates a Map instance (a "font") and places it in the fonts register
   * 2. Loads a soundfont file and decodes all the notes
   * 3. Creates a Note object instance for each note
   * 4. Places each note on the font by name
   * 5. Returns a promise that resolves to an array of properly sorted Note object instances
   *
   * The notes are sorted the way that they would appear on a piano. A given
   * note can be played like: audio.getFont(fontName).play(noteName)
   *
   * @private
   * @method _loadFont
   * @param {String} instrumentName The name that you will refer to this sound font by.
   * @param {String} src The URI location of a soundfont file. Will be used by "fetch" to get the soundfont file. Can be a local or a relative URL
   * @return {Promise<Array>} Returns a promise that resolves when the sound font has been successfully decoded. The promise resolves to an array of sorted note names.
   */
  _loadFont(instrumentName, src) {
    const fonts = this.get('fonts');

    if (fonts.has(instrumentName)) {
      const err = new Ember.Error(`ember-audio: You tried to load a soundfont instrument called "${name}", but it already exists. Repeatedly loading the same soundfont all willy-nilly is unnecessary and would have a negative impact on performance, so the previously loaded instrument has been cached and will be reused unless you set it explicitly to "null" with "this.get('audio.sounds').set('${instrumentName}', null);".`);

      Ember.Logger.error(err);

      return resolve(fonts.get(instrumentName));
    }

    fonts.set(instrumentName, new Map());

    return fetch(src).then((response) => response.text())

      // Strip extraneous stuff from soundfont (which is currently a long string)
      // and split by line into an array
      .then(mungeSoundFont)

      // Decode base64 to audio data, splitting each line from the sound font
      // into a key and value like, [noteName, decodedAudio]
      .then((audioData) => this._extractDecodedKeyValuePairs(audioData))

      // Create a "note" Ember.Object for each note from the decoded audio data.
      // Also does "this.get('fonts').get(instrumentName).set(noteName, note)"
      // for each note
      .then((keyValuePairs) => this._createNoteObjects(keyValuePairs, instrumentName))

      .then(sortNotes)

      .catch((err) => console.error('ember-audio:', err));
  },

  /**
   * Takes an array of base64 encoded strings (notes) and returns an array of
   * arrays like [[name, audio], [name, audio]]
   *
   * @private
   * @method _extractDecodedKeyValuePairs
   * @param {Array} notes Array of base64 encoded strings.
   * @return {Array} Returns an Array of arrays. Each inner array has two values, [noteName, decodedAudio]
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
   * Takes an array of arrays, each inner array acting as
   * a key-value pair in the form [noteName, audioData]. Each inner array is
   * transformed into an Ember.Object and the outer array is returned. This
   * method also sets each note on it's corresponding instrument's Ember.Object
   * instance by name. Each note is gettable by
   * this.get(`${instrumentName}.${noteName}`)
   *
   * @private
   * @method _createNoteObjects
   * @param {Array} audioData Array of arrays, each inner array like [noteName, audioData]
   * @param {String} instrumentName Name of the instrument each note belongs to
   * @return {Array} Returns an Array of Ember.Objects
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

      this.get('fonts').get(instrumentName).set(noteName, note);

      return note;
    });
  }
});
