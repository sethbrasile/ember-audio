import EmberError from '@ember/error';
import { A } from '@ember/array';
import { on } from '@ember/object/evented';
import { observer, set, get } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { Connection } from 'ember-audio';

/**
 * A mixin that allows an object to create AudioNodes and connect them together.
 * Depends on `audioContext` being available on the consuming object.
 *
 * @public
 * @class Connectable
 * @todo figure out how to augment Ember.MutableArray so that the connections
 * array can have methods like addConnection, removeConnection, addFilter, disableNode
 */
export default Mixin.create({
  /**
   * An array of Connection instances. Determines which AudioNode instances are
   * connected to one-another and the order in which they are connected. Starts
   * as `null` but set to an array on `init` via the
   * {{#crossLink "Connectable/_initConnections:method"}}{{/crossLink}} method.
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
    return this.connections.findBy('name', name);
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
    this.connections.removeObject(this.getConnection(name));
  },

  /**
   * Updates an AudioNode's property in real time by setting the property on the
   * connectable object (which affects the next play) and also sets it on it's
   * corresponding `connection.node` (which affects the audio in real time).
   *
   * If a connection is pulling a property from a connectable object via
   * `onPlaySetAttrsOnNode[index].relativePath`, this method will update that
   * property directly on the Connection's `node` as well as on the connectable
   * object.
   *
   * Important to note that this only works for properties that are set directly
   * on a connectable object and then proxied/set on a node via
   * `onPlaySetAttrsOnNode`.
   *
   * @example
   *     // With `set`
   *     const osc = audioService.createOscillator({ frequency: 440 });
   *     osc.play(); // playing at 440Hz
   *     osc.set('frequency', 1000); // still playing at 440Hz
   *     osc.stop();
   *     osc.play(); // now playing at 1000Hz
   *
   * @example
   *     // With `update`
   *     const osc = audioService.createOscillator({ frequency: 440 });
   *     osc.play(); // playing at 440Hz
   *     osc.update('frequency', 1000); // playing at 1000Hz
   *
   * @public
   * @method update
   *
   * @param key {string} The name/path to a property on an Oscillator instance
   * that should be updated.
   *
   * @param value {string} The value that the property should be set to.
   */
  update(key, value) {
    this.connections.map((connection) => {
      connection.get('onPlaySetAttrsOnNode').map((attr) => {
        const path = get(attr, 'relativePath');

        if (key === path) {
          const pathChunks = path.split('.');
          connection.get('node')[pathChunks.pop()].value = value;
        }
      });
    });

    this.set(key, value);
  },

  /**
   * Initializes default connections on Sound instantiation. Runs `on('init')`.
   *
   * @protected
   * @method _initConnections
   */
  _initConnections: on('init', function() {
    const bufferSource = Connection.create({
      name: 'audioSource',
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
   * Observes the connections array and runs wireConnections each time it
   * changes.
   *
   * @private
   * @method _watchConnectionChanges
   */
  _watchConnectionChanges: observer('connections.[]', function() {
    this.wireConnections();
  }),

  /**
   * Gets the array of Connection instances from the connections array and
   * returns the same array, having created any AudioNode instances that needed
   * to be created, and having connected the AudioNode instances to one another
   * in the order in which they were present in the connections array.
   *
   * @protected
   * @method wireConnections
   *
   * @return {array|Connection} Array of Connection instances collected from the
   * connections array, created, connected, and ready to play.
   */
  wireConnections() {
    const createNode = this._createNode.bind(this);
    const setAttrsOnNode = this._setAttrsOnNode.bind(this);
    const wireConnection = this._wireConnection;
    const connections = this.connections;

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
      throw new EmberError(`ember-audio: The ${name} connection is not configured correctly. Please fix this connection.`);
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
   * @param {Connection} connection The Connection instance that needs it's
   * node's attrs set.
   *
   * @return {Connection} The input Connection instance after having it's nodes
   * attrs set.
   */
  _setAttrsOnNode(connection) {

    connection.get('onPlaySetAttrsOnNode').map((attr) => {
      const { attrNameOnNode, relativePath, value } = attr;
      const attrValue = relativePath && this.get(relativePath) ? this.get(relativePath) : value;

      if (connection.node && attrNameOnNode && attrValue) {
        set(connection.node, attrNameOnNode, attrValue);
      }
    });

    this._setConnectionValues(connection, 'exponentialRampToValuesAtTime');
    this._setConnectionValues(connection, 'linearRampToValuesAtTime');
    this._setConnectionValues(connection, 'setValuesAtTime');
    this._setConnectionValues(connection, 'startingValues', 'setValueAtTime');

    return connection;
  },

  /**
  * Gets a Connection instance's `onPlaySetAttrsOnNode` and sets them on it's
  * node.
  *
  * @private
  * @method _setConnectionValues
  *
  * @param {Connection} connection The Connection instance that needs it's
  * node's attrs set.
  *
  * @param {string} attr The attr that needs it's values set. By default, the
  * method called to set this attr's value is identical in name, but the word
  * "Values" is singularized. In the example, `someKey` is a key that
  * comes from `onPlaySetAttrsOnNode`.
  *
  * @example
  *   // this
  *   this._setConnectionValues(connection, 'setValuesAtTime');
  *   // ends up like
  *   connection.node.someKey.setValueAtTime(value, time);
  *
  * @param {string} optionalMethodKey Optionally specifies the method which
  * should be called to set the attr. This would override the `setValueAtTime
  * method in the example.
  */
  _setConnectionValues(connection, attr, optionalMethodKey) {
    const currentTime = this.get('audioContext.currentTime');

    connection.get(attr).map((opts) => {
      const time = currentTime + (opts.endTime || 0);
      attr = optionalMethodKey || attr.replace('Values', 'Value');
      connection.node[opts.key][attr](opts.value, time);
    });
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
