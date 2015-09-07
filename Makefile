# Binaries
TYPESCRIPT = node_modules/.bin/tsc
REQUIREJS = node_modules/.bin/r.js
STYLUS = node_modules/.bin/stylus

# Sources
TS_SRC = src/ts
STYL_SRC = src/styl
HTML_SRC = src/prod-index.html

# Targets
BUILD_DIR = build

clean:
	rm -rf build

build: clean
	@echo Compiling .ts to .js
	$(TYPESCRIPT) --module amd --target ES5 --outDir $(BUILD_DIR)/js `find $(TS_SRC) -type f -name *.ts | xargs`

	@echo Bundling .js files
	$(REQUIREJS) -o config/requirejs/release.js

	@echo Compiling .styl to .css
	$(STYLUS) -o $(BUILD_DIR)/main.css -c $(STYL_SRC)

	@echo Copying production index.html to build
	cp $(HTML_SRC) $(BUILD_DIR)/index.html

	@echo Inlining CSS and JS
	node -e "\
		var fs=require('fs');\
		var o={encoding:'utf-8'};\
		var s=fs.readFileSync('$(BUILD_DIR)/main.css', o);\
		var j=fs.readFileSync('$(BUILD_DIR)/main.js', o);\
		var i=fs.readFileSync('$(BUILD_DIR)/index.html', o);\
		fs.writeFileSync('$(BUILD_DIR)/index.html', i.replace('{COMPILED_CSS}', s).replace('{COMPILED_JS}', j), o);"