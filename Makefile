# Binaries
TYPESCRIPT = tsc
TSLINT = tslint
REQUIREJS = node_modules/.bin/r.js
STYLUS = node_modules/.bin/stylus
BABEL = node_modules/.bin/babel

MOCHA = node_modules/.bin/_mocha
ISTANBUL = node_modules/.bin/istanbul
REMAP_ISTANBUL = node_modules/.bin/remap-istanbul
COVERALLS = node_modules/coveralls/bin/coveralls.js

# Sources
TS_SRC = src/ts
STYL_SRC = src/styl
PROD_INDEX_SRC = src/prod-index.html
TEST_INDEX_SRC = src/test-index.html
PROD_CONFIG_SRC = src/config.json
TEST_CONFIG_SRC = src/test-config.json
TEST_SRC = test

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

.PHONY: build-release build-test build-dirs build-ts build-js build-css build-html clean lint test

build-dev: BUILD_DIR = build/dev
build-dev: build-ts build-css build-html
	echo "{\"url\":\"http://$(shell ifconfig |grep "inet" |fgrep -v "127.0.0.1"|grep -E -o "([0-9]{1,3}[\.]){3}[0-9]{1,3}" |grep -v -E "^0|^127" -m 1):8000/build/dev/index.html\",\"hash\":null}" > $(BUILD_DIR)/config.json
	cp src/index.html $(BUILD_DIR)/index.html

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
	@echo Computing build details to release config
	@echo

	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var c=fs.readFileSync('$(BUILD_DIR)/config.json', o);\
		c=c.replace('{COMPILED_HASH}', '`cat $(BUILD_DIR)/index.html | openssl dgst -sha256 | sed 's/^.*= //'`');\
		c=c.replace('{BRANCH}', '$(BRANCH)');\
		c=c.replace('{VERSION}', '$(COMMIT_ID)');\
		fs.writeFileSync('$(BUILD_DIR)/config.json', c, o);"

	@echo
	@echo Generating commit id based build directory
	@echo

	mkdir $(BUILD_DIR)/$(COMMIT_ID)
	rsync -r $(BUILD_DIR)/* $(BUILD_DIR)/$(COMMIT_ID)
	rm -rf $(BUILD_DIR)/$(COMMIT_ID)/$(COMMIT_ID)

build-test: BUILD_DIR = build/test
build-test: clean build-dirs build-css build-html
	@echo
	@echo Transpiling .ts to .js for remote tests
	@echo

	$(TYPESCRIPT) --project test --module amd --outDir $(BUILD_DIR)

	@echo
	@echo Generating test runner
	@echo

	cp test-utils/runner.js $(BUILD_DIR)
	node -e "\
		var fs = require('fs');\
		var path = require('path');\
		var getTestPaths = function(root) {\
		    var paths = [];\
            fs.readdirSync(root).forEach(function(file) {\
                var fullPath = path.join(root, file);\
                if(fs.statSync(fullPath).isDirectory()) {\
                    paths = paths.concat(getTestPaths(fullPath));\
                } else if(fullPath.indexOf('Test.ts') !== -1) {\
                    paths.push(fullPath.replace('.ts', ''));\
                }\
            });\
            return paths;\
        };\
		var testList = JSON.stringify(getTestPaths('test'));\
        console.log(testList);\
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
		node_modules/es6-promise/dist/es6-promise.js \
		node_modules/requirejs/require.js \
		node_modules/mocha/mocha.js \
		node_modules/chai/chai.js \
		node_modules/sinon/pkg/sinon.js \
		node_modules/requirejs-text/text.js \
		test-utils/reporter.js \
		$(BUILD_DIR)/vendor

	@echo
	@echo Running through babel for ES3 compatibility
	@echo

	$(BABEL) $(BUILD_DIR) -d $(BUILD_DIR)

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
		c=c.replace('{VERSION}', '$(COMMIT_ID)');\
		fs.writeFileSync('$(BUILD_DIR)/config.json', c, o);"

	@echo
	@echo Generating commit id based build directory
	@echo

	mkdir $(BUILD_DIR)/$(COMMIT_ID)
	rsync -r $(BUILD_DIR)/* $(BUILD_DIR)/$(COMMIT_ID)
	rm -rf $(BUILD_DIR)/$(COMMIT_ID)/$(COMMIT_ID)

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

build-js:
	@echo
	@echo Bundling .js files
	@echo

	$(REQUIREJS) -o config/requirejs/release.js baseUrl=$(BUILD_DIR)/js out=$(BUILD_DIR)/main.js

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

test: clean
	@echo
	@echo Transpiling .ts to .js for local tests
	@echo

	$(TYPESCRIPT) --project .
	$(TYPESCRIPT) --project test

	@echo
	@echo Running local tests
	@echo

	NODE_PATH=$(TS_SRC) $(MOCHA) --recursive

test-coverage: clean
	@echo
	@echo Transpiling .ts to .js for local tests
	@echo

	$(TYPESCRIPT) --project .
	$(TYPESCRIPT) --project test

	@echo
	@echo Running local tests with coverage
	@echo

	NODE_PATH=$(TS_SRC) $(ISTANBUL) cover --root $(TS_SRC) --include-all-sources --dir $(BUILD_DIR)/coverage --report none $(MOCHA) -- --recursive
	$(REMAP_ISTANBUL) -i $(BUILD_DIR)/coverage/coverage.json -o $(BUILD_DIR)/coverage/report -t html

test-coveralls: test-coverage
	$(REMAP_ISTANBUL) -i $(BUILD_DIR)/coverage/coverage.json -o $(BUILD_DIR)/coverage/lcov.info -t lcovonly

	cat $(BUILD_DIR)/coverage/lcov.info | $(COVERALLS) --verbose
