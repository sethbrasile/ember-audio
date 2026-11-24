const RATE = 44100;

/**
 * Builds a short 16-bit mono WAV file in memory, so tests can decode real audio
 * without loading a fixture file.
 */
export default function wav(seconds = 0.1, frequency = 440) {
  const frames = Math.round(RATE * seconds);
  const view = new DataView(new ArrayBuffer(44 + frames * 2));
  const writeText = (offset, text) => {
    text.split('').forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  };

  writeText(0, 'RIFF');
  view.setUint32(4, 36 + frames * 2, true);
  writeText(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, RATE, true);
  view.setUint32(28, RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, frames * 2, true);

  for (let i = 0; i < frames; i++) {
    view.setInt16(44 + i * 2, Math.round(Math.sin(2 * Math.PI * frequency * i / RATE) * 16000), true);
  }

  return view.buffer;
}

export function base64(arrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
}
