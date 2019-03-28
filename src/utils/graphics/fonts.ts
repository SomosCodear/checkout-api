import Jimp from "jimp";
import { resolve as resolvePath } from "path";

const BitmapFonts = {
  Title: null,
  Subtitle: null,
  TitleShadow: null,
  SubtitleShadow: null,

  async load() {
    BitmapFonts.Title = await Jimp.loadFont(
      resolvePath(__dirname, "../../assets/title.fnt")
    );

    BitmapFonts.TitleShadow = await Jimp.loadFont(
      resolvePath(__dirname, "../../assets/title-black.fnt")
    );

    BitmapFonts.Subtitle = await Jimp.loadFont(
      resolvePath(__dirname, "../../assets/subtitle.fnt")
    );

    BitmapFonts.SubtitleShadow = await Jimp.loadFont(
      resolvePath(__dirname, "../../assets/subtitle-black.fnt")
    );
  }
};

export default BitmapFonts;
