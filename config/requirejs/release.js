({
  name: 'Main',
  baseUrl: '../../build/js/',
  paths: {
    text: '../../node_modules/requirejs-text/text',
    html: '../../src/html'
  },
  config: {
    text: {
      useXhr: function() {
        return true;
      }
    }
  },
  out: '../../build/main.js',
  optimize: 'uglify2',
  uglify2: {
    output: {
      beautify: true,
      indent_level: 2
    },
    warnings: true
  },
  preserveLicenseComments: true,
  onModuleBundleComplete: function (data) {
    var fs = module.require('fs'),
      amdclean = module.require('amdclean'),
      outputFile = data.path,
      cleanedCode = amdclean.clean({
        'filePath': outputFile,
        'removeModules': ['text']
      });
    fs.writeFileSync(outputFile, cleanedCode);
  }
})