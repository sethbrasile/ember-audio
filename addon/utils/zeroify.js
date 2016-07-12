/**
 * @module utils
 * @submodule zeroify
 */

 /**
  * Formats a number and converts to string: 6 becomes '06'
  *
  * @function zeroify
  * @param {number} input A number that should be formatted
  * @returns {string} The number formatted and converted to string
  */
export default function zeroify(input) {
  const num = Math.floor(input);

  if (num < 10) {
    return `0${num}`;
  }

  return `${num}`;
}
