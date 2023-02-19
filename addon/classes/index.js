/**
 * Provides classes that are capable of interacting with the Web Audio API's
 * AudioContext.
 *
 * @public
 * @module Audio
 */
import Sound from './sound';
import Font from './font';
import Track from './track';
import BeatTrack from './beat-track';
import Sampler from './sampler';
import Oscillator from './oscillator';
import SampledNote from './sampled-note';
import LayeredSound from './layered-sound';

export {
  Sound,
  Track,
  BeatTrack,
  Sampler,
  Oscillator,
  SampledNote,
  LayeredSound,
  Font,
};

/**
 * Provides helper classes that represent musical concepts meant to be used by
 * classes from the Audio module.
 *
 * @public
 * @module MusicalConcepts
 */

import Note from './note';
import Beat from './beat';

export { Note, Beat };

/**
 * Provides classes that interact with the Web Audio API indirectly by providing
 * data models for the classes in the Audio module to consume.
 *
 * @public
 * @module AudioHelpers
 */

import Connection from './connection';

export { Connection };
