import { BeatTrack, Sound } from 'ember-audio';
import ContextMock from '../../helpers/context-mock';
import AudioBufferMock from '../../helpers/audio-buffer-mock';
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

  test('playActiveBeats method calls _callPlayMethodOnBeats with "playIn" as first param', function(assert) {
    let result = BeatTrack.create();
    result._callPlayMethodOnBeats = arg1 => assert.equal(arg1, 'playIn');
    result.playBeats(0,0);
  });

  test('playActiveBeats method calls _callPlayMethodOnBeats with "ifActivePlayIn" as first param', function(assert) {
    let result = BeatTrack.create();
    result._callPlayMethodOnBeats = arg1 => assert.equal(arg1, 'ifActivePlayIn');
    result.playActiveBeats(0,0);
  });

  test('_callPlayMethodOnBeats method calls "method" arg on all beats in beats array', function(assert) {
    let audioContext = ContextMock.create();
    let audioBuffer = AudioBufferMock.create();
    let counter = 0;
    let sound = Sound.create({
      audioContext,
      audioBuffer,

      playIn() {
        counter++;
      }
    });

    let result = BeatTrack.create();
    let sounds = result.get('sounds');

    sounds.add(sound);

    result._callPlayMethodOnBeats('playIn', 120);
    assert.equal(counter, 4);
  });
});
