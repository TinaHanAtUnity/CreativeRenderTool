import 'mocha';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { MRAIDWebViewTopCalculator } from 'MRAID/Views/MRAIDWebViewTopCalculator';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';

describe('MRAIDWebViewTopCalculator', () => {
    let platform: Platform;

    describe('Getting Top position', () => {
        describe('When device is Android', () => {
            let mraidViewSizer: MRAIDWebViewTopCalculator;
            let deviceInfo: AndroidDeviceInfo;

            const getAndroidViewSize = (size: number, density: number) => {
                return size * (density / 160);
            };

            const getScreenDensity = () => {
                return deviceInfo.getScreenDensity();
            };

            beforeEach(() => {
                platform = Platform.ANDROID;
                const backend = TestFixtures.getBackend(platform);
                const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                const core = TestFixtures.getCoreApi(nativeBridge);

                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                mraidViewSizer = new MRAIDWebViewTopCalculator(deviceInfo, platform);
            });

            it('should scale for landscape', () => {
                const width = 800;
                const height = 600;

                const value = Math.floor(getAndroidViewSize(height / 25, getScreenDensity()));

                assert.equal(mraidViewSizer.getTopPosition(width, height), value);
            });

            it('should scale for portrait', () => {
                const width = 600;
                const height = 800;

                const value = Math.floor(getAndroidViewSize(height / 40, getScreenDensity()));

                assert.equal(mraidViewSizer.getTopPosition(width, height), value);
            });
        });

        describe('When device is iPhone', () => {
            let mraidViewSizer: MRAIDWebViewTopCalculator;
            let deviceInfo: IosDeviceInfo;

            beforeEach(() => {
                platform = Platform.IOS;
                const backend = TestFixtures.getBackend(platform);
                const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                const core = TestFixtures.getCoreApi(nativeBridge);

                deviceInfo = TestFixtures.getIosDeviceInfo(core);
                mraidViewSizer = new MRAIDWebViewTopCalculator(deviceInfo, platform);
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
            let mraidViewSizer: MRAIDWebViewTopCalculator;
            let deviceInfo: IosDeviceInfo;

            beforeEach(() => {
                platform = Platform.IOS;
                const backend = TestFixtures.getBackend(platform);
                const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                const core = TestFixtures.getCoreApi(nativeBridge);

                deviceInfo = TestFixtures.getIosDeviceInfo(core);
                mraidViewSizer = new MRAIDWebViewTopCalculator(deviceInfo, platform);
            });

            it('should scale for landscape', () => {
                const width = 812;
                const height = 375;

                assert.equal(mraidViewSizer.getTopPosition(width, height), 41.25);
            });

            it('should scale for portrait', () => {
                const width = 375;
                const height = 812;

                assert.equal(mraidViewSizer.getTopPosition(width, height), 89.32000000000001);
            });
        });
    });
});
