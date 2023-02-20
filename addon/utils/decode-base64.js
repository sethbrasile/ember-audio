/**
 * @public
 * @class utils
 */

/**
 * Converts a base64 string into a Uint8Array of binary data.
 *
 * @private
 * @method base64ToUint8
 * @param  {string} base64String The base64 string that you'd like to be converted into a Uint8Array.
 * @return {Uint8Array} A Uint8Array of converted binary audio data.
 */
export function base64ToUint8(base64String) {
  return new Uint8Array(
    atob(base64String)
      .split('')
      .map((char) => char.charCodeAt(0))
  );
}

/**
 * Strips extraneous stuff from a soundfont and splits the soundfont into a JSON
 * object. Keys are note names and values are base64 encoded strings.
 *
 * @private
 * @method mungeSoundFont
 * @param {string} soundfont A soundfont as a long base64 string
 * @return {object} A JSON representation of all the notes in the font
 */
export function mungeSoundFont(soundfont) {
  const begin =
    soundfont.indexOf('=', soundfont.indexOf('MIDI.Soundfont.')) + 2;
  const end = soundfont.lastIndexOf('"') + 1;
  const string = `${soundfont.slice(begin, end)}}`
    .replace(new RegExp('data:audio/mp3;base64,', 'g'), '')
    .replace(new RegExp('data:audio/mpeg;base64,', 'g'), '')
    .replace(new RegExp('data:audio/ogg;base64,', 'g'), '');

  return JSON.parse(string);
}
