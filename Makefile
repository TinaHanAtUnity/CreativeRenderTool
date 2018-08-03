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
			$(filter %.ts %.html %.json %.xml %.styl, $(SOURCES))))))

TEST_TARGETS := $(addprefix $(BUILD_DIR)/, $(patsubst %.ts, %.js, $(filter %.ts, $(TESTS))))

# Built-in targets

.PHONY: all test test-coverage release clean lint setup watch
.NOTPARALLEL: $(TARGETS) $(TEST_TARGETS)

# Main targets

all: $(TARGETS) $(TEST_TARGETS)

test: all
	@NODE_PATH=$(SOURCE_BUILD_DIR):$(SOURCE_BUILD_DIR)/ts:$(TEST_BUILD_DIR) $(MOCHA) --opts .mocha.opts test-utils/node_runner.js

test-coverage: all
	@NODE_PATH=$(SOURCE_BUILD_DIR):$(SOURCE_BUILD_DIR)/ts:$(TEST_BUILD_DIR) $(NYC) $(MOCHA) --opts .mocha.opts $(TEST_TARGETS)

release: all
	@$(ROLLUP) --config
	@$(CC) $(shell xargs -a .cc.opts) --js $(SOURCE_BUILD_DIR)/ts/Device.js --js_output_file $(SOURCE_BUILD_DIR)/ts/Device.min.js

# VPaths

vpath %.ts $(SOURCE_DIR)/ts $(TEST_DIR)
vpath %.html $(SOURCE_DIR)/html
vpath %.json $(SOURCE_DIR)/json
vpath %.styl $(SOURCE_DIR)/styl
vpath %.xml $(SOURCE_DIR)/xml

# Implicit rules

$(SOURCE_BUILD_DIR)/ts/%.js: %.ts
	$(TYPESCRIPT) --project tsconfig.json

$(SOURCE_BUILD_DIR)/html/%.html: %.html
	@mkdir -p $(dir $@) && cp $< $@

$(SOURCE_BUILD_DIR)/json/%.json: %.json
	@mkdir -p $(dir $@) && cp $< $@

$(SOURCE_BUILD_DIR)/xml/%.xml: %.xml
	@mkdir -p $(dir $@) && cp $< $@

$(SOURCE_BUILD_DIR)/styl/%.css: %.styl
	@mkdir -p $(dir $@) && $(STYLUS) -o $(SOURCE_BUILD_DIR)/styl -u autoprefixer-stylus --compress --inline --with '{limit: false}' $<

$(TEST_BUILD_DIR)/ts/%.js: %.ts
	@$(TYPESCRIPT) --project tsconfig.json

%::
	$(warning No rule specified for target "$@")

# Directory rules

$(filter %.js, $(TARGETS)): | $(SOURCE_BUILD_DIR)/ts
$(filter %.html, $(TARGETS)): | $(SOURCE_BUILD_DIR)/html
$(filter %.xml, $(TARGETS)): | $(SOURCE_BUILD_DIR)/xml
$(filter %.json, $(TARGERS)): | $(SOURCE_BUILD_DIR)/json
$(filter %.css, $(TARGETS)): | $(SOURCE_BUILD_DIR)/styl

$(filter %.js, $(TEST_TARGETS)): | $(TEST_BUILD_DIR)/ts

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
