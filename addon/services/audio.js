import { resolve, all } from 'rsvp';
import Service from '@ember/service';
import fetch from 'fetch';
import {
  Sound,
  Note,
  SampledNote,
  Track,
  BeatTrack,
  Sampler,
  Oscillator,
  Font
} from 'ember-audio';
import {
  sortNotes,
  base64ToUint8,
  mungeSoundFont,
  frequencyMap
} from 'ember-audio/utils';

/**
 * Provides the Audio Service
 *
 * @public
 * @module AudioService
 */

const {
  error, warn
} = console;

/**
 * A {{#crossLink "Ember.Service"}}Service{{/crossLink}} that provides methods
 * for interacting with the various
 * {{#crossLinkModule "Audio"}}{{/crossLinkModule}} classes and the Web Audio
 * API's {{#crossLink "AudioContext"}}{{/crossLink}}. This can be thought of as
 * the "entrypoint" to using ember-audio. An application using ember-audio
 * should use this service for all interactions with the Web Audio API.
 *
 *     Ember.Something.extend({
 *       audio: Ember.inject.service(),
 *
 *       loadSound() {
 *         return this.get('audio').load('some.mp3').asSound('some-sound');
 *       }
 *     });
 *
 *
 * @public
 * @class AudioService
 *
 * @todo consider creating a class called something like EmberAudioLoadResponse
 * to use in place of current POJO returned from load().
 *
 * @todo consider removing concept of "registers". They only exist at the moment
 * for their caching behavior. Might want to let users decide what is cached
 * for memory reasons? A long running app (like a game), might end up with lots
 * of sounds.
 */
export default Service.extend({
  /**
   * An AudioContext instance from the Web Audio API. **NOT** available in all
   * browsers. Not available in any version of IE (except EDGE)
   * as of April 2016.
   *
   * @public
   * @property audioContext
   * @type {AudioContext}
   * @todo change this to audioContext to match other stuff, or change other stuff to audioContext
   */
  audioContext: new AudioContext(),

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
   * objects which is placed in this register by name, and can be played like:
   * `audioService.getFont('some-font').play('Ab1');`
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
   * @public
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
   *
   * @todo find a better way than returning a POJO
   */
  load(src) {
    const audioContext = this.get('audioContext');
    const _load = this._load.bind(this);
    const _loadFont = this._loadFont.bind(this);
    const _loadBeatTrack = this._loadBeatTrack.bind(this);
    const _createSoundsArray = this._createSoundsArray.bind(this);
    const samplersRegister = this.get('_samplers');
    const { createNoteArray } = this;

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
        return _createSoundsArray(name, src).then((soundsArray) => {
          const sounds = new Set(soundsArray);
          const sampler = Sampler.create({ sounds, audioContext, name });

          samplersRegister.set(name, sampler);

          return sampler;
        });
      },

      /*
       * Creates an array of note instances from a JSON file.
       *
       * @param {string} name The name that this Sampler instance will be
       * registered as in the _samplers register
       *
       * @return {promise|array|Note} Returns a promise that resolves to an array
       * of Note instances.
       */
      async asNoteArray() {
        const response = await fetch(src);
        const json = await response.json();
        return createNoteArray(json);
      }
    };
  },

  /**
   * Creates an array of Note objects from a json object containing notes and
   * frequency values.
   *
   * @public
   * @method createNoteArray
   *
   * @param {object|null} json Optionally provided json object. If not provided,
   * the object returned from utils/frequencyMap is used.
   *
   * @return {array|Note}
   * @todo allow createNoteArray to accept array of note names with no frequencies
   */
  createNoteArray(json) {
    const notes = [];

    if (!json) {
      json = frequencyMap;
    }

    for (let noteName in json) {
      notes.push(Note.create({ frequency: json[noteName] }));
    }

    return notes;
  },

  /**
   * Creates a Sound instance with it's audioBuffer filled with one sample's
   * worth of white noise.
   *
   * @public
   * @method createWhiteNoise
   *
   * @param {object} opts An object passed into the Sound instance.
   *
   * @return {Sound} The created white noise Sound instance.
   */
  createWhiteNoise(opts={}) {
    const audioContext = this.get('audioContext');
    const bufferSize = audioContext.sampleRate;
    const audioBuffer = audioContext.createBuffer(1, bufferSize, bufferSize);
    const output = audioBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return Sound.create(Object.assign(opts, { audioContext, audioBuffer }));
  },

  /**
   * Creates an Oscillator instance.
   *
   * @public
   * @method createOscillator
   *
   * @param {object} opts An object passed into the Oscillator instance.
   *
   * @return {Oscillator} The created Oscillator instance.
   */
  createOscillator(opts={}) {
    const audioContext = this.get('audioContext');
    return Oscillator.create(Object.assign(opts, { audioContext }));
  },

  /**
   * Gets a BeatTrack instance by name from the _beatTracks register.
   *
   * @public
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
   * @public
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
   * @public
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
   * @public
   * @method getFont
   *
   * @param {string} name The name of the Map that should be retrieved
   * from the _fonts register.
   *
   * @return {object} Returns a POJO that has a `play` method which allows a
   * note from the requested font to be played.
   */
  getFont(name) {
    return this.get('_fonts').get(name);
  },

  /**
   * Gets a Sampler instance by name from the _samplers register
   *
   * @public
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
   * @public
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
   * @public
   * @method pauseAll
   */
  pauseAll() {
    for (let sound of this.get('_tracks').values()) {
      sound.pause();
    }
  },

  /**
   * Given a sound's name and type, removes the sound from it's register.
   *
   * @public
   * @method removeFromRegister
   *
   * @param {string} type The type of sound that should be removed. Can be
   * 'sound', 'track', 'font', 'beatTrack', or 'sampler'.
   *
   * @param {string} name The name of the sound that should be removed.
   */
  removeFromRegister(type, name) {
    const register = this._getRegisterFor(type);
    register.delete(name);
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
    switch (type) {
      case 'sound':
        return this.get('_sounds');
      case 'track':
        return this.get('_tracks');
      case 'beatTrack':
        return this.get('_beatTracks');
      case 'sampler':
        return this.get('_samplers');
      case 'font':
        return this.get('_fonts');
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
    switch (type) {
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
    const audioContext = this.get('audioContext');
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
        error('ember-audio:', err, 'This error was probably caused by a 404 or an incompatible audio file type');
      });
  },

  /**
   * 1. Creates a Font instance and places it in the fonts register.
   * 2. Loads a soundfont file and decodes all the notes.
   * 3. Creates a Note instance for each note.
   * 4. Places each note on the font, using the note's identifier as key.
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
    const fontsRegister = this._getRegisterFor('font');

    // If the font already exists, no need to load it up again.
    if (fontsRegister.has(instrumentName)) {
      warn(`ember-audio: You tried to load a soundfont instrument called "${name}", but it already exists. Repeatedly loading the same soundfont all willy-nilly is unnecessary and would have a negative impact on performance, so the previously loaded instrument has been cached and will be reused unless you explicitly remove it with "audioService.removeFromRegister('font', '${instrumentName}')"`);
      return resolve(fontsRegister.get(instrumentName));
    }

    // Create a Font instance and place it in the _fonts register
    fontsRegister.set(instrumentName, Font.create());

    return fetch(src).then((response) => response.text())

      // Strip extraneous stuff from soundfont (which is currently a long string)
      // and split by line into an array
      .then(mungeSoundFont)

      // Decode base64 to audio data, splitting each line from the sound font
      // into a key and value like, [noteName, decodedAudio]
      .then((audioData) => this._extractDecodedKeyValuePairs(audioData))

      // Create a Note instance for each note from the decoded audio data.
      // Also sets the note on the corresponding font in the _fonts register.
      .then((keyValuePairs) => this._createNoteObjectsForFont(keyValuePairs, instrumentName))

      .catch((err) => error('ember-audio:', err));
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
    const audioContext = this.get('audioContext');

    return this._createSoundsArray(name, srcArray).then((soundsArray) => {
      const sounds = new Set(soundsArray);
      return BeatTrack.create({ sounds, audioContext, name });
    });
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
    const ctx = this.get('audioContext');
    const promises = [];

    async function decodeNote(noteName, buffer) {
      // Get web audio api audio data from array buffer
      const decodedNote = await ctx.decodeAudioData(buffer);
      return [noteName, decodedNote];
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
   *     audioService.getFont('font-name').play('Ab5');
   *
   * @private
   * @method _createNoteObjectsForFont
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
  _createNoteObjectsForFont(audioData, instrumentName) {
    const audioContext = this.get('audioContext');
    const fontsRegister = this._getRegisterFor('font');
    const font = fontsRegister.get(instrumentName);

    const notes = audioData.map((note) => {
      const [ identifier, audioBuffer ] = note;
      return SampledNote.create({
        identifier,
        audioBuffer,
        audioContext
      });
    });

    font.set('notes', sortNotes(notes));

    return font;
  }
});
