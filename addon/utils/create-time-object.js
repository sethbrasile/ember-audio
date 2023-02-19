import zeroify from './zeroify';

/**
 * @public
 * @class utils
 */

/**
 * Value is an object containing a duration in three formats.
 * The three formats are `raw`, `string`, and `pojo`.
 *
 * Duration of 6 minutes would be output as:
 *
 *     {
 *       raw: 360, // seconds
 *       string: '06:00',
 *       pojo: {
 *         minutes: 6,
 *         seconds: 0
 *       }
 *     }
 *
 * @public
 * @method createTimeObject
 * @param {number} input A number that should be formatted
 * @param {number} minutes The number of minutes in the duration
 * @param {number} seconds The number of seconds (in addition to minutes) in the duration
 * @return {object} A POJO containing the input time in 3 forms
 */
export default function createTimeObject(raw, minutes, seconds) {
  return {
    raw,
    string: `${zeroify(minutes)}:${zeroify(seconds)}`,
    pojo: { minutes, seconds },
  };
}
