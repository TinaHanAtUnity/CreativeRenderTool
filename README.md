# Unity Ads Webview 
[![Coverage Status](https://coveralls.io/repos/github/Applifier/unity-ads-webview/badge.svg?branch=master&t=bvxjyR)](https://coveralls.io/github/Applifier/unity-ads-webview?branch=master)

## Requirements

- Node (`brew install node`) (Latest or at least Node 6+)

### Optional

- Python (`brew install python3`)
- nginx (`brew install nginx`)
- Watchman (`brew install watchman`)
- exiftool (`brew install exiftool`) for integration tests

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

### Development Build

- `make build-dev`

To build and test continuously (on file changes), use:

- `make watch`

### Running development builds

- Change SDK configuration URL to point to local build (`http://LOCAL_IP:LOCAL_PORT/build/dev/config.json`)
- Change webview development config to point to local build (is done automagically by `make build-dev`) (`http://LOCAL_IP:LOCAL_PORT/build/dev/index.html`)
- Start local web server in project root (`make start-nginx`)

## Testing

### Local tests

- `make test`

### Hybrid tests

- Change SDK configuration URL to point to local build (`http://LOCAL_IP:LOCAL_PORT/build/test/config.json`)
- Change webview test config (src/test-config.json) to point to local build (`http://LOCAL_IP:LOCAL_PORT/build/test/index.html`)
- `make build-test`
- Run hybrid test suite from the SDK

### Browser build tests

- `make clean build-browser start-nginx`
- `make test-browser`

#### Hybrid tests triggered with github webhook
http://qa-jenkins.us-east-1.applifier.info:8080/job/unity-ads-sdk2-ios-hybrid-tests-webview-webhook/

Tests can also be launched manually: http://qa-jenkins.us-east-1.applifier.info:8080/job/unity_ads_sdk2_ios_hybrid_tests/build

### Deployment tests

#### Android
http://qa-jenkins.us-east-1.applifier.info:8080/job/unity-ads-webview-deploy-test-android-api/

Results: http://qa-jenkins.us-east-1.applifier.info:8080/job/unity-ads-sdk2-systests-android/


#### iOS
http://qa-jenkins.us-east-1.applifier.info:8080/job/unity-ads-webview-deploy-test-ios-api/

Results: http://qa-jenkins.us-east-1.applifier.info:8080/job/unity-ads-sdk2-systests-iOS/

#### Running deployment tests

Follow the link for desired platform -> Build with Parameters -> Build. This job will start system test jobs, that run tests on real device in Testdroid cloud. The job iterates over all webview git branches with prefix 'origin/staging/', so staging branches must be deployed in order to run tests. Each found staging branch will result in a job under 'Results' link above.
