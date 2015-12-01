# Binaries
TYPESCRIPT = tsc
TSLINT = tslint
BABEL = babel
REQUIREJS = node_modules/.bin/r.js
STYLUS = node_modules/.bin/stylus

MOCHA = node_modules/.bin/_mocha
ISTANBUL = node_modules/.bin/istanbul

# Sources
TS_SRC = src/ts
STYL_SRC = src/styl
PROD_INDEX_SRC = src/prod-index.html
TEST_INDEX_SRC = src/test-index.html
PROD_CONFIG_SRC = src/config.json
TEST_CONFIG_SRC = src/test-config.json
TEST_SRC = test

# Targets
BUILD_DIR = build

.PHONY: build build-ts build-js build-css build-html clean lint test

build: clean build-ts build-js build-css build-html
	@echo Copying production index.html to build
	cp $(PROD_INDEX_SRC) $(BUILD_DIR)/index.html

	@echo Inlining CSS and JS
	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var s=fs.readFileSync('$(BUILD_DIR)/css/main.css', o);\
		var j=fs.readFileSync('$(BUILD_DIR)/main.js', o);\
		var i=fs.readFileSync('$(BUILD_DIR)/index.html', o);\
		fs.writeFileSync('$(BUILD_DIR)/index.html', i.replace('{COMPILED_CSS}', s).replace('{COMPILED_JS}', j), o);"

	@echo Copying production config.json to build
	cp $(PROD_CONFIG_SRC) $(BUILD_DIR)/config.json

	@echo Calculating build hash to production config
	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var c=fs.readFileSync('$(BUILD_DIR)/config.json', o);\
		fs.writeFileSync('$(BUILD_DIR)/config.json', c.replace('{COMPILED_HASH}', '`cat $(BUILD_DIR)/index.html | openssl dgst -sha256 | sed 's/^.*= //'`'), o);"

	@echo Copying test index.html to build
	cp $(TEST_INDEX_SRC) build/test-index.html

	@echo Copying vendor libraries to build
	mkdir -p build/js/vendor
	cp node_modules/requirejs/require.js node_modules/mocha/mocha.js node_modules/chai/chai.js node_modules/sinon/pkg/sinon.js node_modules/requirejs-text/text.js test-utils/reporter.js build/js/vendor/

	@echo Copying test config to build
	cp $(TEST_CONFIG_SRC) build/test-config.json

	@echo Transpiling test files
	$(TYPESCRIPT) --project test --module amd --outDir build/js --rootDir .
	BABEL_ENV=production $(BABEL) -d build/js/test build/js/test

	@echo Generating test runner
	cp test-utils/runner.js build
	node -e "\
		var fs = require('fs');\
		var testList = JSON.stringify(fs.readdirSync('test').filter(function(file) { return file.indexOf('Test.ts') !== -1; }).map(function(file) { return 'test/' + file.replace('.ts', ''); }));\
		var o = {encoding:'utf-8'};\
		var f = fs.readFileSync('build/runner.js', o);\
		fs.writeFileSync('$(BUILD_DIR)/runner.js', f.replace('{TEST_LIST}', testList), o);"

build-ts:
	@echo Compiling .ts to .js
	$(TYPESCRIPT) --project . --rootDir src/ts --outDir build/js

build-js:
	@echo Bundling .js files
	BABEL_ENV=production $(BABEL) -d build/js build/js
	$(REQUIREJS) -o config/requirejs/release.js

build-css:
	@echo Compiling .styl to .css
	mkdir -p $(BUILD_DIR)/css
	$(STYLUS) -o $(BUILD_DIR)/css -c --inline `find $(STYL_SRC) -name *.styl | xargs`

build-html:
	@echo Copying .html to build
	cp -r src/html $(BUILD_DIR)

clean:
	rm -rf build/*
	find $(TS_SRC) -type f -name *.js -or -name *.map | xargs rm -rf
	find $(TEST_SRC) -type f -name *.js -or -name *.map | xargs rm -rf

lint:
	$(TSLINT) -c tslint.json `find $(TS_SRC) -name *.ts | xargs`

test: clean
	$(TYPESCRIPT) --project . --rootDir $(TS_SRC) --moduleResolution classic
	$(TYPESCRIPT) --project test --moduleResolution classic
	BABEL_ENV=test $(BABEL) -d $(TS_SRC) $(TS_SRC)
	BABEL_ENV=test $(BABEL) -d test test
	NODE_PATH=src/ts $(ISTANBUL) cover --root $(TS_SRC) --include-all-sources -dir coverage $(MOCHA)
