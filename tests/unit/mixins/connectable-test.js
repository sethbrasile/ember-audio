import Ember from 'ember';
import ConnectableMixin from 'ember-audio/mixins/connectable';
import { module, test } from 'qunit';

module('Unit | Mixin | connectable');

// Replace this with your real tests.
test('it works', function(assert) {
  let ConnectableObject = Ember.Object.extend(ConnectableMixin);
  let subject = ConnectableObject.create();
  assert.ok(subject);
});
