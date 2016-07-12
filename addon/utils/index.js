import zeroify from './zeroify';
import { sortNotes } from './note-methods';
import { base64ToUint8, mungeSoundFont } from './decode-base64';

import {
  arraySwap,
  flatten,
  octaveShift,
  octaveSort,
  extractOctaves,
  stripDuplicateOctaves,
  createOctavesWithNotes
} from './note-methods';

/**
 * @module utils
 */

export {
  zeroify,
  sortNotes,
  base64ToUint8,
  mungeSoundFont,
  arraySwap,
  flatten,
  octaveShift,
  octaveSort,
  extractOctaves,
  stripDuplicateOctaves,
  createOctavesWithNotes
};
