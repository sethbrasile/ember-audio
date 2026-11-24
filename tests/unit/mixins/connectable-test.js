import { A } from '@ember/array';
import EmberObject from '@ember/object';
import ContextMock from '../../helpers/context-mock';
import ConnectableMixin from 'ember-audio/mixins/connectable';
import { Connection, Sound } from 'ember-audio';
import { module, test } from 'qunit';
import { settled } from '@ember/test-helpers';
import { run } from '@ember/runloop';

module('Unit | Mixin | connectable', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    let audioContext = ContextMock.create();
    let ConnectableObject = EmberObject.extend(ConnectableMixin);
    let subject = ConnectableObject.create({ audioContext });
    assert.ok(subject);
  });

  test('removeConnection removes a connection from the connections array by name', function(assert) {
    let audioContext = ContextMock.create();
    let ConnectableObject = EmberObject.extend(ConnectableMixin, {
      _initConnections() {
        // noop
      },
      wireConnections() {
        // noop
      },

      connections: A([{name: 'milo'}, {name: 'otis'}])
    });

    let subject = ConnectableObject.create({ audioContext });
    subject.removeConnection('milo');

    assert.equal(subject.get('connections')[0].name, 'otis');
    assert.equal(subject.get('connections').length, 1);
  });

  test('editing connections wires the new route before the next call', function (assert) {
    const sound = Sound.create({ audioContext: ContextMock.create() });
    const effect = Connection.create({
      name: 'meter',
      source: 'audioContext',
      createCommand: 'createAnalyser',
    });

    sound.connections.insertAt(1, effect);
    assert.ok(effect.node);
    assert.strictEqual(
      sound.getNodeFrom('audioSource').connectedObject,
      effect.node
    );
    assert.strictEqual(effect.node.connectedObject, sound.getNodeFrom('gain'));

    sound.removeConnection('meter');
    assert.strictEqual(
      sound.getNodeFrom('audioSource').connectedObject,
      sound.getNodeFrom('gain')
    );
  });

  test('a destroyed object no longer wires new connections', async function (assert) {
    const sound = Sound.create({ audioContext: ContextMock.create() });
    const connections = sound.connections;
    const late = Connection.create({
      name: 'late',
      source: 'audioContext',
      createCommand: 'createAnalyser',
    });

    // Ember 2.18 only allows destroy inside a run loop while testing.
    run(() => sound.destroy());
    await settled();
    run(() => connections.insertAt(1, late));
    await settled();

    assert.strictEqual(late.node, null);
  });

  test('Connectable _createNode method throws when connection arg is missing props', function (assert) {
    let audioContext = ContextMock.create();
    let ConnectableObject = EmberObject.extend(ConnectableMixin);
    let subject = ConnectableObject.create({ audioContext });

    assert.ok(subject._createNode);

    let createNode = () => {
      subject._createNode({
        node: false,
        createdOnPlay: false,
        path: false,
        createCommand: false,
        source: false,
        name: 'test'
      });
    };

    assert.throws(createNode);
  });
});
