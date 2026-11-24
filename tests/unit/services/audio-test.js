import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { Promise as RSVPPromise } from 'rsvp';
import { schedule } from '@ember/runloop';
import wav, { base64 } from '../../helpers/wav';

const SOUNDFONT = [
  'if (typeof(MIDI) === \'undefined\') var MIDI = {};',
  'if (typeof(MIDI.Soundfont) === \'undefined\') MIDI.Soundfont = {};',
  'MIDI.Soundfont.unit_instrument = {',
  `"A4": "data:audio/mp3;base64,${base64(wav(0.05, 440))}",`,
  `"C4": "data:audio/mp3;base64,${base64(wav(0.05, 261.63))}",`,
  `"Db4": "data:audio/mp3;base64,${base64(wav(0.05, 277.18))}",`,
  '}'
].join('\n');

// The service is a singleton that keeps what it loads, so every test uses its
// own names.
module('Unit | Service | audio', function(hooks) {
  setupTest(hooks);

  // Files are served from memory as blob URLs and go through the browser's real
  // fetch and the real decoder. `this.requests` records what the service asked for.
  hooks.beforeEach(function() {
    const originalFetch = window.fetch;
    const urls = [];

    this.requests = [];
    this.urlFor = (body, type = 'audio/wav') => {
      const url = URL.createObjectURL(new Blob([body], { type }));
      urls.push(url);
      return url;
    };

    window.fetch = (...args) => {
      this.requests.push(args[0]);
      return originalFetch.apply(window, args);
    };

    this.restore = () => {
      window.fetch = originalFetch;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  });

  hooks.afterEach(function() {
    this.restore();
  });

  test('it exists', function(assert) {
    let service = this.owner.lookup('service:audio');
    assert.ok(service);
    assert.ok(service.get('audioContext'), 'it has an audio context');
  });

  test('Oscillator instance update() method sets Oscillator instance frequency to new value', function(assert) {
    let service = this.owner.lookup('service:audio');

    let osc = service.createOscillator({ frequency: 440 });
    assert.equal(osc.get('frequency'), 440);
    osc.update('frequency', 220);
    assert.equal(osc.get('frequency'), 220);
  });

  test('createOscillator returns an oscillator that is wired and can play', function(assert) {
    let service = this.owner.lookup('service:audio');
    let osc = service.createOscillator({ frequency: 440, gain: 0.3 });

    assert.ok(osc.getNodeFrom('gain'), 'gain node exists right away');
    assert.ok(osc.getNodeFrom('panner'), 'panner node exists right away');

    osc.play();
    osc.stop();
    assert.ok(true, 'it plays and stops on a real audio context');
  });

  test('createWhiteNoise returns a sound with one second of audio', function(assert) {
    let service = this.owner.lookup('service:audio');
    let noise = service.createWhiteNoise();

    assert.ok(Math.abs(noise.get('audioBuffer.duration') - 1) < 0.01);
  });

  test('createNoteArray builds a note for every frequency it knows', function(assert) {
    let service = this.owner.lookup('service:audio');
    let notes = service.createNoteArray();

    assert.ok(notes.length > 80, `${notes.length} notes`);
    assert.ok(notes[0].get('frequency') > 0);
  });

  test('load().asSound fetches, decodes and registers a sound', async function(assert) {
    let service = this.owner.lookup('service:audio');
    let url = this.urlFor(wav(0.1));

    let sound = await service.load(url).asSound('unit-tone');

    assert.deepEqual(this.requests, [url]);
    assert.ok(Math.abs(sound.get('audioBuffer.duration') - 0.1) < 0.01, 'the audio was decoded');
    assert.equal(service.getSound('unit-tone'), sound, 'the sound is registered by name');

    sound.changeGainTo(0.5).from('ratio');
    assert.equal(sound.getNodeFrom('gain').gain.value, 0.5, 'gain can be set right away');
  });

  test('load().asSound reuses a sound that is already registered', async function(assert) {
    let service = this.owner.lookup('service:audio');
    let url = this.urlFor(wav(0.1));

    let first = await service.load(url).asSound('unit-reused');
    let second = await service.load(url).asSound('unit-reused');

    assert.equal(second, first);
    assert.equal(this.requests.length, 1, 'it was fetched once');
  });

  test('a load returns an RSVP promise and runs its callbacks inside a run loop', async function(assert) {
    let service = this.owner.lookup('service:audio');
    let promise = service.load(this.urlFor(wav(0.1))).asSound('unit-run-loop');
    let scheduled = false;

    assert.ok(promise instanceof RSVPPromise, 'the promise is an RSVP promise');

    // Before Ember 3, scheduling outside a run loop throws while testing.
    await promise.then(() => schedule('actions', () => scheduled = true));

    assert.ok(scheduled);
  });

  test('load().asSound resolves with nothing when the file is not audio', async function(assert) {
    let service = this.owner.lookup('service:audio');

    let sound = await service.load(this.urlFor('not audio', 'text/plain')).asSound('unit-broken');

    assert.strictEqual(sound, undefined);
    assert.strictEqual(service.getSound('unit-broken'), undefined, 'nothing is registered');
  });

  test('load().asSound resolves with nothing when the request fails', async function(assert) {
    let service = this.owner.lookup('service:audio');

    window.fetch = () => Promise.reject(new TypeError('Failed to fetch'));
    assert.strictEqual(await service.load('unreachable.wav').asSound('unit-unreachable'), undefined);

    window.fetch = () => Promise.resolve(new Response('Not Found', { status: 404 }));
    assert.strictEqual(await service.load('missing.wav').asSound('unit-missing'), undefined);

    assert.strictEqual(service.getSound('unit-unreachable'), undefined, 'nothing is registered');
    assert.strictEqual(service.getSound('unit-missing'), undefined);
  });

  test('a load in a browser without fetch fails through its promise', async function(assert) {
    let service = this.owner.lookup('service:audio');
    let promise;

    window.fetch = undefined;
    promise = service.load('anything.wav').asSound('unit-no-fetch');

    assert.ok(promise instanceof RSVPPromise, 'it returns a promise and does not throw');
    assert.strictEqual(await promise, undefined);
  });

  test('load().asTrack registers a track with a duration', async function(assert) {
    let service = this.owner.lookup('service:audio');

    let track = await service.load(this.urlFor(wav(0.1))).asTrack('unit-track');

    assert.ok(Math.abs(track.get('duration.raw') - 0.1) < 0.01);
    assert.equal(service.getTrack('unit-track'), track);
  });

  test('load([...]).asSampler loads every sound into a sampler that plays', async function(assert) {
    let service = this.owner.lookup('service:audio');
    let urls = [this.urlFor(wav(0.1, 440)), this.urlFor(wav(0.1, 660))];

    let sampler = await service.load(urls).asSampler('unit-sampler');

    assert.deepEqual(this.requests, urls);
    assert.equal(sampler.get('sounds').size, 2);
    assert.equal(service.getSampler('unit-sampler'), sampler);

    sampler.play();
    sampler.play();
  });

  test('load([...]).asBeatTrack loads every sound into a beat track that plays', async function(assert) {
    let service = this.owner.lookup('service:audio');
    let urls = [this.urlFor(wav(0.1, 440)), this.urlFor(wav(0.1, 660))];

    let beatTrack = await service.load(urls).asBeatTrack('unit-beats');

    assert.equal(beatTrack.get('sounds').size, 2);
    assert.equal(beatTrack.get('beats.length'), 4, 'four beats by default');

    beatTrack.get('beats')[0].set('active', true);
    beatTrack.playActiveBeats(240, 1 / 4);
    beatTrack.playBeats(240, 1 / 4);
  });

  test('load().asFont decodes each note of a soundfont', async function(assert) {
    let service = this.owner.lookup('service:audio');

    let font = await service.load(this.urlFor(SOUNDFONT, 'text/javascript')).asFont('unit-font');

    assert.equal(font.get('notes.length'), 3);
    assert.equal(font.getNote('Db4').get('accidental'), 'b');
    assert.equal(service.getFont('unit-font'), font);

    font.play('A4');
  });

  test('load().asFont resolves with nothing when the file is not a soundfont', async function(assert) {
    let service = this.owner.lookup('service:audio');

    let font = await service.load(this.urlFor('not a soundfont', 'text/plain')).asFont('unit-broken-font');

    assert.strictEqual(font, undefined);
  });

  test('load().asNoteArray builds a note for every key in the json', async function(assert) {
    let service = this.owner.lookup('service:audio');
    let url = this.urlFor(JSON.stringify({ A4: 440, A5: 880 }), 'application/json');

    let notes = await service.load(url).asNoteArray();

    assert.deepEqual(notes.map((note) => note.get('frequency')), [440, 880]);
  });
});
