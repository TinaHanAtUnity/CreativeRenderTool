# Options

MAKEFLAGS += -rR

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

# Branch and commit id
ifeq ($(TRAVIS), true)
	BRANCH = $(TRAVIS_BRANCH)
	COMMIT_ID = $(TRAVIS_COMMIT)
else
	BRANCH = $(shell git symbolic-ref --short HEAD)
	COMMIT_ID = $(shell git rev-parse HEAD)
endif

# Sources

SOURCES := $(shell find $(SOURCE_DIR) -mindepth 2 -type f -not -name '*.d.ts')
TS_SOURCES := $(filter %.ts, $(SOURCES))
HTML_SOURCES := $(filter %.html, $(SOURCES))
JSON_SOURCES := $(filter %.json, $(SOURCES))
XML_SOURCES := $(filter %.xml, $(SOURCES))

TESTS := $(shell find $(TEST_DIR) -type f -not -name '*.d.ts')
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

.PHONY: all build-browser build-dev build-release build-test test test-unit test-integration test-coverage release clean lint setup watch start-server stop-server
.NOTPARALLEL: $(TS_TARGETS) $(TEST_TARGETS)

# Main targets

all: $(TS_TARGETS) $(CSS_TARGETS) $(HTML_TARGETS) $(JSON_TARGETS) $(XML_TARGETS) $(TEST_TARGETS)

build-browser: all $(BROWSER_BUILD_TARGETS)

build-dev: all $(DEV_BUILD_TARGETS)

build-release: all $(RELEASE_BUILD_TARGETS)
	@mkdir build/$(COMMIT_ID) | true
	@rsync -r build/release build/$(COMMIT_ID)
	@rm -rf build/$(COMMIT_ID)/$(COMMIT_ID)

build-test: all $(TEST_BUILD_TARGETS)
	@mkdir build/$(COMMIT_ID) | true
	@rsync -r build/test build/$(COMMIT_ID)
	@rm -rf build/$(COMMIT_ID)/$(COMMIT_ID)

test: test-unit test-integration

test-unit: start-server all build/test/UnitBundle.js build/test/unit-test.html
	@node test-utils/runner.js http://localhost:8000/build/test/unit-test.html

test-integration: start-server all build/test/IntegrationBundle.js build/test/integration-test.html
	@node test-utils/runner.js http://localhost:8000/build/test/integration-test.html

test-coverage: start-server all build/test/CoverageBundle.js build/test/coverage-test.html
	@mkdir -p build/coverage
	@node test-utils/runner.js http://localhost:8000/build/test/coverage-test.html true
	@$(REMAP_ISTANBUL) -i build/coverage/coverage.json -o build/coverage -t html
	@$(REMAP_ISTANBUL) -i build/coverage/coverage.json -o build/coverage/summary -t text-summary
	@cat build/coverage/summary && echo "\n"

# VPaths

vpath %.ts $(SOURCE_DIR)/ts $(TEST_DIR)
vpath %.html $(SOURCE_DIR)/html
vpath %.json $(SOURCE_DIR)/json
vpath %.styl $(SOURCE_DIR)/styl
vpath %.xml $(SOURCE_DIR)/xml

# Build target rules

$(BUILD_DIR)/browser/index.html: $(SOURCE_DIR)/browser-index.html
	@mkdir -p $(dir $@) && cp $< $@

$(BUILD_DIR)/browser/iframe.html: $(SOURCE_DIR)/browser-iframe.html
	@mkdir -p $(dir $@) && $(INLINE) $< $@

$(BUILD_DIR)/dev/index.html: $(SOURCE_DIR)/dev-index.html
	@mkdir -p $(dir $@) && $(INLINE) $< $@

$(BUILD_DIR)/dev/config.json:
	@node tools/generate_dev_config.js

$(BUILD_DIR)/release/index.html: $(SOURCE_DIR)/prod-index.html
	@mkdir -p $(dir $@) && $(INLINE) $< $@

$(BUILD_DIR)/release/config.json:
	@INPUT=$(BUILD_DIR)/release/index.html OUTPUT=$(BUILD_DIR)/release/config.json BRANCH=$(BRANCH) COMMIT_ID=$(COMMIT_ID) TARGET=release node tools/generate_config.js

$(BUILD_DIR)/test/index.html: $(SOURCE_DIR)/hybrid-test-index.html
	@mkdir -p $(dir $@) && $(INLINE) $< $@

$(BUILD_DIR)/test/config.json:
	@INPUT=$(BUILD_DIR)/test/index.html OUTPUT=$(BUILD_DIR)/test/config.json BRANCH=$(BRANCH) COMMIT_ID=$(COMMIT_ID) TARGET=test node tools/generate_config.js

# Implicit rules

$(SOURCE_BUILD_DIR)/ts/BrowserBundle.js: all
	@$(ROLLUP) --config rollup.config.browser.js

$(SOURCE_BUILD_DIR)/ts/Bundle.js: all
	@$(ROLLUP) --config rollup.config.device.js

$(SOURCE_BUILD_DIR)/ts/Bundle.min.js: $(SOURCE_BUILD_DIR)/ts/Bundle.js
	@$(CC) $(shell cat .cc.opts | xargs) --js $(SOURCE_BUILD_DIR)/ts/Bundle.js --js_output_file $(SOURCE_BUILD_DIR)/ts/Bundle.min.js

$(SOURCE_BUILD_DIR)/ts/%.js: %.ts
	@$(TYPESCRIPT) --project tsconfig.json

$(SOURCE_BUILD_DIR)/proto/unity_proto.js:
	@mkdir -p $(SOURCE_BUILD_DIR)/proto
	@$(PBJS) -t static-module -w es6 --no-create --no-verify --no-convert --no-delimited --no-beautify -o $(SOURCE_BUILD_DIR)/proto/unity_proto.js src/proto/unity_proto.proto
	@$(PBTS) -o src/proto/unity_proto.d.ts $(SOURCE_BUILD_DIR)/proto/unity_proto.js

$(SOURCE_BUILD_DIR)/html/admob/AFMAContainer.html:
	@cp src/html/admob/AFMAContainer-no-obfuscation.html $@

$(SOURCE_BUILD_DIR)/html/%.html: %.html
	@mkdir -p $(dir $@) && cp $< $@

$(SOURCE_BUILD_DIR)/json/%.json: %.json
	@mkdir -p $(dir $@) && cp $< $@

$(SOURCE_BUILD_DIR)/xml/%.xml: %.xml
	@mkdir -p $(dir $@) && cp $< $@

$(SOURCE_BUILD_DIR)/styl/%.css: %.styl
	@mkdir -p $(dir $@) && $(STYLUS) -o $(SOURCE_BUILD_DIR)/styl -u autoprefixer-stylus --compress --inline --with '{limit: false}' $<

$(TEST_BUILD_DIR)/%.js: %.ts
	@$(TYPESCRIPT) --project tsconfig.json

$(TEST_BUILD_DIR)/Unit.js:
	@echo $(UNIT_TESTS) | sed "s/test\\//import '/g" | sed "s/\.ts/';/g" > $@

$(TEST_BUILD_DIR)/UnitBundle.js: $(TEST_BUILD_DIR)/Unit.js $(UNIT_TEST_TARGETS)
	@$(ROLLUP) --config rollup.config.test.unit.js

$(TEST_BUILD_DIR)/UnitBundle.min.js: $(TEST_BUILD_DIR)/UnitBundle.js
	@$(CC) $(shell cat .cc.opts | xargs) --js $(TEST_BUILD_DIR)/UnitBundle.js --js_output_file $(TEST_BUILD_DIR)/UnitBundle.min.js

$(TEST_BUILD_DIR)/Integration.js:
	@echo $(INTEGRATION_TESTS) | sed "s/test\\//import '/g" | sed "s/\.ts/';/g" > $@

$(TEST_BUILD_DIR)/IntegrationBundle.js: $(TEST_BUILD_DIR)/Integration.js $(INTEGRATION_TEST_TARGETS)
	@$(ROLLUP) --config rollup.config.test.integration.js

$(TEST_BUILD_DIR)/CoverageBundle.js: $(TEST_BUILD_DIR)/Unit.js $(UNIT_TEST_TARGETS)
	@$(ROLLUP) --config rollup.config.test.coverage.js

$(TEST_BUILD_DIR)/unit-test.html:
	@cp $(SOURCE_DIR)/unit-test-index.html $@

$(TEST_BUILD_DIR)/integration-test.html:
	@cp $(SOURCE_DIR)/integration-test-index.html $@

$(TEST_BUILD_DIR)/coverage-test.html:
	@cp $(SOURCE_DIR)/coverage-test-index.html $@

%::
	$(warning No rule specified for target "$@")

# Helper targets

clean:
	@rm -rf $(BUILD_DIR)/*

lint:
	@$(TSLINT) --project tsconfig.json $(filter %.ts, $(SOURCES)) $(filter %.ts, $(TESTS))

setup: clean
	@rm -rf node_modules
	@npm install

watch: all $(TEST_BUILD_DIR)/Unit.js $(TEST_BUILD_DIR)/Integration.js
	parallel --ungroup --tty --jobs 0 ::: \
		"$(TYPESCRIPT) --project tsconfig.json --watch --preserveWatchOutput" \
		"$(ROLLUP) --watch --config rollup.config.device.js" \
		"$(ROLLUP) --watch --config rollup.config.browser.js" \
		"$(ROLLUP) --watch --config rollup.config.test.unit.js" \
		"$(ROLLUP) --watch --config rollup.config.test.integration.js" \
		"$(ROLLUP) --watch --config rollup.config.test.coverage.js"

start-server:
	@test ! -f server.pid && { nohup python3 -m http.server 8000 >/dev/null 2>&1 & echo $$! > server.pid; } || true

stop-server:
	@test -f server.pid && kill $$(cat server.pid) && rm server.pid || true

deploy:
ifeq ($(TRAVIS_PULL_REQUEST), false)
	@mkdir -p deploy/release
	@mkdir -p deploy/test
	@cp build/release/index.html deploy/release/index.html
	@cp build/release/config.json deploy/release/config.json
	@cp build/test/index.html deploy/test/index.html
	@cp build/test/config.json deploy/test/config.json
	@tools/deploy.sh $(BRANCH) && node tools/purge.js
else
	@echo 'Skipping deployment for pull requests'
endif
