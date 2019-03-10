export default function get(from: object, path: string) {
  const props = path.split(".");
  let value = from[props.shift()];

  while (props.length) {
    const key = props.shift();
    value = value[key];
    if (!value) {
      break;
    }
  }

  return value;
}
