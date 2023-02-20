import { A } from '@ember/array';
import { on } from '@ember/object/evented';
import EmberObject from '@ember/object';

/**
 * Allows multiple Note instances to be loaded up and played via their
 * `identifier`.
 *
 * @public
 * @class Font
 */
const Font = EmberObject.extend({
  /**
   * Acts as a register for all the notes in the font. If null on instantiation,
   * set to `A()` via `_initNotes`.
   *
   * @public
   * @property notes
   * @type {Ember.MutableArray}
   */
  notes: null,

  /**
   * Plays a note from `notes`, given it's `identifier`.
   *
   * @public
   * @method play
   *
   * @param {string} identifier The identifier for the note that should be
   * played.
   */
  play(identifier) {
    this.getNote(identifier).play();
  },

  /**
   * Gets a note from `notes`, given it's identifier.
   *
   * @public
   * @method getNote
   *
   * @param {string} identifier The identifier for the note that should be
   * returned,
   *
   * @return {Note} The specified Note instance.
   */
  getNote(identifier) {
    return this.notes.findBy('identifier', identifier);
  },

  /**
   * Sets `notes` to `A()` if null on instantiation.
   *
   * @private
   * @method _initNotes
   */
  _initNotes: on('init', function () {
    if (!this.notes) {
      this.set('notes', A());
    }
  }),
});

export default Font;
