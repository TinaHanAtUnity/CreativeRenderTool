# Unity Ads Webview

## Requirements

- Node (`brew install node`)
- TypeScript (`npm install -g typescript`)
- TSLint (`npm install -g tslint`)
- Typings (`npm install -g typings`)

### Optional

- Python (`brew install python3`)
- Watch (`brew install watch`)

## IDE

### WebStorm

1. Configure directories (Preferences -> Project: unity-ads-webview -> Directories)
	- Exclude
		1. .idea
		2. build
		3. node_modules
		4. typings
	- Tests
		1. test
		2. test-utils
2. Configure TypeScript (Preferences -> Languages & Frameworks -> TypeScript)
	1. Enable TypeScript
	2. Change compiler to /usr/local/lib/node_modules/typescript/lib
	3. Switch to use tsconfig.json
3. Enable TSLint (Preferences -> Languages & Frameworks -> TypeScript -> TSLint)

## Building

### Dependencies

- `npm install`
- `typings install --ambient`

### Development Build

- `make build-dev`

To build continuously (every 2s), use:

- `watch make build-dev`

### Running development builds

- Change SDK configuration URL to point to local build (http://LOCAL_IP:LOCAL_PORT/build/dev/config.json)
- Change webview development config to point to local build (http://LOCAL_IP:LOCAL_PORT/build/dev/index.html)
- Start local web server in project root (python3 -m http.server)

## Testing

### Local tests

- `make test`

### Hybrid tests

- Change SDK configuration URL to point to local build (http://LOCAL_IP:LOCAL_PORT/build/test/config.json)
- Change webview development config to point to local build (http://LOCAL_IP:LOCAL_PORT/build/test/index.html)
- `make build-test`
- Run hybrid test suite from the SDK

### Integration tests

- Change SDK configuration URL to point to local build (http://LOCAL_IP:LOCAL_PORT/build/release/config.json)
- Change webview development config to point to local build (http://LOCAL_IP:LOCAL_PORT/build/release/index.html)
- `make build-release`
- Run integration test suite from the SDK
