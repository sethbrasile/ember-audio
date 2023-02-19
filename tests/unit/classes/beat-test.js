import { Beat } from 'ember-audio';
import { module, test } from 'qunit';
import { settled } from '@ember/test-helpers';

module('Unit | Class | beat', function () {
  // Replace this with your real tests.
  test('it exists', function (assert) {
    let result = Beat.create();
    assert.ok(result);
  });

  test('_markPlaying sets `isPlaying` to `true` and sets up a timer that sets * `isPlaying` back to false after `duration` has elapsed.', async function (assert) {
    let result = Beat.create({ duration: 1 });
    assert.notOk(result.get('isPlaying'));

    result._markPlaying();
    assert.ok(result.get('isPlaying'));

    await settled();
    assert.notOk(result.get('isPlaying'));
  });

  test('_markCurrentTimePlaying sets `currentTimeIsPlaying` to `true` and sets up a timer that sets * `currentTimeIsPlaying` back to false after `duration` has elapsed.', async function (assert) {
    let result = Beat.create({ duration: 1 });
    assert.notOk(result.get('currentTimeIsPlaying'));

    result._markCurrentTimePlaying();
    assert.ok(result.get('currentTimeIsPlaying'));

    await settled();
    assert.notOk(result.get('currentTimeIsPlaying'));
  });
});
