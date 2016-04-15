import { Note, noteSort, octaveShift, octaveSort } from 'ember-audio/utils/note';
import { module, test } from 'qunit';

module('Unit | Utility | note');

const noteFactory = (letter, accidental, octave) => {
  return Note.create({ letter, accidental, octave });
};

const A0  = noteFactory('A', null, 0);
const Bb0 = noteFactory('B', 'b', 0);
const B0  = noteFactory('B', null, 0);
const Ab1 = noteFactory('A', 'b', 1);
const A1  = noteFactory('A', null, 1);
const Bb1 = noteFactory('B', 'b', 1);
const B1  = noteFactory('B', null, 1);
const C1  = noteFactory('C', null, 1);
const Db1 = noteFactory('D', 'b', 1);

const correctOctaves      = [[A0, Bb0, B0], [C1, Db1, Ab1, A1, Bb1, B1]];
const alphabeticalOctaves = [[A0, Bb0, B0], [Ab1, A1, Bb1, B1, C1, Db1]];

test('string is formatted properly', function(assert) {
  assert.expect(1);
  assert.equal(Ab1.get('string'), 'Ab1');
});

test('noteName is formatted properly', function(assert) {
  assert.expect(1);
  assert.equal(Ab1.get('noteName'), 'Ab');
});

test('octaveShift works', function(assert) {
  assert.expect(1);

  let arr1      = [A0, Bb0, B0];
  let arr2      = [Ab1, A1, Bb1, B1, C1, Db1];
  let octaves   = [arr1, arr2];
  let result    = octaveShift(octaves);

  assert.deepEqual(result, correctOctaves);
});

test('octaveSort works', function(assert) {
  assert.expect(1);
  let result = octaveSort(correctOctaves);
  assert.deepEqual(result, alphabeticalOctaves);
});

test('noteSort compares two letters correctly', function(assert) {
  assert.expect(2);

  let compA = noteSort(A0, B0);
  let compB = noteSort(B0, A0);

  assert.equal(compA, -1);
  assert.equal(compB, 1);
});

test('noteSort compares a natural and an accidental correctly', function(assert) {
  assert.expect(2);

  let compA = noteSort(Ab1, A0);
  let compB = noteSort(A0, Ab1);

  assert.equal(compA, -1);
  assert.equal(compB, 1);
});
