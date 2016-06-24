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

test('"_soundNotLoadedError" throws an error', function(assert) {
  let service = this.subject();
  assert.throws(() => service._soundNotLoadedError('test-sound'));
});
