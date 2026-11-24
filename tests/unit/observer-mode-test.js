import EmberObject from '@ember/object';
import { addObserver } from '@ember/object/observers';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';

// Finds out how this build of Ember runs observers by default: at once (sync),
// or later in the run loop (async, possible from Ember 3.13).
function observerMode() {
  const subject = EmberObject.create({ value: 0 });
  let fired = false;
  let firedAtOnce = false;

  addObserver(subject, 'value', null, () => fired = true);
  run(() => {
    subject.set('value', 1);
    firedAtOnce = fired;
  });

  return firedAtOnce ? 'sync' : 'async';
}

const MODE = observerMode();

module('Unit | Observer mode', function() {
  // The suite is run once in each mode. The mode is in the test's name so that
  // the scripts in scripts/ can check that a run really used the mode they
  // asked for.
  test(`observers are ${MODE} by default in this run`, function(assert) {
    assert.ok([ 'sync', 'async' ].includes(MODE));
  });
});
