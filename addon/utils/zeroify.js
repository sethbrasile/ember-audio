export default function zeroify(input) {
  const num = Math.floor(input);

  if (num < 10) {
    return `0${num}`;
  }

  return `${num}`;
}
