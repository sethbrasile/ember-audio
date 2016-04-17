import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import ContextMock from '../../helpers/context-mock';

moduleFor('service:audio', 'Unit | Service | audio', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});

test('play calls "createBufferSource" from context when playing plain sound', function(assert) {
  assert.expect(2);
  let service = this.subject({ context: ContextMock.create() });

  service.set('test-sound', true);

  assert.notOk(service.get('context.createBufferSourceCalled'));
  service.play('test-sound');
  assert.ok(service.get('context.createBufferSourceCalled'));
});

test('play calls "createBufferSource" from context when playing note from soundfont', function(assert) {
  assert.expect(2);
  let service = this.subject({ context: ContextMock.create() });

  service.set('test-font', Ember.Object.create({ testSound: true }));

  assert.notOk(service.get('context.createBufferSourceCalled'));
  service.play('test-font', 'testSound');
  assert.ok(service.get('context.createBufferSourceCalled'));
});

test('play calls "_soundNotLoadedError" when sound is not previously loaded', function(assert) {
  assert.expect(2);
  let service = this.subject({
    errorCalled: false,
    context: ContextMock.create()
  });

  service.set('_soundNotLoadedError', () => service.set('errorCalled', true));

  assert.notOk(service.get('errorCalled'));
  service.play('test-sound');
  assert.ok(service.get('errorCalled'));
});

test('play calls "_soundNotLoadedError" when soundfont is not previously loaded', function(assert) {
  assert.expect(2);
  let service = this.subject({
    errorCalled: false,
    context: ContextMock.create()
  });

  service.set('_soundNotLoadedError', () => service.set('errorCalled', true));

  assert.notOk(service.get('errorCalled'));
  service.play('test-font', 'testSound');
  assert.ok(service.get('errorCalled'));
});

test('"_soundNotLoadedError" throws an error', function(assert) {
  let service = this.subject();
  assert.throws(() => service._soundNotLoadedError('test-sound'));
});

test('play calls "connect" from returned "bufferSource" when playing plain sound', function(assert) {
  assert.expect(2);
  let service = this.subject({ context: ContextMock.create() });

  service.set('test-sound', true);

  assert.notOk(service.get('context.bufferSource.connectCalled'));
  service.play('test-sound');
  assert.ok(service.get('context.bufferSource.connectCalled'));
});

test('play calls "connect" from returned "bufferSource" when playing note from soundfont', function(assert) {
  assert.expect(2);
  let service = this.subject({ context: ContextMock.create() });

  service.set('test-font', Ember.Object.create({ testSound: true }));

  assert.notOk(service.get('context.bufferSource.connectCalled'));
  service.play('test-font', 'testSound');
  assert.ok(service.get('context.bufferSource.connectCalled'));
});

test('play calls "connect" with context\'s destination on "bufferSource" for plain sound', function(assert) {
  assert.expect(2);
  let service = this.subject({ context: ContextMock.create() });

  service.set('test-sound', true);

  assert.notOk(service.get('context.bufferSource'));
  service.play('test-sound');
  assert.equal(service.get('context.bufferSource.connectedObject'), service.get('context.destination'));
});

test('play calls "connect" with context\'s destination on "bufferSource" for plain sound', function(assert) {
  assert.expect(2);
  let service = this.subject({ context: ContextMock.create() });

  service.set('test-font', Ember.Object.create({ testSound: true }));

  assert.notOk(service.get('context.bufferSource'));
  service.play('test-font', 'testSound');
  assert.equal(service.get('context.bufferSource.connectedObject'), service.get('context.destination'));
});

test('play connects "panner" when available for plain sound', function(assert) {
  assert.expect(4);
  let service = this.subject({ context: ContextMock.create() });

  service.set('test-sound', true);
  service.set('test-soundPanner', ContextMock.create());

  assert.notOk(service.get('context.bufferSource'));
  assert.notOk(service.get('test-soundPanner.bufferSource'));
  service.play('test-sound');
  assert.equal(service.get('context.bufferSource.connectedObject'), service.get('test-soundPanner'));
  assert.equal(service.get('test-soundPanner.connectedObject'), service.get('context.destination'));
});

test('play connects "panner" when available for soundfont', function(assert) {
  assert.expect(4);
  let service = this.subject({ context: ContextMock.create() });

  service.set('test-font', Ember.Object.create({ testSound: true }));
  service.set('test-fontPanner', ContextMock.create());

  assert.notOk(service.get('context.bufferSource'));
  assert.notOk(service.get('test-fontPanner.bufferSource'));
  service.play('test-font', 'testSound');
  assert.equal(service.get('context.bufferSource.connectedObject'), service.get('test-fontPanner'));
  assert.equal(service.get('test-fontPanner.connectedObject'), service.get('context.destination'));
});

test('pan creates "namePanner" and sets it\'s value to "value" param', function(assert) {
  assert.expect(3);
  let service = this.subject({ context: ContextMock.create() });

  service.set('test-sound', true);

  assert.notOk(service.get('test-soundPanner'));
  service.pan('test-sound', 0.3);
  assert.ok(service.get('test-soundPanner'));
  assert.equal(service.get('test-soundPanner.pan.value'), 0.3);
});

test('pan uses existing "namePanner" if it exists, instead of creating a new one', function(assert) {
  assert.expect(1);
  let service = this.subject({ context: ContextMock.create() });
  let existingPanner = service.get('context').createStereoPanner();
  existingPanner.pan.value = 0.4;

  service.set('test-sound', true);
  service.set('test-soundPanner', existingPanner);
  service.pan('test-sound', 0.3);
  assert.equal(service.get('test-soundPanner'), existingPanner);
});
