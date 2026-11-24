import { module, test } from 'qunit';
import * as addon from 'ember-audio';
import * as addonUtils from 'ember-audio/utils';
import AddonAudioService from 'ember-audio/services/audio';

import { Beat } from 'dummy/classes/beat';
import { BeatTrack } from 'dummy/classes/beat-track';
import { Connection } from 'dummy/classes/connection';
import { Font } from 'dummy/classes/font';
import { LayeredSound } from 'dummy/classes/layered-sound';
import { Note } from 'dummy/classes/note';
import { Oscillator } from 'dummy/classes/oscillator';
import { SampledNote } from 'dummy/classes/sampled-note';
import { Sampler } from 'dummy/classes/sampler';
import { Sound } from 'dummy/classes/sound';
import { Track } from 'dummy/classes/track';
import AudioService from 'dummy/services/audio';
import { arraySwap, flatten } from 'dummy/utils/array-methods';
import { base64ToUint8, mungeSoundFont } from 'dummy/utils/decode-base64';
import exponentialRatio from 'dummy/utils/exponential-ratio';
import {
  sortNotes,
  noteSort,
  octaveShift,
  octaveSort,
  extractOctaves,
  stripDuplicateOctaves,
  createOctavesWithNotes
} from 'dummy/utils/note-methods';
import * as appUtils from 'dummy/utils/utils';
import withinRange from 'dummy/utils/within-range';
import zeroify from 'dummy/utils/zeroify';

// The addon merges its `app` folder into the consuming app. Every file there
// has to re-export something that exists, or strict bundlers fail the build.
module('Unit | App re-exports', function() {
  test('classes are re-exported by name', function(assert) {
    const classes = { Beat, BeatTrack, Connection, Font, LayeredSound, Note, Oscillator, SampledNote, Sampler, Sound, Track };

    Object.keys(classes).forEach((name) => {
      assert.ok(classes[name], `${name} is defined`);
      assert.strictEqual(classes[name], addon[name], `${name} is the addon's class`);
    });
  });

  test('the audio service is re-exported', function(assert) {
    assert.ok(AudioService);
    assert.strictEqual(AudioService, AddonAudioService);
  });

  test('utils with a default export are re-exported as the default', function(assert) {
    assert.strictEqual(exponentialRatio, addonUtils.exponentialRatio);
    assert.strictEqual(withinRange, addonUtils.withinRange);
    assert.strictEqual(zeroify, addonUtils.zeroify);
  });

  test('utils with named exports are re-exported by name', function(assert) {
    const named = {
      arraySwap,
      flatten,
      base64ToUint8,
      mungeSoundFont,
      sortNotes,
      noteSort,
      octaveShift,
      octaveSort,
      extractOctaves,
      stripDuplicateOctaves,
      createOctavesWithNotes
    };

    Object.keys(named).forEach((name) => {
      assert.strictEqual(typeof named[name], 'function', `${name} is a function`);
      assert.strictEqual(named[name], addonUtils[name], `${name} is the addon's function`);
    });
  });

  test('utils/utils re-exports the whole utils index', function(assert) {
    // Older Babel adds a `default` key to a namespace import; it is not an export.
    const names = Object.keys(addonUtils).filter((name) => name !== 'default');

    assert.ok(names.length > 10, `${names.length} utils`);
    names.forEach((name) => {
      assert.ok(appUtils[name] === addonUtils[name], name);
    });
  });
});
