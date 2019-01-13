import { BeatTrack } from 'ember-audio';
import { module, test } from 'qunit';

module('Unit | Class | beat track', function() {
  test('it exists', function(assert) {
    let result = BeatTrack.create();
    assert.ok(result);
  });

  test(`beats' 'active' state is saved when numBeats changes`, function(assert) {
    let result = BeatTrack.create();
    let [ beat1, beat2, beat3 ] = result.get('beats');

    beat1.set('active', true);
    beat3.set('active', true);

    result.set('numBeats', 6);

    [ beat1, beat2, beat3 ] = result.get('beats');

    assert.ok(beat1.get('active'));
    assert.notOk(beat2.get('active'));
    assert.ok(beat3.get('active'));

    result.set('numBeats', 4);

    [ beat1, beat2, beat3 ] = result.get('beats');

    assert.ok(beat1.get('active'));
    assert.notOk(beat2.get('active'));
    assert.ok(beat3.get('active'));
  });
});
