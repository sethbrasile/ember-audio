import Ember from 'ember';
import Sound from './sound';

const {
  computed
} = Ember;

/**
 * A class that represents a musical note. When a soundfont is created via the
 * {@link module:Audio-Service Audio Service}, an instance of this class is
 * created for every musical note that is represented in the soundfont. This
 * class can be used for any collection of Sound instances where each instance
 * needs an awareness of what "musical note" it is (i.e. octave, accidental, etc..).
 *
 * <style>
 *   .ignore-this--this-is-here-to-hide-constructor,
 *   #Note { display: none; }
 * </style>
 *
 * @class Note
 * @extends Sound
 */
export const Note = Sound.extend({
  letter: null,
  accidental: null,
  octave: null,

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
