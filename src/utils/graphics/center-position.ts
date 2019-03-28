export default function centerPosition(
  containerSize: number,
  elementSize: number
) {
  return Math.floor(containerSize / 2 - elementSize / 2);
}
