import { module, test } from 'qunit';
import * as Utils from 'ember-audio/utils';

module('Unit | Utility | note methods');

test('sortNotes exists', function(assert) {
  assert.ok(Utils.sortNotes);
});

test('noteSort exists', function(assert) {
  assert.ok(Utils.noteSort);
});

test('octaveShift exists', function(assert) {
  assert.ok(Utils.octaveShift);
});

test('octaveSort exists', function(assert) {
  assert.ok(Utils.octaveSort);
});

test('extractOctaves exists', function(assert) {
  assert.ok(Utils.extractOctaves);
});

test('stripDuplicateOctaves exists', function(assert) {
  assert.ok(Utils.stripDuplicateOctaves);
});

test('createOctavesWithNotes exists', function(assert) {
  assert.ok(Utils.createOctavesWithNotes);
});
