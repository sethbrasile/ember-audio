import Ember from 'ember';
import { Connection } from 'ember-audio';

/**
 * Provides classes that are capable of interacting with the Web Audio API's
 * AudioContext.
 *
 * @public
 * @module Audio
 */

const {
  A,
  on,
  get,
  set,
  observer,
  Mixin
} = Ember;

/**
 * A mixin that allows an object to create AudioNodes and connect them together.
 * Depends on `audioContext` being available on the consuming object.
 *
 * @public
 * @class Connectable
 */
export default Mixin.create({
  /**
   * An array of Connection instances. Determines which AudioNode instances are
   * connected to one-another and the order in which they are connected. Starts
   * as `null` but set to an array on `init` via the
   * {{#crossLink "Connectable/initConnections:method"}} initConnections{{/crossLink}}
   * method.
   *
   * @public
   * @property connections
   * @type {Ember.MutableArray}
   */
  connections: null,

  /**
   * returns a connection's AudioNode from the connections array by the
   * connection's `name`.
   *
   * @public
   * @method getNodeFrom
   *
   * @param {string} name The name of the AudioNode that should be returned.
   *
   * @return {AudioNode} The requested AudioNode.
   */
  getNodeFrom(name) {
    const connection = this.getConnection(name);

    if (connection) {
      return get(connection, 'node');
    }
  },

  /**
   * returns a connection from the connections array by it's name
   *
   * @public
   * @method getConnection
   *
   * @param {string} name The name of the AudioNode that should be returned.
   *
   * @return {Connection} The requested Connection.
   */
  getConnection(name) {
    return this.get('connections').findBy('name', name);
  },

  /**
   * Find's a connection in the connections array by it's `name` and removes it.
   *
   * @param {string} name The name of the connection that should be removed.
   *
   * @public
   * @method removeConnection
   */
  removeConnection(name) {
    this.get('connections').removeObject(this.getConnection(name));
  },

  /**
   * Initializes default connections on Sound instantiation. Runs `on('init')`.
   *
   * @protected
   * @method _initConnections
   */
  _initConnections: on('init', function() {
    const bufferSource = Connection.create({
      name: 'bufferSource',
      createdOnPlay: true,
      source: 'audioContext',
      createCommand: 'createBufferSource',
      onPlaySetAttrsOnNode: [
        {
          attrNameOnNode: 'buffer',
          relativePath: 'audioBuffer'
        }
      ]
    });

    const gain = Connection.create({
      name: 'gain',
      source: 'audioContext',
      createCommand: 'createGain'
    });

    const panner = Connection.create({
      name: 'panner',
      source: 'audioContext',
      createCommand: 'createStereoPanner'
    });

    const destination = Connection.create({
      name: 'destination',
      path: 'audioContext.destination'
    });

    this.set('connections', A([ bufferSource, gain, panner, destination ]));
  }),

  /*
  * Note about _watchConnectionChanges:
  * Yeah yeah yeah.. observers are bad. Making the connections array a computed
  * property doesn't work very well because complete control over when it
  * recalculates is needed.
  */

  /**
   * Observes the connections array and runs _wireConnections each time it
   * changes.
   *
   * @private
   * @method _watchConnectionChanges
   */
  _watchConnectionChanges: observer('connections.[]', function() {
    this._wireConnections();
  }),

  /**
   * Gets the array of Connection instances from the connections array and
   * returns the same array, having created any AudioNode instances that needed
   * to be created, and having connected the AudioNode instances to one another
   * in the order in which they were present in the connections array.
   *
   * @private
   * @method _wireConnections
   *
   * @return {array|Connection} Array of Connection instances collected from the
   * connections array, created, connected, and ready to play.
   */
  _wireConnections() {
    const createNode = this._createNode.bind(this);
    const setAttrsOnNode = this._setAttrsOnNode.bind(this);
    const wireConnection = this._wireConnection;
    const connections = this.get('connections');

    connections.map(createNode).map(setAttrsOnNode).map(wireConnection);
  },

  /**
   * Creates an AudioNode instance for a Connection instance and sets it on it's
   * `node` property. Unless the Connection instance's `createdOnPlay` property
   * is true, does nothing if the AudioNode instance has already been created.
   *
   * Also sets any properties from a connection's `onPlaySetAttrsOnNode` array
   * on the node.
   *
   * @private
   * @method _createNode
   *
   * @param {Connection} connection A Connection instance that should have it's
   * node created (if needed).
   *
   * @return {Connection} The input Connection instance after having it's node
   * created.
   */
  _createNode(connection) {
    const { path, name, createdOnPlay, source, createCommand, node } = connection;

    if (node && !createdOnPlay) {
      // The node is already created and doesn't need to be created again
      return connection;
    } else if (path) {
      connection.node = this.get(path);
    } else if (createCommand && source) {
      connection.node = this.get(source)[createCommand]();
    } else if (!connection.node) {
      console.error('ember-audio:', `The ${name} connection is not configured correctly. Please fix this connection.`);
      return;
    }

    return connection;
  },

  /**
   * Gets a Connection instance's `onPlaySetAttrsOnNode` and sets them on it's
   * node.
   *
   * @private
   * @method _setAttrsOnNode
   *
   * @param {Connection} The Connection instance that needs it's node's attrs
   * set.
   *
   * @return {Connection} The input Connection instance after having it's nodes
   * attrs set.
   */
  _setAttrsOnNode(connection) {
    connection.get('onPlaySetAttrsOnNode').map((attr) => {
      const { attrNameOnNode, relativePath, value } = attr;
      const attrValue = relativePath ? this.get(relativePath) || value : value;

      if (connection.node && attrNameOnNode && attrValue) {
        set(connection.node, attrNameOnNode, attrValue);
      }
    });

    return connection;
  },

  /**
   * Meant to be passed to a Array.prototype.map function. Connects a Connection
   * instance's node to the next Connection instance's node.
   *
   * @private
   * @method _wireConnection
   *
   * @param {Connection} connection The current Connection instance in the
   * iteration.
   *
   * @param {number} idx The index of the current iteration.
   *
   * @param {array|Connection} connections The original array of connections.
   *
   * @return {Connection} The input Connection instance after having it's node
   * connected to the next Connection instance's node.
   */
  _wireConnection(connection, idx, connections) {
    const nextIdx = idx + 1;
    const currentNode = connection;

    if (nextIdx < connections.length) {
      const nextNode = connections[nextIdx];

      // Assign nextConnection back to connections array.
      // Since we're working one step ahead, we don't want
      // each connection created twice
      connections[nextIdx] = nextNode;

      // Make the connection from current to next
      currentNode.node.connect(nextNode.node);
    }

    return currentNode;
  }
});
