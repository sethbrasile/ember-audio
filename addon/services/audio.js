import Ember from 'ember';
import fetch from 'ember-network/fetch';
import { Sound, Note, Track, BeatTrack, Sampler } from 'ember-audio';
import { sortNotes, base64ToUint8, mungeSoundFont } from 'ember-audio/utils';

/**
 * Provides the Audio Service
 * @module AudioService
 */

const {
  RSVP: { all, resolve },
  Service
} = Ember;

/**
 * A {{#crossLink "Ember.Service"}}Service{{/crossLink}} that provides methods
 * for interacting with the various
 * {{#crossLinkModule "Audio"}}{{/crossLinkModule}} classes and the Web Audio
 * API's {{#crossLink "AudioContext"}}{{/crossLink}}. This can be thought of as
 * the "entrypoint" to using ember-audio. An application using ember-audio
 * should use this service for all interactions with the Web Audio API.
 *
 *     // inject into an object
 *     Ember.Something.extend({
 *       audio: Ember.inject.service()
 *     });
 *
 *     // use
 *     loadSound() {
 *       return this.get('audio').load('some.mp3').asSound('some-sound');
 *     }
 *
 * @class AudioService
 */
export default Service.extend({
  /**
   * An AudioContext instance from the Web Audio API. **NOT** available in all
   * browsers. Not available in any version of IE (except EDGE)
   * as of April 2016.
   *
   * @property context
   * @type {AudioContext}
   */
  context: new AudioContext(),

  /**
   * This acts as a register for Sound instances. Sound instances are placed in
   * the register by name, and can be called via audioService.getSound('name')
   *
   * @private
   * @property _sounds
   * @type {map}
   */
  _sounds: new Map(),

  /**
   * This acts as a register for Sampler instances. Sampler instances are placed
   * in the register by name, and can be called via audioService.getSampler('name')
   *
   * @private
   * @property _samplers
   * @type {map}
   */
  _samplers: new Map(),

  /**
   * This acts as a register for soundfonts. A font is just a `Map` of Note
   * objects which is placed in this register by name.
   *
   * @private
   * @property _fonts
   * @type {map}
   */
  _fonts: new Map(),

  /**
   * This acts as a register for Track instances. Track instances are placed in
   * this register by name, and can be called via audioService.getTrack('name')
   *
   * @private
   * @property _tracks
   * @type {map}
   */
  _tracks: new Map(),

  /**
   * This acts as a register for BeatTrack instances. BeatTrack instances are
   * placed in the register by name, and can be called via
   * audioService.getBeatTrack('name')
   *
   * @private
   * @property _beatTracks
   * @type {map}
   */
  _beatTracks: new Map(),

  /**
   * Acts as a proxy method, returns a POJO with methods that return the _load
   * and _loadFont methods so that in the end. See example.
   *
   * @example
   *     audio.load('some-url.wav').asSound('some-sound');
   *     audio.load('some-url.mp3').asTrack('some-track');
   *     audio.load(['some-url.mp3']).asSampler('some-sampler');
   *     audio.load(['some-url.mp3']).asBeatTrack('some-beat-track');
   *     audio.load('some-url.js').asFont('some-font');
   *
   * @method load
   *
   * @param {string|array} src The URL location of an audio file. Will be used by
   * "fetch" to get the audio file. Can be a local or a relative URL. An array
   * of URLs is required if a beatTrack is being loaded via `.asBeatTrack` or
   * `.asSampler`.
   *
   * @return {object} returns a POJO that contains a few methods that curry
   * "src" "type" and "name" over to
   * {{#crossLink "Audio/_load:method"}}{{/crossLink}} and
   * {{#crossLink "Audio/_loadFont:method"}}{{/crossLink}} and allow you to
   * specify what type of Sound you'd like created.
   */
  load(src) {
    const audioContext = this.get('context');
    const _load = this._load.bind(this);
    const _loadFont = this._loadFont.bind(this);
    const _loadBeatTrack = this._loadBeatTrack.bind(this);
    const _createSoundsArray = this._createSoundsArray.bind(this);
    const samplersRegister = this.get('_samplers');

    return {
      /*
       * Creates a Sound instance from a src URL.
       *
       * @param {string} name The name that this Sound instance will be
       * registered as in the "_sounds" register.
       *
       * @return {promise|Sound} Returns a promise that resolves to a Sound
       * instance. The promise resolves when the Sound instance's AudioBuffer
       * (audio data) is finished loading.
       */
      asSound(name) {
        return _load(name, src, 'sound');
      },

      /*
       * Creates a Track instance from a src URL.
       *
       * @param {string} name The name that this Track instance will be
       * registered as in the "_tracks" register.
       *
       * @return {promise|Track} Returns a promise that resolves to a Track
       * instance. The promise resolves when the Track instance's AudioBuffer
       * (audio data) is finished loading.
       */
      asTrack(name) {
        return _load(name, src, 'track');
      },

      /*
       * Creates a BeatTrack instance from an array of src URLs.
       *
       * @param {string} name The name that this BeatTrack instance will be
       * registered as in the "_beatTracks" register
       *
       * @return {promise|Track} Returns a promise that resolves to a BeatTrack
       * instance. The promise resolves when the BeatTrack instance's AudioBuffer
       * (audio data) is finished loading.
       */
      asBeatTrack(name) {
        return _loadBeatTrack(name, src);
      },

      /*
       * Creates a font instance from a src URL.
       *
       * @param {string} name The name that this font will be registered as in
       * the "_fonts" register.
       *
       * @return {promise|array} Returns a promise that resolves to an Array of
       * sorted note names. The promise resolves when the soundfont file is
       * finished loading and it's audio data has been successfully decoded.
       */
      asFont(name) {
        return _loadFont(name, src);
      },

      /*
       * Creates a Sampler instance from an array of src URLs.
       *
       * @param {string} name The name that this Sampler instance will be
       * registered as in the _samplers register
       *
       * @return {promise|Sampler} Returns a promise that resolves to a Sampler
       * instance. The promise resolves when all the Sound instances loaded into
       * the Sampler instance are finished loading.
       */
      asSampler(name) {
        return _createSoundsArray(name, src).then((sounds) => {
          const _sounds = new Set(sounds);
          const sampler = Sampler.create({ _sounds, audioContext, name });

          samplersRegister.set(name, sampler);

          return sampler;
        });
      }
    };
  },

  /**
   * Gets a BeatTrack instance by name from the _beatTracks register.
   *
   * @method getBeatTrack
   * @param {string} name The name of the BeatTrack instance that should be
   * retrieved from the _beatTracks register.
   *
   * @return {BeatTrack} Returns the BeatTrack instance that matches the
   * provided name.
   */
  getBeatTrack(name) {
    return this.get('_beatTracks').get(name);
  },

  /**
   * Gets a Sound instance by name from the _sounds register
   *
   * @method getSound
   *
   * @param {string} name The name of the sound that should be retrieved
   * from the _sounds register.
   *
   * @return {Sound} returns the Sound instance that matches the provided name.
   */
  getSound(name) {
    return this.get('_sounds').get(name);
  },

  /**
   * Gets a Track instance by name from the _tracks register
   *
   * @method getTrack
   *
   * @param {string} name The name of the Track instance that should be
   * retrieved from the _tracks register.
   *
   * @return {Track} Returns the Track instance that matches the provided name.
   */
  getTrack(name) {
    return this.get('_tracks').get(name);
  },

  /**
   * Gets a soundfont Map by name from the _fonts register and allows it to be
   * played via the returned POJO containing a method called `play`.
   *
   * @example
   *     audio.getFont('some-font').play('Ab1');
   *
   * @method getFont
   *
   * @param {string} name The name of the Map that should be retrieved
   * from the _fonts register.
   *
   * @return {object} Returns a POJO that has a `play` method which allows a
   * note from the requested font to be played.
   */
  getFont(name) {
    const font = this.get('_fonts').get(name);

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
   * Gets a Sampler instance by name from the _samplers register
   *
   * @method getSampler
   *
   * @param {string} name The name of the sampler that should be retrieved
   * from the _samplers register.
   *
   * @return {Sampler} returns the Sampler instance that matches the provided name.
   */
  getSampler(name) {
    return this.get('_samplers').get(name);
  },

  /**
  * Gets all instances of requested type and calls
  * {{#crossLink "Sound/stop:method"}}{{/crossLink}} on each.
   *
   * @method stopAll
   *
   * @param {string} type='tracks' The type of the register that you wish
   * to stop all instances of. Can be `'tracks'`, or `'sounds'`.
   */
  stopAll(type='tracks') {
    for (let sound of this.get(`_${type}`).values()) {
      sound.stop();
    }
  },

  /**
   * Gets all Track instances and calls
   * {{#crossLink "Sound/pause:method"}}{{/crossLink}} on each. Only works for
   * tracks because only Track instances are pause-able.
   *
   * @method pauseAll
   */
  pauseAll() {
    for (let sound of this.get('_tracks').values()) {
      sound.pause();
    }
  },

  /**
   * Gets a register by it's type.
   *
   * @private
   * @method _getRegisterFor
   * @param {string} type Which register to return.
   * @return {map}
   */
  _getRegisterFor(type) {
    switch(type) {
      case 'track':
        return this.get('_tracks');
      case 'beatTrack':
        return this.get('_beatTracks');
      case 'sampler':
        return this.get('_samplers');
      default:
        return this.get('_sounds');
    }
  },

  /**
   * Creates an {{#crossLinkModule "Audio"}}Audio Class{{/crossLinkModule}}
   * instance (which is based on which "type" is specified), and passes "props"
   * to the new instance.
   *
   * @private
   * @method _createSoundFor
   *
   * @param {string} type The type of
   * {{#crossLinkModule "Audio"}}Audio Class{{/crossLinkModule}} to be created.
   *
   * @param {object} props POJO to pass to the new instance
   *
   * @return {Sound|Track|BeatTrack}
   */
  _createSoundFor(type, props) {
    switch(type) {
      case 'track':
        return Track.create(props);
      case 'beatTrack':
        return BeatTrack.create(props);
      case 'sampler':
        return Sampler.create(props);
      default:
        return Sound.create(props);
    }
  },

  /**
   * Loads and decodes an audio file, creating a Sound, Track, or BeatTrack
   * instance (as determined by the "type" parameter) and places the instance
   * into it's corresponding register.
   *
   * @private
   * @method _load
   *
   * @param {string} name The name that the created instance should be
   * registered as.
   *
   * @param {string} src The URI location of an audio file. Will be used by
   * "fetch" to get the audio file. Can be a local or a relative URL
   *
   * @param {string} type Determines the type of object that should be created,
   * as well as which register the instance should be placed in. Can be 'sound',
   * 'track', or 'beatTrack'.
   *
   * @return {promise|Sound|Track|BeatTrack} Returns a promise which resolves
   * to an instance of a Sound, Track, or BeatTrack
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
   * Creates a BeatTrack instance from an array of URLs.
   *
   * @private
   * @method _loadBeatTrack
   *
   * @param {string} name The name that this BeatTrack instance will be
   * registered as on the _beatTracks register.
   *
   * @param {array} srcArray An array of strings that specify URLs to load as
   * Sounds.
   *
   * @return {Promise|BeatTrack} A promise that resolves to a BeatTrack instance.
   */
  _loadBeatTrack(name, srcArray) {
    const audioContext = this.get('context');

    return this._createSoundsArray(name, srcArray).then((sounds) => {
      const _sounds = new Set(sounds);
      return BeatTrack.create({ _sounds, audioContext, name });
    });
  },

  /**
   * 1. Creates a Map instance (a "font") and places it in the fonts register.
   * 2. Loads a soundfont file and decodes all the notes.
   * 3. Creates a Note object instance for each note.
   * 4. Places each note on the font by name.
   * 5. Returns a promise that resolves to an array of properly sorted Note
   * object instances.
   *
   * The notes are sorted the way that they would appear on a piano. In the
   * example, you can see how the note `Ab1` from the `font-name` soundfont
   * would be played:
   *
   * @example
   *     audio.getFont('font-name').play('Ab1');
   *
   * @private
   * @method _loadFont
   *
   * @param {string} instrumentName The name that you will refer to this sound
   * font by.
   *
   * @param {string} src The URI location of a soundfont file. Will be used by
   * "fetch" to get the soundfont file. Can be a local or a relative URL.
   *
   * @return {promise|array} Returns a promise that resolves when the sound font
   * has been successfully decoded. The promise resolves to an array of sorted note names.
   */
  _loadFont(instrumentName, src) {
    const fonts = this.get('_fonts');

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
   * Accepts an array of URLs to audio files and creates a Sound instance for
   * each.
   *
   * @private
   * @method _createSoundsArray
   *
   * @param {string} name The base-name of the sound. If one were loading up
   * multiple kick drum samples, this might be 'kick'.
   *
   * @param {array} srcArray An array of strings. Each item being a URL to an
   * audio file that should be loaded and turned into a Sound instance.
   *
   * @return {Promise|array} A promise that resolves to an array of Sound objects.
   */
  _createSoundsArray(name, srcArray) {
    const sounds = srcArray.map((src, idx) => {
      return this._load(`${name}${idx}`, src, 'sound');
    });

    return all(sounds);
  },

  /**
   * Takes an array of base64 encoded strings (notes) and returns an array of
   * arrays like [[name, audio], [name, audio]]
   *
   * @private
   * @method _extractDecodedKeyValuePairs
   * @param {array} notes Array of base64 encoded strings.
   * @return {array} Returns an Array of arrays. Each inner array has two
   * values, `[noteName, decodedAudio]`.
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
   * a key-value pair in the form `[noteName, audioData]`. Each inner array is
   * transformed into a {{#crossLink "Note"}}{{/crossLink}} and the outer array
   * is returned. This method also sets each note on it's corresponding
   * instrument {{#crossLink "Map"}}{{/crossLink}} instance by name. Each note
   * is playable as seen in the example.
   *
   * @example
   *     audioService.get('fonts').get('instrument-name').play('Ab5');
   *
   * @private
   * @method _createNoteObjects
   *
   * @param {array} audioData Array of arrays, each inner array like
   * `[noteName, audioData]`.
   *
   * @param {string} instrumentName Name of the instrument each note belongs to.
   * This is the name that will be used to identify the instrument on the fonts
   * register.
   *
   * @return {array} Returns an Array of {{#crossLink "Note"}}Notes{{/crossLink}}
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

      this.get('_fonts').get(instrumentName).set(noteName, note);

      return note;
    });
  }
});
