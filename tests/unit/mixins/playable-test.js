import { later } from '@ember/runloop';
import { Promise } from 'rsvp';
import EmberObject from '@ember/object';
import ContextMock from '../../helpers/context-mock';
import PlayableMixin from 'ember-audio/mixins/playable';
import ConnectableMixin from 'ember-audio/mixins/connectable';
import AudioBufferMock from '../../helpers/audio-buffer-mock';
import { module, test } from 'qunit';

const audioContext = ContextMock.create();
const audioBuffer = AudioBufferMock.create();

const PlayableObject = EmberObject.extend(PlayableMixin, {
  playCalled: false,
  stopCalled: false,

  playTime: null,
  stopTime: null,

  _play(time) {
    this.set('playCalled', true);
    this.set('playTime', time);
  },

  _stop(time) {
    this.set('stopCalled', true);
    this.set('stopTime', time);
  },
});

module('Unit | Mixin | playable', function () {
  test('it exists', function (assert) {
    let subject = PlayableObject.create({ audioContext });
    assert.ok(subject);
  });

  test('isPlaying exists and is false by default', function (assert) {
    let subject = PlayableObject.create({ audioContext });
    assert.false(subject.get('isPlaying'));
  });

  test('play() calls _play with audioContext.currentTime', function (assert) {
    let subject = PlayableObject.create({ audioContext });
    subject.play();
    assert.strictEqual(
      subject.get('playTime'),
      audioContext.get('currentTime')
    );
  });

  test('playAt() calls _play, directly passing time param', function (assert) {
    let subject = PlayableObject.create({ audioContext });
    subject.playAt(120);
    assert.strictEqual(subject.get('playTime'), 120);
  });

  test('playIn() calls _play with seconds added to currentTime', function (assert) {
    let subject = PlayableObject.create({ audioContext });
    subject.playIn(5);
    assert.strictEqual(
      subject.get('playTime'),
      audioContext.get('currentTime') + 5
    );
  });

  test('playFor() calls play, and calls stopIn with seconds added to currentTime', function (assert) {
    let subject = PlayableObject.create({ audioContext });
    subject.playFor(5);
    assert.strictEqual(
      subject.get('playTime'),
      audioContext.get('currentTime')
    );
    assert.strictEqual(subject.get('stopTime'), 115);
  });

  test('playInAndStopAfter() calls playIn, and calls stopIn with seconds added to playIn time', function (assert) {
    let subject = PlayableObject.create({ audioContext });
    let currentTime = audioContext.get('currentTime');

    subject.playInAndStopAfter(5, 10);

    assert.strictEqual(subject.get('playTime'), currentTime + 5);
    assert.strictEqual(subject.get('stopTime'), currentTime + 15);
  });

  test('stop() calls _stop with audioContext.currentTime', function (assert) {
    let subject = PlayableObject.create({ audioContext });

    subject.stop();
    assert.strictEqual(
      subject.get('stopTime'),
      audioContext.get('currentTime')
    );
  });

  test('stopIn() calls _stop with seconds added to currentTime', function (assert) {
    let subject = PlayableObject.create({ audioContext });

    subject.stopIn(5);
    assert.strictEqual(
      subject.get('stopTime'),
      audioContext.get('currentTime') + 5
    );
  });

  test('stopAt() calls _stop, directly passing time param', function (assert) {
    let subject = PlayableObject.create({ audioContext });

    subject.stopAt(120);
    assert.strictEqual(subject.get('stopTime'), 120);
  });

  test('_stop calls stop() on audioSource, passing through time', function (assert) {
    let Playable = EmberObject.extend(PlayableMixin, ConnectableMixin);
    let subject = Playable.create({ audioContext, audioBuffer });

    subject._stop(120);
    assert.strictEqual(subject.getNodeFrom('audioSource').get('stopTime'), 120);
  });

  test('_stop does not error if no audioSourceConnection.node', function (assert) {
    let Playable = EmberObject.extend(PlayableMixin, ConnectableMixin);
    let subject = Playable.create({ audioContext, audioBuffer });
    subject.getConnection('audioSource').set('node', null);

    subject._stop(120);
    assert.ok(true);
  });

  test('_stop sets isPlaying to false immediately if stopAt is equal to currentTime', function (assert) {
    assert.expect(1);

    let Playable = EmberObject.extend(PlayableMixin, ConnectableMixin);
    let subject = Playable.create({ audioContext, audioBuffer });

    subject.set('isPlaying', true);

    subject._stop(110);
    assert.notOk(subject.get('isPlaying'));
  });

  test('_stop sets isPlaying to false later if stopAt is in the future', function (assert) {
    assert.expect(2);

    let Playable = EmberObject.extend(PlayableMixin, ConnectableMixin);
    let subject = Playable.create({ audioContext, audioBuffer });

    subject.set('isPlaying', true);

    subject._stop(110.01);
    assert.ok(subject.get('isPlaying'));

    return new Promise((resolve) => {
      later(() => resolve(assert.notOk(subject.get('isPlaying'))), 0.1 * 1000);
    });
  });

  test('_play calls start() on audioSource, passing through time', function (assert) {
    let Playable = EmberObject.extend(PlayableMixin, ConnectableMixin);
    let subject = Playable.create({ audioContext, audioBuffer });

    subject._play(120);
    assert.strictEqual(
      subject.getNodeFrom('audioSource').get('startTime'),
      120
    );
  });

  test('_play calls wireConnections()', function (assert) {
    let Playable = EmberObject.extend(PlayableMixin, ConnectableMixin, {
      wireConnectionsCalled: false,

      wireConnections() {
        this._super();
        this.set('wireConnectionsCalled', true);
      },
    });

    let subject = Playable.create({ audioContext, audioBuffer });

    subject._play(120);
    assert.ok(subject.get('wireConnectionsCalled'));
  });

  test('_play sets isPlaying to true immediately if playAt is equal to currentTime', function (assert) {
    let Playable = EmberObject.extend(PlayableMixin, ConnectableMixin);
    let subject = Playable.create({ audioContext, audioBuffer });

    subject._play(110);
    assert.ok(subject.get('isPlaying'));
  });

  test('_play sets isPlaying to true if playAt is in the future', function (assert) {
    assert.expect(2);

    let Playable = EmberObject.extend(PlayableMixin, ConnectableMixin);
    let subject = Playable.create({ audioContext, audioBuffer });

    subject._play(0.1);
    assert.notOk(subject.get('isPlaying'));

    return new Promise((resolve) => {
      later(() => resolve(assert.ok(subject.get('isPlaying'))), 0.1 * 1001);
    });
  });
});
