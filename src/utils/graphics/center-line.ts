import { measureText } from "jimp";
import centerPosition from "./center-position";

export default async function centerLine({ text, yStart, canvasWidth, font }) {
  const lineWidth =
    (await measureText(font, text)) -
    (text.includes(" ") ? text.split(" ").length - 1 * 16 : 0);

  return {
    text,
    x: centerPosition(canvasWidth, lineWidth),
    y: yStart
  };
}
