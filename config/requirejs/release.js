({
  name: 'Main',
  baseUrl: '../../build/js/',
  paths: {
    'babel-runtime/regenerator': '../../node_modules/babel-runtime/regenerator/runtime',
    'babel-runtime/core-js': '../../node_modules/babel-runtime/core-js',
    'babel-runtime/helpers': '../../node_modules/babel-runtime/helpers',
    'core-js/library/fn/symbol': '../../node_modules/core-js/library/fn/symbol/index',
    'core-js': '../../node_modules/core-js',
    text: '../../node_modules/requirejs-text/text',
    html: '../../src/html'
  },
  cjsTranslate: true,
  findNestedDependencies: true,
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