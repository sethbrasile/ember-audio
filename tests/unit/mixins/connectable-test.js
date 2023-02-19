import { A } from '@ember/array';
import EmberObject from '@ember/object';
import ContextMock from '../../helpers/context-mock';
import ConnectableMixin from 'ember-audio/mixins/connectable';
import { module, test } from 'qunit';

module('Unit | Mixin | connectable', function () {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let audioContext = ContextMock.create();
    let ConnectableObject = EmberObject.extend(ConnectableMixin);
    let subject = ConnectableObject.create({ audioContext });
    assert.ok(subject);
  });

  test('removeConnection removes a connection from the connections array by name', function (assert) {
    let audioContext = ContextMock.create();
    let ConnectableObject = EmberObject.extend(ConnectableMixin, {
      _initConnections() {
        // noop
      },
      wireConnections() {
        // noop
      },

      connections: A([{ name: 'milo' }, { name: 'otis' }]),
    });

    let subject = ConnectableObject.create({ audioContext });
    subject.removeConnection('milo');

    assert.strictEqual(subject.get('connections')[0].name, 'otis');
    assert.strictEqual(subject.get('connections').length, 1);
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
        name: 'test',
      });
    };

    assert.throws(createNode);
  });
});
