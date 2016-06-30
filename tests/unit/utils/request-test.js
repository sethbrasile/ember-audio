import Ember from 'ember';
import request from 'dummy/utils/request';
import { module, test } from 'qunit';

module('Unit | Utility | request');

test('it exists', function(assert) {
  let result = request();
  assert.ok(result);
});

test('it returns a promise', function(assert) {
  let result = request();
  assert.ok(result instanceof Ember.RSVP.Promise);
});

test('the promise resolves to an ArrayBuffer', function(assert) {
  return request().then((result) => {
    assert.ok(result instanceof window.ArrayBuffer);
  });
});
