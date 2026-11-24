import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import wav, { base64 } from '../../helpers/wav';

module('Unit | Service | audio', function(hooks) {
  setupTest(hooks);

  // Each test answers the service's requests itself, so no files are needed.
  hooks.beforeEach(function() {
    this.originalFetch = window.fetch;
    this.requests = [];
    this.respondWith = (body) => {
      window.fetch = (src) => {
        this.requests.push(src);
        return Promise.resolve(new Response(body));
      };
    };
  });

  hooks.afterEach(function() {
    window.fetch = this.originalFetch;
  });

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

  test('load().asSound fetches, decodes and registers a sound', async function(assert) {
    let service = this.owner.lookup('service:audio');
    this.respondWith(wav(0.1));

    let sound = await service.load('/tone.wav').asSound('unit-tone');

    assert.deepEqual(this.requests, ['/tone.wav']);
    assert.ok(Math.abs(sound.get('audioBuffer.duration') - 0.1) < 0.01, 'the audio was decoded');
    assert.equal(service.getSound('unit-tone'), sound, 'the sound is registered by name');
  });

  test('load().asSound reuses a sound that is already registered', async function(assert) {
    let service = this.owner.lookup('service:audio');
    this.respondWith(wav(0.1));

    let first = await service.load('/tone.wav').asSound('unit-reused');
    let second = await service.load('/tone.wav').asSound('unit-reused');

    assert.equal(second, first);
    assert.equal(this.requests.length, 1, 'it was fetched once');
  });

  test('load().asTrack registers a track', async function(assert) {
    let service = this.owner.lookup('service:audio');
    this.respondWith(wav(0.1));

    let track = await service.load('/tone.wav').asTrack('unit-track');

    assert.ok(Math.abs(track.get('duration.raw') - 0.1) < 0.01);
    assert.equal(service.getTrack('unit-track'), track);
  });

  test('load([...]).asSampler loads every sound into a sampler', async function(assert) {
    let service = this.owner.lookup('service:audio');
    this.respondWith(wav(0.1));

    let sampler = await service.load(['/one.wav', '/two.wav']).asSampler('unit-sampler');

    assert.deepEqual(this.requests, ['/one.wav', '/two.wav']);
    assert.equal(sampler.get('sounds').size, 2);
    assert.equal(service.getSampler('unit-sampler'), sampler);
  });

  test('load().asFont decodes each note of a soundfont', async function(assert) {
    let service = this.owner.lookup('service:audio');
    let note = base64(wav(0.05));
    this.respondWith([
      'if (typeof(MIDI) === \'undefined\') var MIDI = {};',
      'if (typeof(MIDI.Soundfont) === \'undefined\') MIDI.Soundfont = {};',
      'MIDI.Soundfont.unit_instrument = {',
      `"A4": "data:audio/mp3;base64,${note}",`,
      `"Db4": "data:audio/mp3;base64,${note}",`,
      '}'
    ].join('\n'));

    let font = await service.load('/font.js').asFont('unit-font');

    assert.equal(font.get('notes.length'), 2);
    assert.equal(font.getNote('Db4').get('accidental'), 'b');
    assert.equal(service.getFont('unit-font'), font);
  });

  test('load().asNoteArray builds a note for every key in the json', async function(assert) {
    let service = this.owner.lookup('service:audio');
    this.respondWith(JSON.stringify({ A4: 440, A5: 880 }));

    let notes = await service.load('/notes.json').asNoteArray();

    assert.deepEqual(notes.map((note) => note.get('frequency')), [440, 880]);
  });
});
