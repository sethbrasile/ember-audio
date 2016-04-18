import Ember from 'ember';
import { arraySwap } from './array-methods';

const {
  A,
  computed
} = Ember;

/**
 * Ember.Object that acts as "note".
 * Set it's letter, octave, and (optionally) it's accidental.
 *
 * Computed Properties (examples for notes "Db1" and "D0" respectively):
 *
 * get {string} identifier  examples: "Db1", "D0"
 * get {string} name        examples: "Db", "D"
 */
export const Note = Ember.Object.extend({
  letter: null,
  accidental: null,
  octave: null,

  /**
   * @computed identifier
   * @return {string} computed note name including the octave
   */
  identifier: computed('letter', 'accidental', 'octave', {
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

  /**
   * @computed name
   * @return {string} computed note name, not including octave
   */
  name: computed('letter', 'accidental', {
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

/**
 * octaveShift - Takes an array of arrays of notes, determines the last note of
 * the first array, then splits the rest of the arrays in the array at the last
 * note of the first array, and moves the beginning of the array to the end
 * so that each array starts at the next note after the last note of the first
 * array, instead of at "A" (alphabetically)
 *
 * This is hard to explain. Here's an example.
 * (Simplified, as the real notes are objects.)
 *
 * Example input: [['A0', 'B0'], ['A1', 'B1', 'C1', 'D1']]
 * Example output: [['A0', 'B0'], ['C1', 'D1', 'A1', 'B1']]
 *
 * @param  {array} octaves  an array of octaves, each octave is an array of notes, each note is an Ember.Object
 * @return {array}          same array but shifted around
 */
export function octaveShift(octaves) {
  // Pull first octave from beginning of array
  const firstOctave = A(A(octaves).shiftObject());
  // Get all the note names from the second octave for comparison
  const secondOctaveNames = A(octaves.get('firstObject')).getEach('name');
  // Get the note name of the last note in the first octave
  const lastNote = firstOctave.get('lastObject.name');
  // Get the index of the occurrence of the last note from the first
  // octave, in the second octave
  const indexToShiftAt = secondOctaveNames.lastIndexOf(lastNote) + 1;
  // Split the octave array at that point, and move the first chunk to the end
  return A(octaves.map((octave) => arraySwap(octave, indexToShiftAt)))
  // Put first octave back at the beginning of the array
  .unshiftObjects([firstOctave]);
}

/**
 * octaveSort - Maps through an array of arrays and sorts each array with
 * "noteSort"
 *
 * @param  {array} octaves array of arrays to be sorted
 * @return {array}         array of sorted arrays
 */
export function octaveSort(octaves) {
  return octaves.map((octave) => octave.sort(noteSort));
}

/**
 * extractOctaves - Accepts an array of Note objects and passes back an array
 * like this: [original array, array of each octave in the orginal array]
 *
 * @param  {array} notes array of note objects
 * @return {array}       array containing two inner arrays, [0] is the untouched
 * input array, [1] is an array of all the octaves in the original array
 */
export function extractOctaves(notes) {
  return [ notes, A(A(notes).getEach('octave')) ];
}

/**
 * stripDuplicateOctaves - Accepts an array of two arrays and returns the same
 * array, but with array at index [1] uniq'd and sorted alphabetically
 *
 * @param  {array} [ notes, octaves ] the output from extractOctaves (above)
 * @return {array}
 */
export function stripDuplicateOctaves([ notes, octaves ]) {
  return [ notes, A(octaves).uniq().sort() ];
}

/**
 * createOctavesWithNotes - Accepts an array of two arrays, [0] being an array
 * of Note objects, [1] being all the available octaves. Returns a single array
 * made up of arrays of Note objects, organized by octave. Each inner array
 * represents all of the notes in an octave.
 *
 * @param  {array} data The output of stripDuplicateOctaves (above)
 * @return {array}
 */
export function createOctavesWithNotes([ notes, octaves ]) {
  return A(octaves).map((octave) => A(notes).filterBy('octave', octave));
}

/**
 * noteSort - Acts as a comparator function for javascript's array sort() method.
 * Sorts two Ember.Object "notes" alphabetically, flats before naturals.
 */
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
