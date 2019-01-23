import { module, test } from 'qunit';
// import Ember from 'ember';
import { setupTest } from 'ember-qunit';

module('Unit | Service | audio', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let service = this.owner.lookup('service:audio');
    assert.ok(service);
  });

  test('Oscillator instance update() method sets Oscillator instance frequency to new value', function(assert) {
    let service = this.owner.lookup('service:audio');

    let osc = service.createOscillator({ frequency: 440 });
    assert.equal(osc.get('frequency'), 440);
    osc.update('frequency', 220);
    assert.equal(osc.get('frequency'), 220);
  });
});
