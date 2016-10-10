# Binaries
BIN = node_modules/.bin
TYPESCRIPT = $(BIN)/tsc
TSLINT = $(BIN)/tslint
STYLUS = $(BIN)/stylus
BABEL = $(BIN)/babel
ROLLUP = $(BIN)/rollup
ISTANBUL = $(BIN)/istanbul
REMAP_ISTANBUL = $(BIN)/remap-istanbul
COVERALLS = $(BIN)/coveralls
CC = java -jar node_modules/google-closure-compiler/compiler.jar

# Sources
TS_SRC = src/ts
STYL_SRC = src/styl
PROD_INDEX_SRC = src/prod-index.html
TEST_INDEX_SRC = src/test-index.html
PROD_CONFIG_SRC = src/config.json
TEST_CONFIG_SRC = src/test-config.json

# Branch and commit id
ifeq ($(TRAVIS), true)
    BRANCH = $(TRAVIS_BRANCH)
    COMMIT_ID = $(TRAVIS_COMMIT)
else
    BRANCH = $(shell git symbolic-ref --short HEAD)
    COMMIT_ID = $(shell git rev-parse HEAD)
endif

# Targets
BUILD_DIR = build

.PHONY: build-dev build-release build-test build-dir build-ts build-js build-css build-static clean lint test test-coveralls watch setup

build-dev: BUILD_DIR = build/dev
build-dev: MODULE = system
build-dev: TARGET = es5
build-dev: build-dir build-static build-css build-ts
	echo "{\"url\":\"http://$(shell ifconfig |grep "inet" |fgrep -v "127.0.0.1"|grep -E -o "([0-9]{1,3}[\.]){3}[0-9]{1,3}" |grep -v -E "^0|^127" -m 1):8000/build/dev/index.html\",\"hash\":null}" > $(BUILD_DIR)/config.json
	cp src/index.html $(BUILD_DIR)/index.html

build-release: BUILD_DIR = build/release
build-release: MODULE = es2015
build-release: TARGET = es5
build-release: clean build-dir build-static build-css build-ts build-js
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
		var j=fs.readFileSync('$(BUILD_DIR)/bundle.min.js', o);\
		var i=fs.readFileSync('$(BUILD_DIR)/index.html', o);\
		fs.writeFileSync('$(BUILD_DIR)/index.html', i.replace('{COMPILED_CSS}', s).replace('{COMPILED_JS}', j), o);"

	@echo
	@echo Cleaning release build
	@echo

	rm -rf $(BUILD_DIR)/css $(BUILD_DIR)/js $(BUILD_DIR)/html $(BUILD_DIR)/xml $(BUILD_DIR)/json $(BUILD_DIR)/bundle.js $(BUILD_DIR)/bundle.min.js

	@echo
	@echo Copying release config.json to build
	@echo

	cp $(PROD_CONFIG_SRC) $(BUILD_DIR)/config.json

	@echo
	@echo Computing build details to release config
	@echo

	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var c=fs.readFileSync('$(BUILD_DIR)/config.json', o);\
		c=c.replace('{COMPILED_HASH}', '`cat $(BUILD_DIR)/index.html | openssl dgst -sha256 | sed 's/^.*= //'`');\
		c=c.replace('{BRANCH}', '$(BRANCH)');\
		c=c.replace(/{VERSION}/g, '$(COMMIT_ID)');\
		fs.writeFileSync('$(BUILD_DIR)/config.json', c, o);"

	@echo
	@echo Generating commit id based build directory
	@echo

	mkdir build/$(COMMIT_ID) | true
	rsync -r build/release build/$(COMMIT_ID)
	rm -rf build/$(COMMIT_ID)/$(COMMIT_ID)
	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var c=fs.readFileSync('build/$(COMMIT_ID)/release/config.json', o);\
		c=c.replace('$(BRANCH)', '$(BRANCH)/$(COMMIT_ID)');\
		fs.writeFileSync('build/$(COMMIT_ID)/release/config.json', c, o);"

build-test: BUILD_DIR = build/test
build-test: MODULE = system
build-test: TARGET = es5
build-test: clean build-dir build-css build-static build-ts
	@echo
	@echo Generating test runner
	@echo

	cp test-utils/runner.js $(BUILD_DIR)
	BUILD_DIR=$(BUILD_DIR) node test-utils/generate_runner.js

	@echo
	@echo Copying test index.html to build
	@echo

	cp $(TEST_INDEX_SRC) $(BUILD_DIR)/index.html

	@echo
	@echo Copying vendor libraries to build
	@echo

	mkdir -p $(BUILD_DIR)/vendor
	cp \
		node_modules/es6-promise/dist/es6-promise.js \
		node_modules/systemjs/dist/system.js \
		node_modules/mocha/mocha.js \
		node_modules/chai/chai.js \
		node_modules/sinon/pkg/sinon.js \
		node_modules/systemjs-plugin-text/text.js \
		test-utils/reporter.js \
		$(BUILD_DIR)/vendor

	@echo
	@echo Copying test config to build
	@echo

	cp $(TEST_CONFIG_SRC) $(BUILD_DIR)/config.json

	@echo
	@echo Computing build details to test config
	@echo

	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var c=fs.readFileSync('$(BUILD_DIR)/config.json', o);\
		c=c.replace('{BRANCH}', '$(BRANCH)');\
		c=c.replace(/{VERSION}/g, '$(COMMIT_ID)');\
		fs.writeFileSync('$(BUILD_DIR)/config.json', c, o);"

	@echo
	@echo Generating commit id based build directory
	@echo

	mkdir build/$(COMMIT_ID) | true
	rsync -r build/test build/$(COMMIT_ID)
	rm -rf build/$(COMMIT_ID)/$(COMMIT_ID)
	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var c=fs.readFileSync('build/$(COMMIT_ID)/test/config.json', o);\
		c=c.replace('$(BRANCH)', '$(BRANCH)/$(COMMIT_ID)');\
		fs.writeFileSync('build/$(COMMIT_ID)/test/config.json', c, o);"

build-dir:
	@echo
	@echo Creating build directory
	@echo

	mkdir -p $(BUILD_DIR)

build-ts:
	@echo
	@echo Transpiling .ts to .js
	@echo

	$(TYPESCRIPT) --project . --module $(MODULE) --target $(TARGET) --outDir $(BUILD_DIR)/js

build-js:
	@echo
	@echo Bundling .js files
	@echo

	$(ROLLUP) -c rollup.js
	$(CC) --js $(BUILD_DIR)/bundle.js --js_output_file $(BUILD_DIR)/bundle.min.js --formatting PRETTY_PRINT --assume_function_wrapper

build-css:
	@echo
	@echo Transpiling .styl to .css
	@echo

	mkdir -p $(BUILD_DIR)/css
	$(STYLUS) -o $(BUILD_DIR)/css -c --inline `find $(STYL_SRC) -name *.styl | xargs`

build-static:
	@echo
	@echo Copying static files to build
	@echo

	cp -r src/html $(BUILD_DIR)
	cp -r src/xml $(BUILD_DIR)
	cp -r src/json $(BUILD_DIR)

clean:
	@echo
	@echo Cleaning $(BUILD_DIR)
	@echo

	rm -rf $(BUILD_DIR)
	find $(TS_SRC) -type f -name *.js -or -name *.map | xargs rm -rf

lint:
	@echo
	@echo Running linter
	@echo

	$(TSLINT) -c tslint.json `find $(TS_SRC) -name *.ts | xargs`

test: MODULE = system
test: TARGET = es5
test:
	@echo
	@echo Transpiling .ts to .js for local tests
	@echo

	$(TYPESCRIPT) --project . --module $(MODULE) --target $(TARGET)

	@echo
	@echo Running local tests
	@echo

	COVERAGE_DIR=$(BUILD_DIR)/coverage node test-utils/node_runner.js
	@$(REMAP_ISTANBUL) -i $(BUILD_DIR)/coverage/coverage.json -o $(BUILD_DIR)/coverage/summary -t text-summary
	@cat $(BUILD_DIR)/coverage/summary && echo \n
	@$(REMAP_ISTANBUL) -i $(BUILD_DIR)/coverage/coverage.json -o $(BUILD_DIR)/coverage/report -t html

test-coveralls: test
	$(REMAP_ISTANBUL) -i $(BUILD_DIR)/coverage/coverage.json -o $(BUILD_DIR)/coverage/lcov.info -t lcovonly
	cat $(BUILD_DIR)/coverage/lcov.info | $(COVERALLS) --verbose

watch:
	watchman-make -p 'src/index.html' 'src/ts/**/*.ts' 'src/styl/*.styl' 'src/html/*.html' -t build-dev -p 'src/ts/Test/**/*.ts' -t test

setup: clean
	rm -rf node_modules && npm install
