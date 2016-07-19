import Ember from 'ember';
import PlayableMixin from 'ember-audio/mixins/playable';
import { module, test } from 'qunit';

const {
  Object: EmberObject
} = Ember;

module('Unit | Mixin | playable');

// Replace this with your real tests.
test('it works', function(assert) {
  let PlayableObject = EmberObject.extend(PlayableMixin);
  let subject = PlayableObject.create();
  assert.ok(subject);
});
