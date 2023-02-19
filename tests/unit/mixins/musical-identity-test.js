import EmberObject from '@ember/object';
import MusicalIdentityMixin from 'ember-audio/mixins/musical-identity';
import { module, test } from 'qunit';

const Note = EmberObject.extend(MusicalIdentityMixin);

module('Unit | Mixin | musical identity', function () {
  test('it exists', function (assert) {
    let subject = Note.create();
    assert.ok(subject);
  });

  test('identifier is formatted properly', function (assert) {
    assert.expect(1);

    const note = Note.create({ frequency: 51.91 });

    assert.strictEqual(note.get('identifier'), 'Ab1');
  });

  test('identifier is formatted properly when note has no accidental', function (assert) {
    assert.expect(1);

    const note = Note.create({ frequency: 55 });

    assert.strictEqual(note.get('identifier'), 'A1');
  });

  test('name is formatted properly', function (assert) {
    assert.expect(1);

    const note = Note.create({ frequency: 51.91 });

    assert.strictEqual(note.get('name'), 'Ab');
  });

  test('setting frequency properly calculates other props', function (assert) {
    assert.expect(5);

    const note = Note.create({ frequency: 440 });

    assert.strictEqual(note.get('identifier'), 'A4');
    assert.strictEqual(note.get('name'), 'A');
    assert.strictEqual(note.get('octave'), '4');
    assert.strictEqual(note.get('letter'), 'A');
    assert.strictEqual(note.get('accidental'), undefined);
  });

  test('setting identifier properly calculates other props', function (assert) {
    assert.expect(5);

    const note = Note.create({ identifier: 'A4' });

    assert.strictEqual(note.get('frequency'), 440);
    assert.strictEqual(note.get('name'), 'A');
    assert.strictEqual(note.get('octave'), '4');
    assert.strictEqual(note.get('letter'), 'A');
    assert.strictEqual(note.get('accidental'), undefined);
  });

  test('setting identifier with accidental properly calculates other props', function (assert) {
    assert.expect(5);

    const note = Note.create({ identifier: 'Ab4' });

    assert.strictEqual(note.get('frequency'), 415.3);
    assert.strictEqual(note.get('name'), 'Ab');
    assert.strictEqual(note.get('octave'), '4');
    assert.strictEqual(note.get('letter'), 'A');
    assert.strictEqual(note.get('accidental'), 'b');
  });

  test('still works if manually set letter, accidental and octave', function (assert) {
    assert.expect(3);

    const note = Note.create({ letter: 'A', accidental: 'b', octave: 4 });

    assert.strictEqual(note.get('frequency'), 415.3);
    assert.strictEqual(note.get('name'), 'Ab');
    assert.strictEqual(note.get('identifier'), 'Ab4');
  });

  test('still works if manually set letter and octave (no accidental)', function (assert) {
    assert.expect(3);

    const note = Note.create({ letter: 'A', octave: 4 });

    assert.strictEqual(note.get('frequency'), 440);
    assert.strictEqual(note.get('name'), 'A');
    assert.strictEqual(note.get('identifier'), 'A4');
  });
});
