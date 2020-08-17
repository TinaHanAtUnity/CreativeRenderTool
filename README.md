# Unity Ads Webview

## Requirements

- Node (`brew install node`) (Latest or at least Node 6+)
- Parallel (`brew install parallel`) for running things in parallel
- Python (`brew install python3`) for the local webserver
- Watchman (`brew install watchman`) for watching tests
- exiftool (`brew install exiftool`) for integration tests
- hub (`brew install hub`) for release scripts

### Optional

- segno (`pip install segno`) for qr code generation

## IDE

### WebStorm

1. Configure directories (Preferences -> Project: unity-ads-webview -> Directories)
	- Exclude
		1. .idea
		2. build
		3. node_modules
	- Tests
		1. test
		2. test-utils
2. Configure TypeScript (Preferences -> Languages & Frameworks -> TypeScript)
	1. Enable TypeScript
	2. Change compiler to use TypeScript installation from your project directory `node_modules/typescript/lib`
	3. Switch to use `tsconfig.json`
3. Enable TSLint (Preferences -> Languages & Frameworks -> TypeScript -> TSLint)
	1. Change TSLint package to use TSLint installation from your project directory `node_modules/tslint`

## Building

### Dependencies

- `make setup`

### Browser Build

Build for the browser:

- `make build-browser`

Or to build continuously (on file changes), use:

- `make watch-browser`

To serve the build use: 

- `make start-server`

Navigate to: http://localhost:8000/build/browser/

Suggested testing browser is Google Chrome

### Development Build

- `make build-dev`

If you need to develop on legacy devices that do not support ES6, use the following:

- `MINIFY=1 make build-dev`

To build continuously (on file changes), use:

- `make watch-dev`

### Running development builds

- Change SDK configuration URL to point to local build (`http://LOCAL_IP:LOCAL_PORT/build/dev/config.json`)
  >**iOS:** change the return url of `getDefaultConfigUrl()` in [USRVSdkProperties.m](https://github.com/Applifier/unity-ads-ios/blob/master/UnityServices/Core/Properties/USRVSdkProperties.m)

  >**Android:** change the return url of `getDefaultConfigUrl()` in [SdkProperties.java](https://github.com/Applifier/unity-ads-android/blob/master/lib/src/main/java/com/unity3d/services/core/properties/SdkProperties.java)
- Change webview development config to point to local build (is done automagically by `make build-dev`) (`http://LOCAL_IP:LOCAL_PORT/build/dev/index.html`)
- Start local web server in project root (`make start-server`)

### Adding new icon
 **Add icon to existing font file**
 - Copy the svg file into an existing src/fonts/* folder
 - `make build-fonts`

 **Create new font file**
 - Create a new folder under src/fonts and copy the svg file(s) into the folder
 - Modify tools/generate_fonts.js to include the newly added folder
 - `make build-fonts`

`make build-fonts` will generate svg, ttf, and woff files in src/fonts/*/generated and styl file in src/styl/generated

## Testing

### Local tests

- `make test` for both unit and integration tests
- `make test-unit`
- `make test-integration`
- `npm run test` for jest tests

To watch tests, use:

- `make watch-test`
- `TEST_FILTER=ObservableTest make watch-test`

To debug tests (opens a browser running the tests and pauses it immediately), use:

- `DEBUG=1 make test`

To filter what tests are being run, use:

- `TEST_FILTER=<RegExp> make test`

Or combine both:

- `DEBUG=1 TEST_FILTER=ObservableTest make test-unit`

### Test coverage

- `make test-coverage` will generate a coverage report at `build/coverage/index.html`

### Hybrid tests

- Change SDK configuration URL to point to local build (`http://LOCAL_IP:LOCAL_PORT/build/test/config.json`)
- Change webview test config (src/test-config.json) to point to local build (`http://LOCAL_IP:LOCAL_PORT/build/test/index.html`)
- `make build-test`
- Run hybrid test suite from the SDK

#### Automatic builds for Android

https://jenkins.prd.mz.internal.unity3d.com/job/Applifier/job/unity-ads-sdk-tests/job/ads-sdk-hybrid-test-android/

#### Automatic builds for iOS

https://jenkins.prd.mz.internal.unity3d.com/job/Applifier/job/unity-ads-sdk-tests/job/ads-sdk-hybrid-test-ios/

### Browser build tests

- `make build-browser start-server`
- `node test-utils/headless.js`

### Deployment tests

#### Android
https://jenkins.prd.mz.internal.unity3d.com/job/Applifier/job/unity-ads-sdk-tests/job/ads-sdk-systest-android/

#### iOS
https://jenkins.prd.mz.internal.unity3d.com/job/Applifier/job/unity-ads-sdk-tests/job/ads-sdk-systest-ios/

