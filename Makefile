# Binaries
TYPESCRIPT = tsc
TSLINT = tslint
REQUIREJS = node_modules/.bin/r.js
STYLUS = node_modules/.bin/stylus

# Sources
TS_SRC = src/ts
STYL_SRC = src/styl
HTML_SRC = src/prod-index.html
CONFIG_SRC = src/config.json

# Targets
BUILD_DIR = build

build: build-ts build-js build-css
	@echo Copying production index.html to build
	cp $(HTML_SRC) $(BUILD_DIR)/index.html

	@echo Inlining CSS and JS
	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var s=fs.readFileSync('$(BUILD_DIR)/css/main.css', o);\
		var j=fs.readFileSync('$(BUILD_DIR)/main.js', o);\
		var i=fs.readFileSync('$(BUILD_DIR)/index.html', o);\
		fs.writeFileSync('$(BUILD_DIR)/index.html', i.replace('{COMPILED_CSS}', s).replace('{COMPILED_JS}', j), o);"

build-ts:
	@echo Compiling .ts to .js
	$(TYPESCRIPT) -p .

build-js:
	@echo Bundling .js files
	$(REQUIREJS) -o config/requirejs/release.js

build-css:
	@echo Compiling .styl to .css
	mkdir -p $(BUILD_DIR)/css
	$(STYLUS) -o $(BUILD_DIR)/css -c `find $(STYL_SRC) -name *.styl | xargs`

generate-config:
	@echo Copying production config.json to build
	cp $(CONFIG_SRC) $(BUILD_DIR)/config.json
	@echo Calculating build hash to config
	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var c=fs.readFileSync('$(BUILD_DIR)/config.json', o);\
		fs.writeFileSync('$(BUILD_DIR)/config.json', c.replace('{COMPILED_HASH}', '`cat $(BUILD_DIR)/index.html | openssl dgst -sha256 | sed 's/^.*= //'`'), o);"

clean:
	rm -rf build

lint:
	$(TSLINT) -c tslint.json `find src/ts -name *.ts | xargs`