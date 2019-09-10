const fs = require('fs');
const path = require('path');
const promisedFs = require('fs').promises;
const webfont = require("webfont").default;

const headerStyleTemplate = (fontPath, fontName, iconPrefix) => `
@font-face {
  font-family: "${fontName}";
  src: url("${fontPath}/${fontName}.ttf") format("truetype");
}

[data-icon]:before {
  content: attr(data-icon);
  font-family: "${fontName}" !important; // @stylint ignore
}

[class^="${iconPrefix}-"]:before,
[class*=" ${iconPrefix}-"]:before {
  font-family: "${fontName}" !important; // @stylint ignore
}
`;

const glyphStyleTemplate = (iconPrefix, name, unicode) => `
.${iconPrefix}-${name}:before {
  content: "\\${unicode[0].charCodeAt(0).toString(16)}";
}
`;

const createStylesheet = (stylPath, fontPath, iconSet, glyphs) => {
  const { fontName, glyphNamePrefix } = iconSet;
  const generatedFromComment = `/** GENERATED FROM ${fontPath} */`;
  const relativeFontPath = path.relative(stylPath, fontPath);
  const stylesheet = headerStyleTemplate(relativeFontPath, fontName, glyphNamePrefix);

  const glyphStyles = glyphs.map((glyph) => {
    const { name, unicode } = glyph.metadata;
    return glyphStyleTemplate(glyphNamePrefix, name, unicode);
  });

  return [generatedFromComment, stylesheet, ...glyphStyles].join('');
};

const createFont = async (iconSet, startUnicodeIndex) => {
  const result = await webfont({
    files: `${iconSet.path}/*`,
    fontName: iconSet.fontName,
    startUnicode: startUnicodeIndex,
    formats: ['ttf'],
    normalize: true,
  });

  const glyphs = result.glyphsData;

  const font = {
    ttf: result.ttf,
    glyphs: glyphs
  };

  return font;
};

const createFonts = async (iconSets, startUnicodeIndex, stylPath) => {
  let glyphTotalCount = 0;
  for (let i = 0; i < iconSets.length; i++) {
    const iconSet = iconSets[i];
    const fontPath = iconSet.path;
    const fontName = iconSet.fontName;

    const fontStartUnicodeIndex = startUnicodeIndex + glyphTotalCount;
    const fontPathOut = `${fontPath}/generated`;
    const stylPathOut = `${stylPath}/generated`;

    try {
      const font = await createFont(iconSet, fontStartUnicodeIndex);

      if (!fs.existsSync(fontPathOut)) {
        fs.mkdirSync(fontPathOut);
      }

      await promisedFs.writeFile(`${fontPathOut}/${fontName}.ttf`, font.ttf);

      const stylesheet = createStylesheet(stylPathOut, fontPathOut, iconSet, font.glyphs);
      if (!fs.existsSync(stylPathOut)) {
        fs.mkdirSync(stylPathOut);
      }

      await promisedFs.writeFile(`${stylPathOut}/${fontName}.styl`, stylesheet);

      glyphTotalCount += font.glyphs.length;
      console.log(`${fontName}: ${font.glyphs.length} glyphs`);
    } catch (err) {
      console.error(fontPath, err);
      throw err;
    }
  }

  console.log('created', glyphTotalCount, 'glyphs in total');
};

const iconSets = [
  {
    glyphNamePrefix: 'icon',
    fontName: 'unityicons',
    path: 'src/fonts/unityicons'
  }
];
const startUnicodeIndex = 0xe000;
const stylPath = 'src/styl';

createFonts(iconSets, startUnicodeIndex, stylPath);
