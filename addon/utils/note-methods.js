import Ember from 'ember';
import { arraySwap, flatten } from './array-methods';

const {
  A
} = Ember;

/**
 * @public
 * @class utils
 */

/**
 * Sorts an array of {{#crossLink "Note"}}Notes{{/crossLink}} so that they are in the same order that they would
 * appear on a piano.
 *
 * @param {array} notes An array of notes that should be musically-sorted.
 *
 * @public
 * @method sortNotes
 *
 * @return {array} Array of musically-sorted notes.
 */
export function sortNotes(notes) {
  // get octaves so that we can sort based on them
  let sortedNotes = extractOctaves(notes);

  // Each octave has tons of duplicates
  sortedNotes = stripDuplicateOctaves(sortedNotes);

  // Create array of arrays. Each inner array contains all the notes in an octave
  sortedNotes = createOctavesWithNotes(sortedNotes);

  // Sort the notes in each octave, alphabetically, flats before naturals
  sortedNotes = octaveSort(sortedNotes);

  // Determine last note of first octave, then for each octave, split at
  // that note, then shift the beginning notes to the end
  sortedNotes = octaveShift(sortedNotes);

  // Flatten array of arrays into a flat array
  return A(flatten(sortedNotes));
}

/**
 * Takes an array of arrays of notes, determines the last note of
 * the first array, then splits the rest of the arrays in the array at the last
 * note of the first array, and moves the beginning of the array to the end
 * so that each array starts at the next note after the last note of the first
 * array, instead of at "A" (alphabetically).
 *
 * @example
 *     This is hard to explain. Here's an example.
 *     (Simplified, as the real notes are objects)
 *
 *     Example input: [['A0', 'B0'], ['A1', 'B1', 'C1', 'D1']]
 *     Example output: [['A0', 'B0'], ['C1', 'D1', 'A1', 'B1']]
 *
 * @private
 * @method octaveShift
 *
 * @param {array} octaves An array of octaves, each octave is an array of Notes.
 *
 * @return {array} Input array after having been shifted.
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
 * Maps through an array of arrays and sorts each array with
 * "noteSort"
 *
 * @private
 * @method octaveSort
 *
 * @param  {array} octaves array of arrays to be sorted
 *
 * @return {array} array of sorted arrays
 */
export function octaveSort(octaves) {
  return octaves.map((octave) => octave.sort(noteSort));
}

/**
 * Accepts an array of Note objects and passes back an array
 * like this: [original array, array of each octave in the orginal array]
 *
 * @private
 * @method extractOctaves
 *
 * @param  {array} notes array of note objects.
 *
 * @return {array} array containing two inner arrays, [0] is the untouched input
 * array, [1] is an array of all the octaves in the original array.
 */
export function extractOctaves(notes) {
  return [ notes, A(A(notes).getEach('octave')) ];
}

/**
 * Accepts an array of two arrays and returns the same
 * array, but with array at index [1] uniq'd and sorted alphabetically.
 *
 * @private
 * @method stripDuplicateOctaves
 *
 * @param  {array} [ notes, octaves ] the output from extractOctaves.
 *
 * @return {array} The mutated array.
 */
export function stripDuplicateOctaves([ notes, octaves ]) {
  return [ notes, A(octaves).uniq().sort() ];
}

/**
 * Accepts an array of two arrays, [0] being an array
 * of Note objects, [1] being all the available octaves. Returns a single array
 * made up of arrays of Note objects, organized by octave. Each inner array
 * represents all of the notes in an octave.
 *
 * @private
 * @method createOctavesWithNotes
 *
 * @param  {array} data The output of stripDuplicateOctaves.
 *
 * @return {Ember.MutableArray}
 */
export function createOctavesWithNotes([ notes, octaves ]) {
  return A(octaves).map((octave) => A(notes).filterBy('octave', octave));
}

/**
 * Acts as a comparator function for the
 * {{#crossLink "Array/sort:method"}}Array.prototype.sort{{/crossLink}} method.
 * Sorts two {{#crossLink "Note"}}{{/crossLink}} instances alphabetically, flats
 * before naturals.
 *
 * @private
 * @method noteSort
 *
 * @param {Note} a The first Note instance to compare.
 * @param {Note} b The second Note instance to compare.
 *
 * @return {number} -1 or 1, depending on whether the current
 * {{#crossLink "Note"}}{{/crossLink}} instance should be sorted left, or right.
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
