import zeroify from './zeroify';
import { base64ToUint8, mungeSoundFont } from './decode-base64';
import { arraySwap, flatten } from './array-methods';
import frequencyMap from './frequency-map';

import {
  sortNotes,
  noteSort,
  octaveShift,
  octaveSort,
  extractOctaves,
  stripDuplicateOctaves,
  createOctavesWithNotes
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
  frequencyMap
};
