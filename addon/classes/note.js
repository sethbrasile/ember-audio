import Ember from 'ember';
import { MusicalIdentity } from 'ember-audio/mixins';

/**
 * Provides helper classes that represent musical concepts meant to be used by
 * classes from the Audio module.
 *
 * @public
 * @module MusicalConcepts
 */

const {
  Object: EmberObject
} = Ember;

/**
 * A class that represents a musical note, but does not carry any audio data.
 *
 * This class only makes sense when used in the context of a collection, as the
 * only functionality it provides serves to facilitate identification.
 *
 * @public
 * @class Note
 * @uses MusicalIdentity
 */
const Note = EmberObject.extend(MusicalIdentity);

export default Note;
