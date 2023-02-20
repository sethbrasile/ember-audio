import { A } from '@ember/array';
import { module, test } from 'qunit';
import noteFactory from '../../helpers/note-factory';
import {
  sortNotes,
  noteSort,
  octaveShift,
  octaveSort,
  extractOctaves,
  stripDuplicateOctaves,
  createOctavesWithNotes,
} from 'ember-audio/utils';

module('Unit | Utility | note methods', function () {
  const A0 = noteFactory('A', null, 0);
  const Bb0 = noteFactory('B', 'b', 0);
  const B0 = noteFactory('B', null, 0);
  const Ab1 = noteFactory('A', 'b', 1);
  const A1 = noteFactory('A', null, 1);
  const Bb1 = noteFactory('B', 'b', 1);
  const B1 = noteFactory('B', null, 1);
  const C1 = noteFactory('C', null, 1);
  const Db1 = noteFactory('D', 'b', 1);

  const correctOctaves = [
    [A0, Bb0, B0],
    [C1, Db1, Ab1, A1, Bb1, B1],
  ];

  test('sortNotes exists', function (assert) {
    assert.ok(sortNotes);
  });

  test('noteSort exists', function (assert) {
    assert.ok(noteSort);
  });

  test('octaveShift exists', function (assert) {
    assert.ok(octaveShift);
  });

  test('octaveSort exists', function (assert) {
    assert.ok(octaveSort);
  });

  test('extractOctaves exists', function (assert) {
    assert.ok(extractOctaves);
  });

  test('stripDuplicateOctaves exists', function (assert) {
    assert.ok(stripDuplicateOctaves);
  });

  test('createOctavesWithNotes exists', function (assert) {
    assert.ok(createOctavesWithNotes);
  });

  test('sortNotes works', function (assert) {
    assert.expect(1);

    let result = sortNotes([A0, Ab1, A1, Bb1, B1, C1, Db1, Bb0, B0]);

    assert.deepEqual(result, A([A0, Bb0, B0, C1, Db1, Ab1, A1, Bb1, B1]));
  });

  test('octaveShift works', function (assert) {
    assert.expect(1);

    let arr1 = [A0, Bb0, B0];
    let arr2 = [Ab1, A1, Bb1, B1, C1, Db1];
    let octaves = [arr1, arr2];
    let result = octaveShift(octaves);

    assert.deepEqual(result, correctOctaves);
  });

  test('octaveSort works', function (assert) {
    const alphabeticalOctaves = [
      [A0, Bb0, B0],
      [Ab1, A1, Bb1, B1, C1, Db1],
    ];

    assert.expect(1);

    let result = octaveSort(correctOctaves);
    assert.deepEqual(result, alphabeticalOctaves);
  });

  test('createOctavesWithNotes works', function (assert) {
    assert.expect(1);
    let arr = [
      [Ab1, Bb0, B0],
      [0, 1],
    ];
    let result = createOctavesWithNotes(arr);
    assert.deepEqual(result, [[Bb0, B0], [Ab1]]);
  });

  test('noteSort compares two letters correctly', function (assert) {
    assert.expect(2);

    let compA = noteSort(A0, B0);
    let compB = noteSort(B0, A0);

    assert.strictEqual(compA, -1);
    assert.strictEqual(compB, 1);
  });

  test('noteSort compares a natural and an accidental correctly', function (assert) {
    assert.expect(2);

    let compA = noteSort(Ab1, A0);
    let compB = noteSort(A0, Ab1);

    assert.strictEqual(compA, -1);
    assert.strictEqual(compB, 1);
  });
});
