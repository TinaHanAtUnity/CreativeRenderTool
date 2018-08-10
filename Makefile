# Options

MAKEFLAGS += -rR

# Binaries

BIN := node_modules/.bin
CONCURRENTLY := $(BIN)/concurrently
TYPESCRIPT := $(BIN)/tsc
MOCHA := $(BIN)/_mocha
TSLINT := $(BIN)/tslint
STYLUS := $(BIN)/stylus
ROLLUP := $(BIN)/rollup
NYC := $(BIN)/nyc
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
TESTS := $(shell find $(TEST_DIR) -type f -name '*Test.ts' -and -not -name '*.d.ts')

# Targets

TARGETS := $(addprefix $(BUILD_DIR)/, \
			$(patsubst %.ts, %.js, \
			$(patsubst %.styl, %.css, \
			$(filter %.ts %.html %.json %.xml %.styl, $(SOURCES)))))
TARGETS += build/src/proto/unity_proto.js
TARGETS += build/src/html/admob/AFMAContainer.html

TEST_TARGETS := $(addprefix $(BUILD_DIR)/, $(patsubst %.ts, %.js, $(filter %.ts, $(TESTS))))

# Built-in targets

.PHONY: all test test-coverage release clean lint setup watch start-server
.NOTPARALLEL: $(TARGETS) $(TEST_TARGETS)

# Main targets

all: $(TARGETS) $(TEST_TARGETS)
	@$(ROLLUP) --config

test: build/test/Bundle.js start-server
	@node test-utils/headless_runner.js

test-coverage: all
	@NODE_PATH=$(SOURCE_BUILD_DIR):$(SOURCE_BUILD_DIR)/ts:$(TEST_BUILD_DIR) $(NYC) $(MOCHA) --opts .mocha.opts $(TEST_TARGETS)

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

$(TEST_BUILD_DIR)/All.js: all
	@echo $(TESTS) | sed "s/test\\//require('/g" | sed "s/\.ts/');/g" > $@

$(TEST_BUILD_DIR)/Bundle.js: $(TEST_BUILD_DIR)/All.js
	@$(ROLLUP) --config rollup.config.test.js

%::
	$(warning No rule specified for target "$@")

# Directory rules

$(filter %.js, $(TARGETS)): | $(SOURCE_BUILD_DIR)/ts
$(filter %.html, $(TARGETS)): | $(SOURCE_BUILD_DIR)/html
$(filter %.xml, $(TARGETS)): | $(SOURCE_BUILD_DIR)/xml
$(filter %.json, $(TARGERS)): | $(SOURCE_BUILD_DIR)/json
$(filter %.css, $(TARGETS)): | $(SOURCE_BUILD_DIR)/styl

# Helper targets

clean:
	@rm -rf $(BUILD_DIR)

lint:
	@$(TSLINT) --project tsconfig.json $(filter %.ts, $(SOURCES)) $(filter %.ts, $(TESTS))

setup: clean
	@rm -rf node_modules
	@npm install

watch:
	@$(TSC) --project tsconfig.json --watch

start-server:
	@python3 -m http.server 8000 & echo $$! > server.pid

stop-server:
	@kill $$(cat server.pid)
