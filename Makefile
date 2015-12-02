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

.PHONY: build-release build-test build-dirs build-ts build-js build-css build-html clean lint test

build-release: BUILD_DIR = build/release
build-release: clean build-dirs build-ts build-js build-css
	@echo
	@echo Copying release index.html to build
	@echo

	cp $(PROD_INDEX_SRC) $(BUILD_DIR)/index.html

	@echo
	@echo Inlining CSS and JS
	@echo

	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var s=fs.readFileSync('$(BUILD_DIR)/css/main.css', o);\
		var j=fs.readFileSync('$(BUILD_DIR)/main.js', o);\
		var i=fs.readFileSync('$(BUILD_DIR)/index.html', o);\
		fs.writeFileSync('$(BUILD_DIR)/index.html', i.replace('{COMPILED_CSS}', s).replace('{COMPILED_JS}', j), o);"

	@echo
	@echo Cleaning release build
	@echo

	rm -rf $(BUILD_DIR)/css $(BUILD_DIR)/js $(BUILD_DIR)/main.js

	@echo
	@echo Copying release config.json to build
	@echo

	cp $(PROD_CONFIG_SRC) $(BUILD_DIR)/config.json

	@echo
	@echo Calculating build hash to release config
	@echo

	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var c=fs.readFileSync('$(BUILD_DIR)/config.json', o);\
		fs.writeFileSync('$(BUILD_DIR)/config.json', c.replace('{COMPILED_HASH}', '`cat $(BUILD_DIR)/index.html | openssl dgst -sha256 | sed 's/^.*= //'`'), o);"

build-test: BUILD_DIR = build/test
build-test: clean build-dirs build-css build-html
	@echo
	@echo Transpiling .ts to .js for remote tests
	@echo

	$(TYPESCRIPT) --project test --module amd --outDir $(BUILD_DIR)
	$(BABEL) -d $(BUILD_DIR) $(BUILD_DIR)

	@echo
	@echo Generating test runner
	@echo

	cp test-utils/runner.js $(BUILD_DIR)
	node -e "\
		var fs = require('fs');\
		var testList = JSON.stringify(fs.readdirSync('test').filter(function(file) { return file.indexOf('Test.ts') !== -1; }).map(function(file) { return 'test/' + file.replace('.ts', ''); }));\
		var o = {encoding:'utf-8'};\
		var f = fs.readFileSync('$(BUILD_DIR)/runner.js', o);\
		fs.writeFileSync('$(BUILD_DIR)/runner.js', f.replace('{TEST_LIST}', testList), o);"

	@echo
	@echo Copying test index.html to build
	@echo

	cp $(TEST_INDEX_SRC) $(BUILD_DIR)/index.html

	@echo
	@echo Copying vendor libraries to build
	@echo

	mkdir -p $(BUILD_DIR)/vendor
	cp \
		node_modules/requirejs/require.js \
		node_modules/mocha/mocha.js \
		node_modules/chai/chai.js \
		node_modules/sinon/pkg/sinon.js \
		node_modules/requirejs-text/text.js \
		test-utils/reporter.js \
		$(BUILD_DIR)/vendor

	@echo
	@echo Copying test config to build
	@echo

	cp $(TEST_CONFIG_SRC) $(BUILD_DIR)/config.json

build-dir:
	@echo
	@echo Creating build directory
	@echo

	mkdir -p $(BUILD_DIR)

build-ts:
	@echo
	@echo Transpiling .ts to .js
	@echo

	$(TYPESCRIPT) --rootDir src/ts --outDir $(BUILD_DIR)/js
	$(BABEL) -d $(BUILD_DIR)/js $(BUILD_DIR)/js

build-js:
	@echo
	@echo Bundling .js files
	@echo

	$(REQUIREJS) -o config/requirejs/release.js

build-css:
	@echo
	@echo Transpiling .styl to .css
	@echo

	mkdir -p $(BUILD_DIR)/css
	$(STYLUS) -o $(BUILD_DIR)/css -c --inline `find $(STYL_SRC) -name *.styl | xargs`

build-html:
	@echo
	@echo Copying templates to build
	@echo

	cp -r src/html $(BUILD_DIR)

clean:
	@echo
	@echo Cleaning $(BUILD_DIR)
	@echo

	rm -rf $(BUILD_DIR)
	find $(TS_SRC) -type f -name *.js -or -name *.map | xargs rm -rf
	find $(TEST_SRC) -type f -name *.js -or -name *.map | xargs rm -rf

lint:
	@echo
	@echo Running linter
	@echo

	$(TSLINT) -c tslint.json `find $(TS_SRC) -name *.ts | xargs`
	$(TSLINT) -c tslint.json `find test -name *.ts | xargs`

test:
	@echo
	@echo Transpiling .ts to .js for local tests
	@echo

	$(TYPESCRIPT) --project test --moduleResolution classic
	$(BABEL) -d $(TS_SRC) $(TS_SRC)
	$(BABEL) -d test test

	@echo
	@echo Running local tests with coverage
	@echo

	NODE_PATH=src/ts $(ISTANBUL) cover --root $(TS_SRC) --include-all-sources -dir $(BUILD_DIR)/coverage $(MOCHA)
