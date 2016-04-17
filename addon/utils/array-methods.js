import Ember from 'ember';

const {
  A
} = Ember;

// Splits an array and tacks the first chunk to the end of the second chunk
export function arraySwap(octave, noteToShiftAt) {
  const endOfOctave = octave.slice(0, noteToShiftAt);
  const beginOfOctave = A(octave.slice(noteToShiftAt));
  return beginOfOctave.pushObjects(endOfOctave);
}

// Flattens an array of arrays into a single array
export function flatten(arrayOfArrays) {
  return A(arrayOfArrays).reduce((a, b) => A(a).concat(b));
}
