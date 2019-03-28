import { measureText } from "jimp";
import centerPosition from "./center-position";

export default async function wordWrap({
  text,
  xBoundary,
  yStart,
  canvasWidth,
  lineHeight,
  font
}: {
  text: string;
  xBoundary: number;
  yStart: number;
  canvasWidth: number;
  lineHeight: number;
  font: any;
}) {
  const lines = [];
  let chars = text.split("");
  let line = "";

  while (chars.length > 0) {
    line += chars.shift();
    let lineWidth = await measureText(font, line);
    if (lineWidth >= xBoundary || chars.length === 0) {
      let lastCharIndex = line.lastIndexOf(" ");

      if (lastCharIndex < 0) {
        lastCharIndex = line.length;
      } else {
        chars = [...line.substr(lastCharIndex).trim(), ...chars];
        line = line.substr(0, lastCharIndex).trim();
      }

      lineWidth =
        (await measureText(font, line)) -
        (line.includes(" ") ? line.split(" ").length - 1 * 16 : 0);

      lines.push({
        text: line.substr(0, lastCharIndex),
        x: centerPosition(canvasWidth, lineWidth),
        y: yStart + lineHeight * lines.length
      });

      line = "";
    }
  }

  return lines;
}
