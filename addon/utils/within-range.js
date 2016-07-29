/**
 * @public
 * @class utils
 */

/**
 * Ensures that a number is not less than or greater than a given min and max.
 *
 * @public
 * @method withinRange
 *
 * @param {number} value The value that should be checked/returned if within
 * given range.
 *
 * @param {number} min The minimum allowed value of the `value` param. If `value`
 * is less than this value, this value will be returned instead.
 *
 * @param {number} max The maximum allowed value of the `value` param. If `value`
 * is greater than this value, this value will be returned instead.
 */
export default function withinRange(value, min, max) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
}
