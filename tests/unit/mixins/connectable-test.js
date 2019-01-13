import EmberObject from '@ember/object';
import ContextMock from '../../helpers/context-mock';
import ConnectableMixin from 'ember-audio/mixins/connectable';
import { module, test } from 'qunit';

module('Unit | Mixin | connectable');

// Replace this with your real tests.
test('it works', function(assert) {
  let audioContext = ContextMock.create();
  let ConnectableObject = EmberObject.extend(ConnectableMixin);
  let subject = ConnectableObject.create({ audioContext });
  assert.ok(subject);
});
