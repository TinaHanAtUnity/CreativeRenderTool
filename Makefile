# Options

MAKEFLAGS += -rRs

# Binaries

BIN := node_modules/.bin
TYPESCRIPT := $(BIN)/tsc
REMAP_ISTANBUL := $(BIN)/remap-istanbul
TSLINT := $(BIN)/tslint
STYLUS := $(BIN)/stylus
ROLLUP := $(BIN)/rollup
STYLINT := $(BIN)/stylint
PBJS := $(BIN)/pbjs
PBTS := $(BIN)/pbts
CC := java -jar node_modules/google-closure-compiler/compiler.jar
INLINE := $(BIN)/inline-source

# Directories

SOURCE_DIR := src
TEST_DIR := test
BUILD_DIR := build
SOURCE_BUILD_DIR := $(BUILD_DIR)/$(SOURCE_DIR)
TEST_BUILD_DIR := $(BUILD_DIR)/$(TEST_DIR)
ADMOB_CONTAINER_DIR := $(SOURCE_DIR)/html/admob

# Branch and commit id

ifeq ($(TRAVIS), true)
	BRANCH = $(TRAVIS_BRANCH)
	COMMIT_ID = $(TRAVIS_COMMIT)
else
	BRANCH = $(shell git symbolic-ref --short HEAD)
	COMMIT_ID = $(shell git rev-parse HEAD)
endif

# Local IP address

IP_ADDRESS := $(shell node -p '[].concat.apply([], Object.values(os.networkInterfaces()).map(iface => iface.filter(({family, internal}) => family === "IPv4" && !internal)))[0].address')

# Sources

SOURCES := $(shell find $(SOURCE_DIR) -mindepth 2 -type f -not -name '*.d.ts')
TS_SOURCES := $(filter %.ts, $(SOURCES))
HTML_SOURCES := $(filter %.html, $(SOURCES))
JSON_SOURCES := $(filter %.json, $(SOURCES))
XML_SOURCES := $(filter %.xml, $(SOURCES))

TESTS := $(shell find $(TEST_DIR) -type f -name '*.ts' -and -not -name '*.d.ts')
UNIT_TESTS := $(shell find $(TEST_DIR)/Unit -type f -name '*Test.ts' -and -not -name '*.d.ts')
INTEGRATION_TESTS := $(shell find $(TEST_DIR)/Integration -type f -name '*Test.ts' -and -not -name '*.d.ts')

# Targets

TS_TARGETS := $(addprefix $(BUILD_DIR)/, $(patsubst %.ts, %.js, $(TS_SOURCES)))
TS_TARGETS += $(SOURCE_BUILD_DIR)/proto/unity_proto.js

CSS_TARGETS := $(SOURCE_BUILD_DIR)/styl/main.css

HTML_TARGETS := $(addprefix $(BUILD_DIR)/, $(HTML_SOURCES))
HTML_TARGETS += $(SOURCE_BUILD_DIR)/html/admob/AFMAContainer.html

JSON_TARGETS := $(addprefix $(BUILD_DIR)/, $(JSON_SOURCES))

XML_TARGETS := $(addprefix $(BUILD_DIR)/, $(XML_SOURCES))

TEST_TARGETS := $(addprefix $(BUILD_DIR)/, $(patsubst %.ts, %.js, $(TESTS)))
UNIT_TEST_TARGETS := $(addprefix $(BUILD_DIR)/, $(patsubst %.ts, %.js, $(UNIT_TESTS)))
INTEGRATION_TEST_TARGETS := $(addprefix $(BUILD_DIR)/, $(patsubst %.ts, %.js, $(INTEGRATION_TESTS)))

# Build Targets

BROWSER_BUILD_TARGETS := $(SOURCE_BUILD_DIR)/ts/BrowserBundle.js $(SOURCE_BUILD_DIR)/styl/main.css $(BUILD_DIR)/browser/index.html $(BUILD_DIR)/browser/iframe.html
DEV_BUILD_TARGETS := $(SOURCE_BUILD_DIR)/ts/Bundle.js $(BUILD_DIR)/dev/index.html $(BUILD_DIR)/dev/config.json
RELEASE_BUILD_TARGETS := $(SOURCE_BUILD_DIR)/ts/Bundle.min.js $(BUILD_DIR)/release/index.html $(BUILD_DIR)/release/config.json
TEST_BUILD_TARGETS := $(TEST_BUILD_DIR)/UnitBundle.min.js $(BUILD_DIR)/test/index.html $(BUILD_DIR)/test/config.json

# Built-in targets

.PHONY: all static build-browser build-dev build-release build-test test test-unit test-integration test-coverage test-browser clean lint setup watch-dev watch-browser watch-test start-server stop-server deploy qr-code
.NOTPARALLEL: $(TS_TARGETS) $(TEST_TARGETS)

# Main targets

all: $(TS_TARGETS) $(CSS_TARGETS) static $(TEST_TARGETS)

static: $(HTML_TARGETS) $(JSON_TARGETS) $(XML_TARGETS)

build-browser: all $(BROWSER_BUILD_TARGETS)

build-dev: all $(DEV_BUILD_TARGETS)

build-release: all $(RELEASE_BUILD_TARGETS)

build-test: all $(TEST_BUILD_TARGETS)

test: test-unit test-integration

test-unit: start-server build/test/UnitBundle.js build/test/unit-test.html
	TEST_LIST="$(UNIT_TESTS)" TEST_URL="http://localhost:8000/build/test/unit-test.html" node test-utils/runner.js

test-integration: start-server build/test/IntegrationBundle.js build/test/integration-test.html
	TEST_LIST="$(INTEGRATION_TESTS)" TEST_URL="http://localhost:8000/build/test/integration-test.html" ISOLATED=1 node test-utils/runner.js

test-coverage: start-server build/test/CoverageBundle.js build/test/coverage-test.html
	mkdir -p build/coverage
	TEST_LIST="$(UNIT_TESTS)" TEST_URL="http://localhost:8000/build/test/coverage-test.html" COVERAGE=1 node test-utils/runner.js
	$(REMAP_ISTANBUL) -i build/coverage/coverage.json -o build/coverage -t html
	$(REMAP_ISTANBUL) -i build/coverage/coverage.json -o build/coverage/summary -t text-summary
	cat build/coverage/summary && echo "\n"

ifeq ($(TRAVIS_PULL_REQUEST), false)
test-browser:
	echo "Skipping travis browser tests, this is not a PR"
else ifneq ($(BRANCH), master)
test-browser:
	echo "Skipping travis browser tests, the PR is not to master-branch it is for $(BRANCH)"
else
test-browser: start-server build-browser
	node test-utils/headless.js
endif

# VPaths

vpath %.ts $(SOURCE_DIR)/ts $(TEST_DIR)
vpath %.html $(SOURCE_DIR)/html
vpath %.json $(SOURCE_DIR)/json
vpath %.styl $(SOURCE_DIR)/styl
vpath %.xml $(SOURCE_DIR)/xml

# Build target rules

$(BUILD_DIR)/browser/index.html: $(SOURCE_DIR)/browser-index.html
	mkdir -p $(dir $@) && cp $< $@

$(BUILD_DIR)/browser/iframe.html: $(SOURCE_DIR)/browser-iframe.html
	mkdir -p $(dir $@) && cp $< $@

$(BUILD_DIR)/dev/index.html: $(SOURCE_DIR)/dev-index.html $(SOURCE_BUILD_DIR)/ts/Bundle.js $(CSS_TARGETS)
	mkdir -p $(dir $@) && $(INLINE) $< $@

$(BUILD_DIR)/dev/config.json:
	echo "{\"url\":\"http://$(IP_ADDRESS):8000/build/dev/index.html\",\"hash\":null}" > $@

$(BUILD_DIR)/release/index.html: $(SOURCE_DIR)/prod-index.html $(SOURCE_BUILD_DIR)/ts/Bundle.min.js $(CSS_TARGETS)
	mkdir -p $(dir $@) && $(INLINE) $< $@

$(BUILD_DIR)/release/config.json:
	INPUT=$(BUILD_DIR)/release/index.html OUTPUT=$(BUILD_DIR)/release/config.json BRANCH=$(BRANCH) COMMIT_ID=$(COMMIT_ID) TARGET=release node tools/generate_config.js

$(BUILD_DIR)/test/index.html: $(SOURCE_DIR)/hybrid-test-index.html $(TEST_BUILD_DIR)/UnitBundle.min.js test-utils/reporter.js test-utils/setup.js
	mkdir -p $(dir $@) && $(INLINE) $< $@

$(BUILD_DIR)/test/config.json:
	INPUT=$(BUILD_DIR)/test/index.html OUTPUT=$(BUILD_DIR)/test/config.json BRANCH=$(BRANCH) COMMIT_ID=$(COMMIT_ID) TARGET=test node tools/generate_config.js

$(BUILD_DIR)/test/unit-test.html: $(SOURCE_DIR)/unit-test-index.html
	mkdir -p $(dir $@) && cp $< $@

$(BUILD_DIR)/test/integration-test.html: $(SOURCE_DIR)/integration-test-index.html
	mkdir -p $(dir $@) && cp $< $@

$(BUILD_DIR)/test/coverage-test.html: $(SOURCE_DIR)/coverage-test-index.html
	mkdir -p $(dir $@) && cp $< $@

# Implicit rules

$(SOURCE_BUILD_DIR)/ts/BrowserBundle.js: $(TS_TARGETS) $(HTML_TARGETS) $(JSON_TARGETS) $(XML_TARGETS)
	$(ROLLUP) --config rollup.config.browser.js

$(SOURCE_BUILD_DIR)/ts/Bundle.js: $(TS_TARGETS) $(HTML_TARGETS) $(JSON_TARGETS) $(XML_TARGETS)
	$(ROLLUP) --config rollup.config.device.js

$(SOURCE_BUILD_DIR)/ts/Bundle.min.js: $(SOURCE_BUILD_DIR)/ts/Bundle.js
	$(CC) $(shell cat .cc.opts | xargs) --js $(SOURCE_BUILD_DIR)/ts/Bundle.js --js_output_file $(SOURCE_BUILD_DIR)/ts/Bundle.min.js

$(SOURCE_BUILD_DIR)/ts/%.js: %.ts
	$(TYPESCRIPT) --project tsconfig.json

$(SOURCE_BUILD_DIR)/proto/unity_proto.js:
	mkdir -p $(SOURCE_BUILD_DIR)/proto
	$(PBJS) -t static-module -w es6 --no-create --no-verify --no-convert --no-delimited --no-beautify -o $(SOURCE_BUILD_DIR)/proto/unity_proto.js src/proto/unity_proto.proto
	$(PBTS) -o src/proto/unity_proto.d.ts $(SOURCE_BUILD_DIR)/proto/unity_proto.js

$(SOURCE_BUILD_DIR)/html/admob/AFMAContainer.html: $(SOURCE_DIR)/html/admob/AFMAContainer.html
	mkdir -p $(dir $@)
	sed -e 's/<\/*script>//g' $< > $(ADMOB_CONTAINER_DIR)/admob_temp.js
	echo '<script>' > $@
	$(CC) --js $(ADMOB_CONTAINER_DIR)/admob_temp.js --formatting PRETTY_PRINT --rewrite_polyfills false >> $@
	echo '</script>' >> $@
	rm $(ADMOB_CONTAINER_DIR)/admob_temp.js

$(SOURCE_BUILD_DIR)/html/%.html: %.html
	mkdir -p $(dir $@) && cp $< $@

$(SOURCE_BUILD_DIR)/json/%.json: %.json
	mkdir -p $(dir $@) && cp $< $@

$(SOURCE_BUILD_DIR)/xml/%.xml: %.xml
	mkdir -p $(dir $@) && cp $< $@

$(SOURCE_BUILD_DIR)/styl/%.css: %.styl
	mkdir -p $(dir $@) && $(STYLUS) --out $(SOURCE_BUILD_DIR)/styl --use autoprefixer-stylus --compress --inline --with '{limit: false}' $<

$(TEST_BUILD_DIR)/%.js: %.ts
	$(TYPESCRIPT) --project tsconfig.json

$(TEST_BUILD_DIR)/Unit.js:
	mkdir -p $(dir $@) && echo "import 'Workarounds';" $(UNIT_TESTS) | sed "s/test\\//import '/g" | sed "s/\.ts/';/g" > $@

$(TEST_BUILD_DIR)/UnitBundle.js: $(TEST_BUILD_DIR)/Unit.js $(TS_TARGETS) $(HTML_TARGETS) $(JSON_TARGETS) $(XML_TARGETS) $(UNIT_TEST_TARGETS)
	$(ROLLUP) --config rollup.config.test.unit.js

$(TEST_BUILD_DIR)/UnitBundle.min.js: $(TEST_BUILD_DIR)/UnitBundle.js
	$(CC) $(shell cat .cc.opts | xargs) --js $(TEST_BUILD_DIR)/UnitBundle.js --js_output_file $(TEST_BUILD_DIR)/UnitBundle.min.js

$(TEST_BUILD_DIR)/Integration.js:
	mkdir -p $(dir $@) && echo $(INTEGRATION_TESTS) | sed "s/test\\//import '/g" | sed "s/\.ts/';/g" > $@

$(TEST_BUILD_DIR)/IntegrationBundle.js: $(TEST_BUILD_DIR)/Integration.js $(TS_TARGETS) $(HTML_TARGETS) $(JSON_TARGETS) $(XML_TARGETS) $(INTEGRATION_TEST_TARGETS)
	$(ROLLUP) --config rollup.config.test.integration.js

$(TEST_BUILD_DIR)/CoverageBundle.js: $(TEST_BUILD_DIR)/Unit.js $(TS_TARGETS) $(HTML_TARGETS) $(JSON_TARGETS) $(XML_TARGETS) $(UNIT_TEST_TARGETS)
	$(ROLLUP) --config rollup.config.test.coverage.js

%::
	$(warning No rule specified for target "$@")

# Helper targets

clean:
	rm -rf $(BUILD_DIR)/*

lint:
	parallel ::: \
		"$(STYLINT) $(SOURCE_DIR)/styl -c stylintrc.json" \
		"$(TSLINT) --project tsconfig.json $(TS_SOURCES) $(TESTS)"

setup: clean
	rm -rf node_modules
	npm install

watch-dev: build-dev
	parallel --ungroup --tty --jobs 0 ::: \
		"$(TYPESCRIPT) --project tsconfig.json --watch --preserveWatchOutput" \
		"$(STYLUS) --out $(SOURCE_BUILD_DIR)/styl --use autoprefixer-stylus --compress --inline --with '{limit: false}' --watch $(SOURCE_DIR)/styl/main.styl" \
		"$(ROLLUP) --watch --config rollup.config.device.js" \
		"watchman-make -p build/src/ts/Bundle.js $(CSS_TARGETS) -t build-dev"

watch-browser: build-browser
	parallel --ungroup --tty --jobs 0 ::: \
		"$(TYPESCRIPT) --project tsconfig.json --watch --preserveWatchOutput" \
		"$(STYLUS) --out $(SOURCE_BUILD_DIR)/styl --use autoprefixer-stylus --compress --inline --with '{limit: false}' --watch $(SOURCE_DIR)/styl/main.styl" \
		"$(ROLLUP) --watch --config rollup.config.browser.js"

watch-test: all $(TEST_BUILD_DIR)/Unit.js $(TEST_BUILD_DIR)/Integration.js
	parallel --ungroup --tty --jobs 0 ::: \
		"$(TYPESCRIPT) --project tsconfig.json --watch --preserveWatchOutput" \
		"$(ROLLUP) --watch --config rollup.config.test.unit.js" \
		"$(ROLLUP) --watch --config rollup.config.test.integration.js" \
		"watchman-make -p build/test/UnitBundle.js -t test-unit" \
		"watchman-make -p build/test/IntegrationBundle.js -t test-integration"

start-server:
	test ! -f server.pid && { nohup python3 -m http.server 8000 >/dev/null 2>&1 & echo $$! > server.pid; } || true

stop-server:
	test -f server.pid && kill $$(cat server.pid) && rm server.pid || true

deploy:
ifeq ($(TRAVIS_PULL_REQUEST), false)
	mkdir -p deploy/release
	mkdir -p deploy/test
	mkdir -p deploy/$(COMMIT_ID)
	cp build/release/index.html deploy/release/index.html
	cp build/release/config.json deploy/release/config.json
	cp build/test/index.html deploy/test/index.html
	cp build/test/config.json deploy/test/config.json
	rsync -r deploy/release deploy/$(COMMIT_ID)
	rsync -r deploy/test deploy/$(COMMIT_ID)
	tools/deploy.sh $(BRANCH) && node tools/purge.js
else
	echo 'Skipping deployment for pull requests'
endif

qr-code:
	segno "http://$(IP_ADDRESS):8000/build/dev/config.json"
