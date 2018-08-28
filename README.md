# Unity Ads Webview 

## Requirements

- Node (`brew install node`) (Latest or at least Node 6+)
- Parallel (`brew install parallel`) for running things in parallel
- Python (`brew install python3`) for the local webserver
- Watchman (`brew install watchman`) for watching tests
- exiftool (`brew install exiftool`) for integration tests

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

- `make build-browser`

Suggested testing browser is Google Chrome

To build continuously (on file changes), use:

- `make watch-browser`

### Development Build

- `make build-dev`

To build continuously (on file changes), use:

- `make watch-dev`

### Running development builds

- Change SDK configuration URL to point to local build (`http://LOCAL_IP:LOCAL_PORT/build/dev/config.json`)
  >**iOS:** change the return url of `getDefaultConfigUrl()` in [UADSSdkProperties.m](https://github.com/Applifier/unity-ads-ios/blob/master/UnityAds/Properties/UADSSdkProperties.m)
 
  >**Android:** change the return url of `getDefaultConfigUrl()` in [SdkProperties.java](https://github.com/Applifier/unity-ads-android/blob/master/lib/src/main/java/com/unity3d/ads/properties/SdkProperties.java)
- Change webview development config to point to local build (is done automagically by `make build-dev`) (`http://LOCAL_IP:LOCAL_PORT/build/dev/index.html`)
- Start local web server in project root (`make start-server`)

## Testing

### Local tests

- `make test` for both unit and integration tests
- `make test-unit`
- `make test-integration`

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

http://qa-jenkins.us-east-1.applifier.info:8080/job/unity_ads_sdk2_android_hybrid_tests/

#### Automatic builds for iOS

http://qa-jenkins.us-east-1.applifier.info:8080/job/unity_ads_sdk2_ios_hybrid_tests/

### Browser build tests

- `make build-browser start-server`
- `node test-utils/headless.js`

### Deployment tests

#### iOS
http://qa-jenkins.us-east-1.applifier.info:8080/job/unity-ads-sdk2-systests-android-sans-webhook/

#### Android
http://qa-jenkins.us-east-1.applifier.info:8080/job/unity-ads-sdk2-systests-ios-sans-webhook/
