import Sound from './sound';
import { MusicalIdentity } from 'ember-audio/mixins';

/**
 * Provides helper classes that represent musical concepts meant to be used by
 * classes from the Audio module.
 *
 * @public
 * @module MusicalConcepts
 */

/**
 * Represents a musical note, created from sampled audio.
 * When a soundfont is created via the
 * {{#crossLink "Audio"}}Audio Service{{/crossLink}}, an instance of this class
 * is created for every musical note that is represented in a soundfont. This
 * class can be used for any collection of Sound instances where each instance
 * needs an awareness of what "musical note" it is (i.e. octave, accidental, etc..).
 *
 * This class only makes sense when used in the context of a collection, as the
 * only functionality it provides over a
 * {{#crossLink "Sound"}}Sound{{/crossLink}}, serves to facilitate identification.
 *
 * @public
 * @class SampledNote
 * @extends Sound
 * @uses MusicalIdentity
 */
const SampledNote = Sound.extend(MusicalIdentity);

export default SampledNote;
