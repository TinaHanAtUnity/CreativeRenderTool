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

# Directories

SOURCE_DIR := src
TEST_DIR := test
BUILD_DIR := build
SOURCE_BUILD_DIR := $(BUILD_DIR)/$(SOURCE_DIR)
TEST_BUILD_DIR := $(BUILD_DIR)/$(TEST_DIR)

# Sources

SOURCES := $(shell find $(SOURCE_DIR) -type f -not -name '*.d.ts')
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

# Built-in targets

.PHONY: all test test-unit test-integration test-coverage release clean lint setup watch start-server stop-server
.NOTPARALLEL: $(TS_TARGETS) $(TEST_TARGETS)

# Main targets

all: $(TS_TARGETS) $(CSS_TARGETS) $(HTML_TARGETS) $(JSON_TARGETS) $(XML_TARGETS) $(TEST_TARGETS)

test: test-unit test-integration

test-unit: start-server all build/test/UnitBundle.js
	@node test-utils/headless_runner.js /build/test/UnitBundle.js

test-integration: start-server all build/test/IntegrationBundle.js
	@node test-utils/headless_runner.js /build/test/IntegrationBundle.js

test-coverage: start-server all build/test/UnitBundle.js
	@mkdir -p build/coverage
	@node test-utils/headless_runner.js /build/test/UnitBundle.js true
	@$(REMAP_ISTANBUL) -i build/coverage/coverage.json -o build/coverage -t html
	@$(REMAP_ISTANBUL) -i build/coverage/coverage.json -o build/coverage/summary -t text-summary
	@cat build/coverage/summary && echo "\n"

release: all
	@$(CC) $(shell cat .cc.opts | xargs) --js $(SOURCE_BUILD_DIR)/ts/Bundle.js --js_output_file $(SOURCE_BUILD_DIR)/ts/Bundle.min.js
	@mkdir -p build/release
	@cp src/prod-index.html build/release/index.html
	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var s=fs.readFileSync('$(SOURCE_BUILD_DIR)/styl/main.css', o);\
		var j=fs.readFileSync('$(SOURCE_BUILD_DIR)/ts/Bundle.min.js', o);\
		var i=fs.readFileSync('build/release/index.html', o);\
		fs.writeFileSync('build/release/index.html', i.replace('{COMPILED_CSS}', s).replace('{COMPILED_JS}', j), o);"

browser: all
	@$(ROLLUP) --config rollup.config.browser.js

# VPaths

vpath %.ts $(SOURCE_DIR)/ts $(TEST_DIR)
vpath %.html $(SOURCE_DIR)/html
vpath %.json $(SOURCE_DIR)/json
vpath %.styl $(SOURCE_DIR)/styl
vpath %.xml $(SOURCE_DIR)/xml

# Implicit rules

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

$(TEST_BUILD_DIR)/Integration.js:
	@echo $(INTEGRATION_TESTS) | sed "s/test\\//import '/g" | sed "s/\.ts/';/g" > $@

$(TEST_BUILD_DIR)/IntegrationBundle.js: $(TEST_BUILD_DIR)/Integration.js $(INTEGRATION_TEST_TARGETS)
	@$(ROLLUP) --config rollup.config.test.integration.js

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

watch: all
	parallel --ungroup --tty --jobs 0 ::: \
		"$(TYPESCRIPT) --project tsconfig.json --watch --preserveWatchOutput" \
		"$(ROLLUP) --watch --config rollup.config.all.js"

start-server:
	@test ! -f server.pid && { nohup python3 -m http.server 8000 >/dev/null 2>&1 & echo $$! > server.pid; } || true

stop-server:
	@test -f server.pid && kill $$(cat server.pid) && rm server.pid || true
