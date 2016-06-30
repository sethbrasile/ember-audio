import { base64ToUint8 } from 'ember-audio/utils/decode-base64';
import { module, test } from 'qunit';

module('Unit | Utility | decode base64');

test('base64ToUint8 works', function(assert) {
  let result = base64ToUint8('//uABCDEFGHIJKLMNOPQRSTUVWXYZ=');
  assert.ok(result);
});

test('base64ToUint8 returns a Uint8Array', function(assert) {
  let result = base64ToUint8('//uABCDEFGHIJKLMNOPQRSTUVWXYZ=');
  assert.ok(result instanceof Uint8Array);
});
