import withinRange from './within-range';

export default function exponentialRatio(value) {
  const ratio = (Math.exp(value) - 1) / (Math.E - 1);
  return withinRange(ratio, 0, 1);
}
