import Ember from 'ember';
import MusicalIdentityMixin from 'ember-audio/mixins/musical-identity';
import { module, test } from 'qunit';

const {
  Object: EmberObject
} = Ember;

const Note = EmberObject.extend(MusicalIdentityMixin);

module('Unit | Mixin | musical identity');

test('it exists', function(assert) {
  let subject = Note.create();
  assert.ok(subject);
});

test('identifier is formatted properly', function(assert) {
  assert.expect(1);

  const note = Note.create({ frequency: 51.91 });

  assert.equal(note.get('identifier'), 'Ab1');
});

test('identifier is formatted properly when note has no accidental', function(assert) {
  assert.expect(1);

  const note = Note.create({ frequency: 55 });

  assert.equal(note.get('identifier'), 'A1');
});

test('name is formatted properly', function(assert) {
  assert.expect(1);

  const note = Note.create({ frequency: 51.91 });

  assert.equal(note.get('name'), 'Ab');
});

test('setting frequency properly calculates other props', function(assert) {
  assert.expect(5);

  const note = Note.create({ frequency: 440 });

  assert.equal(note.get('identifier'), 'A4');
  assert.equal(note.get('name'), 'A');
  assert.equal(note.get('octave'), 4);
  assert.equal(note.get('letter'), 'A');
  assert.equal(note.get('accidental'), null);
});

test('setting identifier properly calculates other props', function(assert) {
  assert.expect(5);

  const note = Note.create({ identifier: 'A4' });

  assert.equal(note.get('frequency'), 440);
  assert.equal(note.get('name'), 'A');
  assert.equal(note.get('octave'), 4);
  assert.equal(note.get('letter'), 'A');
  assert.equal(note.get('accidental'), null);
});

test('setting identifier with accidental properly calculates other props', function(assert) {
  assert.expect(5);

  const note = Note.create({ identifier: 'Ab4' });

  assert.equal(note.get('frequency'), 415.3);
  assert.equal(note.get('name'), 'Ab');
  assert.equal(note.get('octave'), 4);
  assert.equal(note.get('letter'), 'A');
  assert.equal(note.get('accidental'), 'b');
});

test('still works if manually set letter, accidental and octave', function(assert) {
  assert.expect(2);

  const note = Note.create({ letter: 'A', accidental: 'b', octave: 4 });

  assert.equal(note.get('frequency'), 415.3);
  assert.equal(note.get('name'), 'Ab');
});
