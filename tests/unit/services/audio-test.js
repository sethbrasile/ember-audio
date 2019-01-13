import { module, test } from 'qunit';
// import Ember from 'ember';
import { setupTest } from 'ember-qunit';

module('Unit | Service | audio', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let service = this.owner.lookup('service:audio');
    assert.ok(service);
  });

  test('"_soundNotLoadedError" throws an error', function(assert) {
    let service = this.owner.lookup('service:audio');
    assert.throws(() => service._soundNotLoadedError('test-sound'));
  });
});
