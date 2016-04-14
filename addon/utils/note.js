import Ember from 'ember';
import { arraySwap } from './array-methods';

const {
  A,
  computed
} = Ember;

export const Note = Ember.Object.extend({
  letter: null,
  accidental: null,
  octave: null,

  string: computed('letter', 'accidental', 'octave', {
    get() {
      const accidental = this.get('accidental');
      const letter = this.get('letter');
      const octave = this.get('octave');
      let output;

      if (accidental) {
        output = `${letter}${accidental}${octave}`;
      } else {
        output = `${letter}${octave}`;
      }

      return output;
    }
  }),

  noteName: computed('letter', 'accidental', {
    get() {
      const accidental = this.get('accidental');
      const letter = this.get('letter');
      let output;

      if (accidental) {
        output = `${letter}${accidental}`;
      } else {
        output = `${letter}`;
      }

      return output;
    }
  })
});

export function octaveShift(octaves) {
  // Pull first octave from beginning of array
  const firstOctave = A(A(octaves).shiftObject());
  // Get all the note names from the second octave for comparison
  const secondOctaveNames = A(octaves.get('firstObject')).getEach('noteName');
  // Get the note name of the last note in the first octave
  const lastNote = firstOctave.get('lastObject.noteName');
  // Get the index of the occurrence of the last note from the first
  // octave, in the second octave
  const indexToShiftAt = secondOctaveNames.lastIndexOf(lastNote) + 1;
  // Split the octave array at that point, and move the first chunk to the end
  return A(octaves.map((octave) => arraySwap(octave, indexToShiftAt)))
  // Put first octave back at the beginning of the array
  .unshiftObjects([firstOctave]);
}

export function octaveSort(octaves) {
  return octaves.map((octave) => octave.sort(noteSort));
}

// Sorts alphabetically, flats before naturals
export function noteSort(a, b) {
  const aLet = a.get('letter');
  const bLet = b.get('letter');

  if (aLet < bLet) {
    return -1;
  }

  if (aLet === bLet) {
    if (a.get('accidental') === 'b') {
      return -1;
    }
  }

  return 1;
}
