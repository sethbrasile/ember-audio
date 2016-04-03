import Ember from 'ember';

export default Ember.Service.extend({
  /**
  * The base Howler Object: Allows you to change global settings
  * https://github.com/goldfire/howler.js/tree/2.0#global-core-methods
  **/
  Howler,

  /**
  * Array of strings (names of sounds) that acts as a registry for sound instances
  **/
  sounds: Ember.A(),

  /**
  * Instantiate a "sound" and place on this service by name
  *
  * @param {string}           name  The name that you will use to refer to the sound
  * @param {array || string}  src   path, as a string, or an array of strings, to the sound's mp3 file(s). Can be URLs or base64 data URIs. https://github.com/goldfire/howler.js/tree/2.0#src-array--required
  * @param {object}           opts  An optional POJO that accepts Howler options https://github.com/goldfire/howler.js/tree/2.0#more-playback-options
  * @return {object}                A Howler "Howl" object instance
  **/
  load(name, src, opts={}) {
    if (Ember.isArray(src)) {
      opts.src = src;
    } else {
      opts.src = [src];
    }

    this.set(name, new Howl(opts));
    this.get('sounds').pushObject(name);
    return this.get(name);
  },

  /**
   * play - Plays a sound instance by "name"
   *
   * @param  {string} name The name of the "sound" you want to play. This must have been already loaded via "loadSound"
   */
  play(name) {
    this.get(name).play();
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
  }
});
