export default function zeroify(input) {
  if (input < 10) {
    return `0${input}`;
  }

  return `${input}`;
}
