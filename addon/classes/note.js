import Ember from 'ember';
import Sound from './sound';

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
 * only functionality it provides, serves to facilitate identification.
 *
 * <style>
 *   .ignore-this--this-is-here-to-hide-constructor,
 *   #Note { display: none; }
 * </style>
 *
 * @class Note
 * @extends Sound
 *
 * @property letter {string} For note `Ab5`, this would be `A`.
 * @property accidental {string} For note `Ab5`, this would be `b`.
 * @property octave {string} For note `Ab5`, this would be `5`.
 * @property identifier {string} See {@link Note#identifier}.
 * @property name {string} See {@link Note#name}.
 */
export const Note = Sound.extend({

  /**
   * For note `Ab5`, this would be `A`.
   *
   * @memberof Note
   * @instance
   * @type {string}
   */
  letter: null,

  /**
   * For note `Ab5`, this would be `b`.
   *
   * @memberof Note
   * @instance
   * @type {string}
   */
  accidental: null,

  /**
   * For note `Ab5`, this would be `5`.
   *
   * @memberof Note
   * @instance
   * @type {string}
   */
  octave: null,

  /**
   * Computed property. Value is `${letter}${octave}` or
   * `${letter}${accidental}${octave}`if accidental exists.
   *
   * @observes {@link Note#letter}, {@link Note#accidental}, {@link Note#octave}
   *
   * @memberof Note
   * @type {string}
   * @instance
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
   * @observes {@link Note#letter}, {@link Note#accidental}
   *
   * @override
   * @memberof Note
   * @type {string}
   * @instance
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
