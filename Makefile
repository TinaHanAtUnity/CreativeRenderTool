# Binaries
BIN = node_modules/.bin
CONCURRENTLY = $(BIN)/concurrently
TYPESCRIPT = $(BIN)/tsc
TSLINT = $(BIN)/tslint
STYLUS = $(BIN)/stylus
BABEL = $(BIN)/babel
ROLLUP = $(BIN)/rollup
ISTANBUL = $(BIN)/istanbul
REMAP_ISTANBUL = $(BIN)/remap-istanbul
STYLINT = $(BIN)/stylint
PBJS = $(BIN)/pbjs
PBTS = $(BIN)/pbts
CC = java -jar node_modules/google-closure-compiler/compiler.jar
ES6_PROMISE = node_modules/es6-promise/dist/es6-promise.auto.js
SYSTEM_JS = node_modules/systemjs/dist/system.src.js

# Sources
TS_SRC = src/ts
STYL_SRC = src/styl
PROD_INDEX_SRC = src/prod-index.html
TEST_INDEX_SRC = src/test-index.html
PROD_CONFIG_SRC = src/prod-config.json
TEST_CONFIG_SRC = src/test-config.json
ADMOB_CONTAINER_DIR = src/html/admob
ADMOB_CONTAINER_SRC = $(ADMOB_CONTAINER_DIR)/AFMAContainer-no-obfuscation.html
ADMOB_CONTAINER_GENERATED = $(ADMOB_CONTAINER_DIR)/AFMAContainer.html

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

# For platform specific operations
OS := $(shell uname)

.PHONY: build-browser build-dev build-release build-test build-dir build-ts build-js build-css build-static clean lint test test-unit test-integration test-coverage test-filter watch setup deploy build-dev-no-ts watch-fast

build-browser: BUILD_DIR = build/browser
build-browser: MODULE = system
build-browser: TARGET = es5
build-browser: build-dir build-static build-css build-proto build-ts
	cp src/browser-index.html $(BUILD_DIR)/index.html
	cp src/browser-iframe.html $(BUILD_DIR)/iframe.html

build-dev: BUILD_DIR = build/dev
build-dev: MODULE = system
build-dev: TARGET = es5
build-dev: build-dir build-static build-css build-proto build-ts
	echo "{\"url\":\"http://$(shell ifconfig |grep "inet" |fgrep -v "127.0.0.1"|grep -E -o "([0-9]{1,3}[\.]){3}[0-9]{1,3}" |grep -v -E "^0|^127" -m 1):8000/build/dev/index.html\",\"hash\":null}" > $(BUILD_DIR)/config.json
	cp src/dev-index.html $(BUILD_DIR)/index.html
	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var p=fs.readFileSync('$(ES6_PROMISE)', o);\
		var s=fs.readFileSync('$(SYSTEM_JS)', o);\
		var i=fs.readFileSync('$(BUILD_DIR)/index.html', o);\
		fs.writeFileSync('$(BUILD_DIR)/index.html', i.replace('{ES6_PROMISE}', p).replace('{SYSTEM_JS}', s), o);"

build-dev-no-ts: build-dir build-static build-css build-proto

build-release: BUILD_DIR = build/release
build-release: MODULE = es2015
build-release: TARGET = es5
build-release: clean build-dir build-static build-css build-proto build-ts build-js
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
		var b=fs.readFileSync('node_modules/protobufjs/dist/minimal/protobuf.min.js', o);\
		fs.writeFileSync('$(BUILD_DIR)/index.html', i.replace('{COMPILED_CSS}', s).replace('{COMPILED_JS}', j).replace('{PROTOBUF_JS}', b), o);"

	@echo
	@echo Cleaning release build
	@echo

	rm -rf $(BUILD_DIR)/img $(BUILD_DIR)/css $(BUILD_DIR)/js $(BUILD_DIR)/html $(BUILD_DIR)/xml $(BUILD_DIR)/json $(BUILD_DIR)/proto $(BUILD_DIR)/bundle.js $(BUILD_DIR)/bundle.min.js

	@echo
	@echo Copying release config.json to build
	@echo

	cp $(PROD_CONFIG_SRC) $(BUILD_DIR)/config.json

	@echo
	@echo Computing build details to release config
	@echo

	INPUT=$(BUILD_DIR)/index.html OUTPUT=$(BUILD_DIR)/config.json BRANCH=$(BRANCH) COMMIT_ID=$(COMMIT_ID) TARGET=release node tools/generate_config.js

	@echo
	@echo Generating commit id based build directory
	@echo

	mkdir build/$(COMMIT_ID) | true
	rsync -r build/release build/$(COMMIT_ID)
	rm -rf build/$(COMMIT_ID)/$(COMMIT_ID)

build-test: BUILD_DIR = build/test
build-test: MODULE = system
build-test: TARGET = es5
build-test: clean build-dir build-css build-static build-proto build-ts
	@echo
	@echo Generating test runner
	@echo

	cp test-utils/runner.js $(BUILD_DIR)
	BUILD_DIR=$(BUILD_DIR) node test-utils/generate_runner.js

	@echo
	@echo Copying test index.html to build
	@echo

	cp $(TEST_INDEX_SRC) $(BUILD_DIR)/index.html
	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var p=fs.readFileSync('$(ES6_PROMISE)', o);\
		var s=fs.readFileSync('$(SYSTEM_JS)', o);\
		var i=fs.readFileSync('$(BUILD_DIR)/index.html', o);\
		fs.writeFileSync('$(BUILD_DIR)/index.html', i.replace('{ES6_PROMISE}', p).replace('{SYSTEM_JS}', s), o);"

	@echo
	@echo Copying vendor libraries to build
	@echo

	mkdir -p $(BUILD_DIR)/vendor
	cp \
		node_modules/es6-promise/dist/es6-promise.auto.js \
		node_modules/systemjs/dist/system.js \
		node_modules/mocha/mocha.js \
		node_modules/chai/chai.js \
		node_modules/sinon/pkg/sinon.js \
		node_modules/systemjs-plugin-text/text.js \
		node_modules/protobufjs/node_modules/long/dist/long.js \
		node_modules/protobufjs/dist/minimal/protobuf.js \
		test-utils/reporter.js \
		$(BUILD_DIR)/vendor

	@echo
	@echo Copying test config to build
	@echo

	cp $(TEST_CONFIG_SRC) $(BUILD_DIR)/config.json

	@echo
	@echo Computing build details to test config
	@echo

	INPUT=$(BUILD_DIR)/index.html OUTPUT=$(BUILD_DIR)/config.json BRANCH=$(BRANCH) COMMIT_ID=$(COMMIT_ID) TARGET=test node tools/generate_config.js

	@echo
	@echo Generating commit id based build directory
	@echo

	mkdir build/$(COMMIT_ID) | true
	rsync -r build/test build/$(COMMIT_ID)
	rm -rf build/$(COMMIT_ID)/$(COMMIT_ID)

build-dir:
	@echo
	@echo Creating build directory
	@echo

	mkdir -p $(BUILD_DIR)

build-proto:
	@echo
	@echo Compiling .proto to .js and .d.ts
	@echo

	mkdir -p $(BUILD_DIR)/proto
	$(PBJS) -t static-module -w $$(if [ $(MODULE) = es2015 ]; then echo es6; else echo commonjs; fi) --no-create --no-verify --no-convert --no-delimited --no-beautify -o src/proto/unity_proto.js src/proto/unity_proto.proto
	$(PBTS) -o src/proto/unity_proto.d.ts src/proto/unity_proto.js
	cp src/proto/unity_proto.js $(BUILD_DIR)/proto/unity_proto.js

build-ts:
build-ts: lint
	@echo
	@echo Transpiling .ts to .js
	@echo

	$(TYPESCRIPT) --project . --module $(MODULE) --target $(TARGET) --outDir $(BUILD_DIR)/js

build-js:
	@echo
	@echo Bundling .js files
	@echo

	$(ROLLUP) -c rollup.js
	$(CC) --js $(BUILD_DIR)/bundle.js --js_output_file $(BUILD_DIR)/bundle.min.js --formatting PRETTY_PRINT --assume_function_wrapper --rewrite_polyfills false

build-css:
	@echo
	@echo Lint .styl
	@echo

	$(STYLINT) src/styl -c stylintrc.json

	@echo
	@echo Transpiling .styl to .css
	@echo
	mkdir -p $(BUILD_DIR)/css
	$(STYLUS) -o $(BUILD_DIR)/css -u autoprefixer-stylus --compress --inline --with '{limit: false}' `find $(STYL_SRC) -name "*.styl" | xargs`

build-static:
	@echo
	@echo Generating obfuscated container AdMob js
	@echo

	sed -e 's/<\/*script>//g' $(ADMOB_CONTAINER_SRC) > $(ADMOB_CONTAINER_DIR)/admob_temp.js
	echo '<script>' > $(ADMOB_CONTAINER_GENERATED)
	$(CC) --js $(ADMOB_CONTAINER_DIR)/admob_temp.js --formatting PRETTY_PRINT --rewrite_polyfills false >> $(ADMOB_CONTAINER_GENERATED)
	echo '</script>' >> $(ADMOB_CONTAINER_GENERATED)
	rm $(ADMOB_CONTAINER_DIR)/admob_temp.js

	@echo
	@echo Copying static files to build
	@echo

	cp -r src/img $(BUILD_DIR)
	cp -r src/html $(BUILD_DIR)
	cp -r src/xml $(BUILD_DIR)
	cp -r src/json $(BUILD_DIR)

clean:
	@echo
	@echo Cleaning $(BUILD_DIR)
	@echo

	rm -rf $(BUILD_DIR)
	find $(TS_SRC) -type f -name "*.js" -or -name "*.map" | xargs rm -rf
lint:
	@echo
	@echo Running linter
	@echo

	$(TSLINT) -c tslint.json `find $(TS_SRC) -name "*.ts" | xargs`

test: test-unit test-integration

test-unit: MODULE = system
test-unit: TARGET = es5
test-unit: build-static build-proto
	@echo
	@echo Transpiling .ts to .js for local tests
	@echo

	$(TYPESCRIPT) --project . --module $(MODULE) --target $(TARGET)

	@echo
	@echo Running unit tests
	@echo

	TEST_FILTER=Test/Unit node --trace-warnings test-utils/node_runner.js

test-unit-debug: MODULE = system
test-unit-debug: TARGET = es5
test-unit-debug: build-proto
	@echo
	@echo Transpiling .ts to .js for local tests
	@echo

	$(TYPESCRIPT) --project . --module $(MODULE) --target $(TARGET)

	@echo
	@echo Running unit tests
	@echo

	TEST_FILTER=Test/Unit node inspect --trace-warnings test-utils/node_runner.js



test-integration: MODULE = system
test-integration: TARGET = es5
test-integration: build-proto
	@echo
	@echo Transpiling .ts to .js for local tests
	@echo

	$(TYPESCRIPT) --project . --module $(MODULE) --target $(TARGET)

	@echo
	@echo Running integration tests
	@echo

	ISOLATED=true TEST_FILTER=Test/Integration node test-utils/node_runner.js

test-coverage: BUILD_DIR = build/coverage
test-coverage: MODULE = system
test-coverage: TARGET = es5
test-coverage: build-dir build-proto build-static
	@echo
	@echo Transpiling .ts to .js for local tests
	@echo

	$(TYPESCRIPT) --project . --module $(MODULE) --target $(TARGET)

	@echo
	@echo Running unit tests with coverage
	@echo

	COVERAGE_DIR=$(BUILD_DIR) TEST_FILTER=Test/Unit node test-utils/node_runner.js
	@$(REMAP_ISTANBUL) -i $(BUILD_DIR)/coverage.json -o $(BUILD_DIR)/summary -t text-summary
	@cat $(BUILD_DIR)/summary && echo \n
	@$(REMAP_ISTANBUL) -i $(BUILD_DIR)/coverage.json -o $(BUILD_DIR)/report -t html

test-browser: build-browser
	@echo
	@echo Running browser build tests
	@echo
	node test-utils/headless.js

test-filter: MODULE = system
test-filter: TARGET = es5
ifeq ($(TEST_FILTER),)
test-filter: TEST_FILTER = Test/Unit
endif
test-filter: build-proto
	@echo
	@echo Transpiling .ts to .js for local tests
	@echo

	$(TYPESCRIPT) --project . --module $(MODULE) --target $(TARGET)

	@echo
	@echo Running unit tests with filter: $(TEST_FILTER)
	@echo

	TEST_FILTER=$(TEST_FILTER) node --trace-warnings test-utils/node_runner.js

ifeq ($(TRAVIS_PULL_REQUEST), false)
travis-browser-test:
	@echo "Skipping travis browser tests, this is not a PR"
else ifneq ($(BRANCH), master)
travis-browser-test:
	@echo "Skipping travis browser tests, the PR is not to master-branch it is for $(BRANCH)"
else
travis-browser-test: build-browser start-nginx test-browser stop-nginx
endif

watch:
	watchman-make -p 'src/index.html' 'src/ts/**/*.ts' 'src/styl/*.styl' 'src/html/*.html' -t build-dev -p 'src/ts/Test/**/*.ts' -t test

watch-fast: BUILD_DIR = build/dev
watch-fast: MODULE = system
watch-fast: TARGET = es5
watch-fast: build-dev-no-ts
	$(CONCURRENTLY) --names build,tsc,test \
									--kill-others \
									"watchman-make -p 'src/index.html' 'src/styl/*.styl' 'src/html/*.html' -t build-dev-no-ts" \
									"$(TYPESCRIPT) --watch --preserveWatchOutput --project . --module $(MODULE) --target $(TARGET) --outDir $(BUILD_DIR)/js" \
									"node test-utils/test-watcher.js"

setup: clean
	rm -rf node_modules && npm install

deploy:
ifeq ($(TRAVIS_PULL_REQUEST), false)
	rm -rf build/coverage
	find build/test/* -not -name "config.json" | xargs rm -rf
	find build/release/* -not -name "config.json" | xargs rm -rf
	tools/deploy.sh $(BRANCH) && node tools/purge.js
else
	@echo 'Skipping deployment for pull requests'
endif

start-nginx:
ifeq ($(OS),Darwin)
	sed -e "s#DEVELOPMENT_DIR#$(shell pwd)#g" nginx/nginx.conf.template > nginx/nginx.conf
	nginx -c $(shell pwd)/nginx/nginx.conf
else
	python3 -m http.server 8000 & echo $$! > nginx/server.PID
	@echo "Started Python static webserver"
endif

stop-nginx:
ifeq ($(OS),Darwin)
	nginx -s stop
else
	kill $$(cat nginx/server.PID)
endif
