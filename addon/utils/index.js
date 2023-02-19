import zeroify from './zeroify';
import { base64ToUint8, mungeSoundFont } from './decode-base64';
import { arraySwap, flatten } from './array-methods';
import frequencyMap from './frequency-map';
import exponentialRatio from './exponential-ratio';
import withinRange from './within-range';
import createTimeObject from './create-time-object';

import {
  sortNotes,
  noteSort,
  octaveShift,
  octaveSort,
  extractOctaves,
  stripDuplicateOctaves,
  createOctavesWithNotes,
} from './note-methods';

/**
 * @public
 * @module utils
 */

export {
  zeroify,
  sortNotes,
  noteSort,
  base64ToUint8,
  mungeSoundFont,
  arraySwap,
  flatten,
  octaveShift,
  octaveSort,
  extractOctaves,
  stripDuplicateOctaves,
  createOctavesWithNotes,
  frequencyMap,
  exponentialRatio,
  withinRange,
  createTimeObject,
};
