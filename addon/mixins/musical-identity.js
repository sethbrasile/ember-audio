import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { frequencyMap } from 'ember-audio/utils';

/**
 * This mixin allows an object to have an awareness of it's "musical identity"
 * or "note value" based on western musical standards (a standard piano).
 * If any of the following are provided, all of the remaining properties will be
 * calculated:
 *
 * 1. frequency
 * 2. identifier (i.e. "Ab1")
 * 3. letter, octave, and (optionally) accidental
 *
 * This mixin only makes sense when the consuming object is part of a collection,
 * as the only functionality it provides serves to facilitate identification.
 *
 * @public
 * @class MusicalIdentity
 */
export default Mixin.create({

  /**
   * For note `Ab5`, this would be `A`.
   *
   * @public
   * @property letter
   * @type {string}
   */
  letter: null,

  /**
   * For note `Ab5`, this would be `b`.
   *
   * @public
   * @property accidental
   * @type {string}
   */
  accidental: null,

  /**
   * For note `Ab5`, this would be `5`.
   *
   * @public
   * @property octave
   * @type {string}
   */
  octave: null,

  /**
   * Computed property. Value is `${letter}` or `${letter}${accidental}` if
   * accidental exists.
   *
   * @public
   * @property name
   * @type {string}
   */
  name: computed('letter', 'accidental', function() {
    const accidental = this.get('accidental');
    const letter = this.get('letter');

    if (accidental) {
      return `${letter}${accidental}`;
    } else {
      return letter;
    }
  }),

  /**
   * Computed property. The frequency of the note in hertz. Calculated by
   * comparing western musical standards (a standard piano) and the note
   * identifier (i.e. `Ab1`). If this property is set directly, all other
   * properties are updated to reflect the provided frequency.
   *
   * @public
   * @property frequency
   * @type {number}
   */
  frequency: computed('identifier', {
    get() {
      const identifier = this.get('identifier');

      if (identifier) {
        return frequencyMap[identifier];
      }
    },

    set(key, value) {
      for (let key in frequencyMap) {
        if (value === frequencyMap[key]) {
          this.set('identifier', key);
          return value;
        }
      }
    }
  }),

  /**
   * Computed property. Value is `${letter}${octave}` or
   * `${letter}${accidental}${octave}` if accidental exists. If this property
   * is set directly, all other properties are updated to reflect the provided
   * identifier.
   *
   * @public
   * @property identifier
   * @type {string}
   */
  identifier: computed('letter', 'octave', 'accidental', {
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
    },

    set(key, value) {
      const [ letter ] = value;
      const octave = value[2] || value[1];
      let accidental;

      if (value[2]) {
        accidental = value[1];
      }

      this.setProperties({ letter, octave, accidental });

      return value;
    }
  })
});
