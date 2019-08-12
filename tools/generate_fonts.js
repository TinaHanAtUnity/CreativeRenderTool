const fs = require('fs');
const promisedFs = require('fs').promises;
const webfont = require("webfont").default;

const headerStyleTemplate = (fontPath, fontName) => `
@font-face {
  font-family: "${fontName}";
  src: url("../fonts/${fontName}.ttf") format("truetype");
}

[data-icon]:before {
  content: attr(data-icon);
  font-family: "${fontName}" !important; // @stylint ignore
}

[class^="${fontName}-icon-"]:before,
[class*=" ${fontName}-icon-"]:before {
  font-family: "${fontName}" !important; // @stylint ignore
}
`;

const glyphStyleTemplate = (fontName, name, unicode) => `
.${fontName}-icon-${name}:before {
  content: "\\${unicode[0].charCodeAt(0).toString(16)}";
}
`;

const createStylesheet = (fontPath, fontName, glyphs) => {
  const generatedFromComment = `/** GENERATED FROM ${fontPath} */`;
  const stylesheet = headerStyleTemplate(fontPath, fontName);

  const glyphStyles = [];
  glyphs.forEach((glyph) => {
    const { name, unicode } = glyph.metadata;
    const glyphStyle = glyphStyleTemplate(fontName, name, unicode);
    glyphStyles.push(glyphStyle);
  });

  return [generatedFromComment, stylesheet, ...glyphStyles].join('');
};

const createFont = async (path, fontName, startUnicodeIndex) => {
  const result = await webfont({
    files: `${path}/*`,
    fontName: fontName,
    startUnicode: startUnicodeIndex,
    formats: ['svg', 'ttf', 'woff'],
    normalize: true,
  });

  const glyphs = result.glyphsData;
  const glyphsCount = glyphs.length;
  const stylesheet = createStylesheet(path, fontName, glyphs);

  if (!fs.existsSync(`${path}/generated`)) {
    fs.mkdirSync(`${path}/generated`);
  }

  await promisedFs.writeFile(`${path}/generated/${fontName}.svg`, result.svg);
  await promisedFs.writeFile(`${path}/generated/${fontName}.ttf`, result.ttf);
  await promisedFs.writeFile(`${path}/generated/${fontName}.woff`, result.woff);

  // in this experiment, let's save the .styl into the same folder with generated fonts
  // and copy the content of .styl manually into existing icon .styl files, e.g., icons.styl
  await promisedFs.writeFile(`${path}/generated/${fontName}.styl`, stylesheet);

  return glyphsCount;
};

const createFonts = async (path, startUnicodeIndex) => {
  const dirNames = fs.readdirSync(path)
                     .filter((fileName) => fs.lstatSync(`${path}/${fileName}`).isDirectory());

  let glyphTotalCount = 0;

  for (let i = 0; i < dirNames.length; i++) {
    const dirName = dirNames[i];

    const fontPath = `${path}/${dirName}`;
    const fontName = dirName;
    const fontStartUnicodeIndex = startUnicodeIndex + glyphTotalCount;

    try {
      const glyphCount = await createFont(fontPath, fontName, fontStartUnicodeIndex);
      glyphTotalCount += glyphCount;
    } catch (err) {
      console.error(fontPath, err);
      throw err;
    }
  }

  console.log('created', glyphTotalCount, 'glyphs');
};

const fontPath = 'src/fonts/experiment';
const startUnicodeIndex = 0xe000;
createFonts(fontPath, startUnicodeIndex);
