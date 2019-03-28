import Jimp from "jimp";

export async function textLinesWithShadow({
  image,
  lines,
  textFont,
  shadowFont,
  shadowDistance = -2
}: {
  image: Jimp;
  lines: Array<{ text: string; x: number; y: number }>;
  textFont: any;
  shadowFont: any;
  shadowDistance?: number;
}) {
  await Promise.all(
    [
      { font: shadowFont, offset: 0 },
      { font: textFont, offset: shadowDistance }
    ].map(async ({ font, offset }) =>
      Promise.all(
        lines.map(async (line: { text: string; x: number; y: number }) =>
          image.print(font, line.x + offset, line.y + offset, line.text)
        )
      )
    )
  );
}

export async function textLineWithShadow({
  image,
  line,
  textFont,
  shadowFont,
  shadowDistance = -2
}: {
  image: Jimp;
  line: { text: string; x: number; y: number };
  textFont: any;
  shadowFont: any;
  shadowDistance?: number;
}) {
  await textLinesWithShadow({
    image,
    textFont,
    shadowFont,
    shadowDistance,
    lines: [line]
  });
}
