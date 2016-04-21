function b64ToUint6(nChr) {
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


/**
 * base64ToUint8 - Converts a base64 string into a Uint8Array of "binary" data
 *
 * @param  {string} sBase64   The base64 string that you'd like to be converted
 * @return {Uint8Array}       A Uint8Array of converted "binary" audio data
 */
export function base64ToUint8(sBase64) {
  const sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, "");
  const nInLen = sB64Enc.length;
  const nOutLen = nInLen * 3 + 1 >> 2;
  const taBytes = new Uint8Array(nOutLen);

  for (let nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3;

    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;

    if (nMod4 === 3 || nInLen - nInIdx === 1) {

      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
      }

      nUint24 = 0;
    }
  }

  return taBytes;
}

/**
 * mungeSoundFont - Strips extraneous stuff from a soundfont and splits the
 * soundfont into a JSON object. Keys are note names and values are base64
 * encoded strings.
 *
 * @param  {string} text  A soundfont as a long base64 text string
 * @return {json}         A JSON representation of all the notes in the font
 */
export function mungeSoundFont(text) {
  const begin = text.indexOf('=', text.indexOf('MIDI.Soundfont.')) + 2;
  const end = text.lastIndexOf(',');
  const string = (text.slice(begin, end) + '}')
    .replace(new RegExp('data:audio/mp3;base64,', 'g'), '')
    .replace(new RegExp('data:audio/mpeg;base64,', 'g'), '')
    .replace(new RegExp('data:audio/ogg;base64,', 'g'), '');

  return JSON.parse(string);
}
