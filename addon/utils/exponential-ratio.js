export default function exponentialRatio(value) {
  const ratio = (Math.exp(value) - 1) / (Math.E - 1);

  if (ratio < 0) {
    return 0;
  } else if (ratio > 1) {
    return 1;
  } else {
    return ratio;
  }
}
