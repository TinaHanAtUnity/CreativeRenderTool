import 'mocha';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { WebViewTopCalculator } from 'Ads/Utilities/WebPlayer/WebViewTopCalculator';

describe('MRAIDWebViewTopCalculator', () => {
    describe('When device is Android', () => {
        let mraidViewSizer: WebViewTopCalculator;

        beforeEach(() => {
            const platform = Platform.ANDROID;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);

            const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            mraidViewSizer = new WebViewTopCalculator(deviceInfo, platform);
        });

        it('should scale for landscape', () => {
            const width = 800;
            const height = 600;

            assert.equal(mraidViewSizer.getTopPosition(width, height), 48);
        });

        it('should scale for portrait', () => {
            const width = 600;
            const height = 800;

            assert.equal(mraidViewSizer.getTopPosition(width, height), 40);
        });
    });

    describe('When device is iPhone', () => {
        let mraidViewSizer: WebViewTopCalculator;

        beforeEach(() => {
            const platform = Platform.IOS;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);

            const deviceInfo = TestFixtures.getIosDeviceInfo(core);
            mraidViewSizer = new WebViewTopCalculator(deviceInfo, platform);
        });

        it('should scale for landscape', () => {
            const width = 800;
            const height = 600;

            assert.equal(mraidViewSizer.getTopPosition(width, height), 66);
        });
        it('should scale for portrait', () => {
            const width = 600;
            const height = 800;

            assert.equal(mraidViewSizer.getTopPosition(width, height), 48);
        });
    });

    describe('When device is iPhoneX', () => {
        let mraidViewSizer: WebViewTopCalculator;

        beforeEach(() => {
            const platform = Platform.IOS;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);

            const deviceInfo = TestFixtures.getIosDeviceInfo(core);
            mraidViewSizer = new WebViewTopCalculator(deviceInfo, platform);
        });

        it('should scale for landscape', () => {
            const width = 812;
            const height = 375;

            assert.equal(mraidViewSizer.getTopPosition(width, height), 41.25);
        });

        it('should scale for portrait', () => {
            const width = 375;
            const height = 812;

            assert.equal(Math.round(mraidViewSizer.getTopPosition(width, height)), 89);
        });
    });
});
