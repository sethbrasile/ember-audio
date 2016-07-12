import Ember from 'ember';
import Sound from './sound';

/**
 * The Note class provides identification-focused functionality for collections
 * of musical notes.
 *
 * @module Musical-Concepts
 * @submodule Note
 */

const {
  computed
} = Ember;

/**
 * A class that represents a musical note. When a soundfont is created via the
 * {@link module:addon/services/audio Audio Service}, an instance of this class
 * is created for every musical note that is represented in the soundfont. This
 * class can be used for any collection of Sound instances where each instance
 * needs an awareness of what "musical note" it is (i.e. octave, accidental, etc..).
 *
 * This class only makes sense when used in the context of a collection, as the
 * only functionality it provides over a
 * {{#crossLink "Sound"}}Sound{{/crossLink}}, serves to facilitate identification.
 *
 * @class Note
 * @extends Sound
 */
const Note = Sound.extend({

  /**
   * For note `Ab5`, this would be `A`. Value should be set on instantiation.
   *
   * @property letter
   * @type {string}
   */
  letter: null,

  /**
   * For note `Ab5`, this would be `b`. Value should be set on instantiation.
   *
   * @property accidental
   * @type {string}
   */
  accidental: null,

  /**
   * For note `Ab5`, this would be `5`. Value should be set on instantiation.
   *
   * @property octave
   * @type {string}
   */
  octave: null,

  /**
   * Computed property. Value is `${letter}${octave}` or
   * `${letter}${accidental}${octave}` if accidental exists.
   *
   * @property identifier
   * @type {string}
   */
  identifier: computed('letter', 'accidental', 'octave', {
    get() {
      const accidental = this.get('accidental');
      const letter = this.get('letter');
      const octave = this.get('octave');
      let output;

      if (accidental) {
        output = `${letter}${accidental}${octave}`;
      } else {
        output = `${letter}${octave}`;
      }

      return output;
    }
  }),

  /**
   * Computed property. Value is `${letter}` or `${letter}${accidental}` if
   * accidental exists.
   *
   * @override
   * @property name
   * @type {string}
   */
  name: computed('letter', 'accidental', {
    get() {
      const accidental = this.get('accidental');
      const letter = this.get('letter');
      let output;

      if (accidental) {
        output = `${letter}${accidental}`;
      } else {
        output = `${letter}`;
      }

      return output;
    }
  })
});

export default Note;
