import 'mocha';
import * as sinon from 'sinon';

import { EndScreenEventHandlers } from 'EventHandlers/EndScreenEventHandlers';
import { NativeBridge } from 'Native/NativeBridge';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { DeviceInfo } from 'Models/DeviceInfo';
import { EventManager } from 'Managers/EventManager';
import { Request, INativeResponse } from 'Utilities/Request';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { Campaign } from 'Models/Campaign';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Platform } from 'Constants/Platform';
import { AdUnit } from 'Utilities/AdUnit';
import { AndroidAdUnit } from 'Utilities/AndroidAdUnit';
import { IosAdUnit } from 'Utilities/IosAdUnit';

describe('EndScreenEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, adUnit: AdUnit, videoAdUnitController: VideoAdUnitController, overlay: Overlay, endScreen: EndScreen;
    let sessionManager: SessionManager;
    let performanceAdUnit: PerformanceAdUnit;

    describe('with onDownloadAndroid', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            });

            adUnit = new AndroidAdUnit(nativeBridge, TestFixtures.getDeviceInfo());
            overlay = <Overlay><any> {
                setSkipEnabled: sinon.spy(),
                setSkipDuration: sinon.spy(),
                show: sinon.spy(),
            };

            endScreen = <EndScreen><any> {
                hide: sinon.spy(),
            };

            sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge),
                new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge))));

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);
            sinon.spy(nativeBridge.Intent, 'launch');

            videoAdUnitController = new VideoAdUnitController(nativeBridge, adUnit, TestFixtures.getPlacement(), <Campaign>{
                getVideoUrl: () => 'fake url',
                getAppStoreId: () => 'fooAppId',
                getClickAttributionUrlFollowsRedirects: () => true
            }, TestFixtures.getDeviceInfo(Platform.ANDROID), overlay, null);

            performanceAdUnit = new PerformanceAdUnit(nativeBridge, adUnit, videoAdUnitController, endScreen);
        });

        it('should send a click with session manager', () => {
            EndScreenEventHandlers.onDownloadAndroid(nativeBridge, sessionManager, performanceAdUnit);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendClick, performanceAdUnit);
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                EndScreenEventHandlers.onDownloadAndroid(nativeBridge, sessionManager, performanceAdUnit);

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'http://foobar.com'
                    });
                });
            });

            it('with response that does not contain location, it should throw error', () => {
                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                (<sinon.SinonSpy>sessionManager.sendClick).restore();
                sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);

                EndScreenEventHandlers.onDownloadAndroid(nativeBridge, sessionManager, performanceAdUnit);

                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Intent.launch);
                });
            });

        });

        describe('with no follow redirects', () => {
            beforeEach(() => {
                sinon.stub(performanceAdUnit.getCampaign(), 'getClickAttributionUrlFollowsRedirects').returns(false);

                EndScreenEventHandlers.onDownloadAndroid(nativeBridge, sessionManager, performanceAdUnit);

            });

            it('should send a click with session manager', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendClick, performanceAdUnit);
            });

            it('should launch market view', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'market://details?id=fooAppId'
                });
            });

        });

    });

    describe('with onDownloadIos', () => {
        let resolvedPromise: Promise<INativeResponse>;
        let deviceInfo: DeviceInfo;

        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            }, Platform.IOS);

            adUnit = new IosAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS));

            overlay = <Overlay><any> {
                setSkipEnabled: sinon.spy(),
                setSkipDuration: sinon.spy(),
                show: sinon.spy(),
            };

            endScreen = <EndScreen><any> {
                hide: sinon.spy(),
            };

            sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge),
                new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge))));

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);
            sinon.spy(nativeBridge.UrlScheme, 'open');

            videoAdUnitController = new VideoAdUnitController(nativeBridge, adUnit, TestFixtures.getPlacement(), <Campaign>{
                getVideoUrl: () => 'fake url',
                getAppStoreId: () => '11111',
                getClickAttributionUrlFollowsRedirects: () => true,
                getBypassAppSheet: () => false,
                getClickAttributionUrl: () => ''
            }, TestFixtures.getDeviceInfo(Platform.IOS), overlay, null);

            performanceAdUnit = new PerformanceAdUnit(nativeBridge, adUnit, videoAdUnitController, endScreen);
        });

        it('should send a click with session manager', () => {
            deviceInfo = <DeviceInfo><any>{getOsVersion: () => '9.0'};
            EndScreenEventHandlers.onDownloadIos(nativeBridge, sessionManager, performanceAdUnit, deviceInfo);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendClick, performanceAdUnit);
        });

        describe('with follow redirects', () => {
            deviceInfo = <DeviceInfo><any>{getOsVersion: () => '9.0'};
            it('with response that contains location, it should open url scheme', () => {
                EndScreenEventHandlers.onDownloadIos(nativeBridge, sessionManager, performanceAdUnit, deviceInfo);

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'http://foobar.com');
                });
            });

            it('with response that does not contain location, it should throw error', () => {
                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                (<sinon.SinonSpy>sessionManager.sendClick).restore();
                sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);

                EndScreenEventHandlers.onDownloadIos(nativeBridge, sessionManager, performanceAdUnit, deviceInfo);

                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.UrlScheme.open);
                });
            });

        });

        describe('with no follow redirects and OS version 8.1', () => {
            beforeEach(() => {
                deviceInfo = <DeviceInfo><any>{getOsVersion: () => '8.1'};
                sinon.stub(performanceAdUnit.getCampaign(), 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(performanceAdUnit.getCampaign(), 'getBypassAppSheet').returns(false);

                EndScreenEventHandlers.onDownloadIos(nativeBridge, sessionManager, performanceAdUnit, deviceInfo);

            });

            it('should launch app store view', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
            });

        });

        describe('with no follow redirects and bypass app sheet', () => {
            beforeEach(() => {
                deviceInfo = <DeviceInfo><any>{getOsVersion: () => '9.0'};
                sinon.stub(performanceAdUnit.getCampaign(), 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(performanceAdUnit.getCampaign(), 'getBypassAppSheet').returns(true);

                EndScreenEventHandlers.onDownloadIos(nativeBridge, sessionManager, performanceAdUnit, deviceInfo);

            });

            it('should launch app store view', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
            });

        });

        describe('open app sheet', () => {
            beforeEach(() => {
                deviceInfo = <DeviceInfo><any>{getOsVersion: () => '9.0'};
                sinon.stub(performanceAdUnit.getCampaign(), 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(performanceAdUnit.getCampaign(), 'getBypassAppSheet').returns(false);
                sinon.stub(nativeBridge.AppSheet, 'canOpen').returns(Promise.resolve(true));
                EndScreenEventHandlers.onDownloadIos(nativeBridge, sessionManager, performanceAdUnit, deviceInfo);

            });

            it('should open app sheet', () => {
                const resolved = Promise.resolve();
                sinon.stub(nativeBridge.AppSheet, 'present').returns(resolved);
                sinon.spy(nativeBridge.AppSheet, 'destroy');

                resolved.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.AppSheet.present, {id: 11111});
                    sinon.assert.called(<sinon.SinonSpy>nativeBridge.AppSheet.destroy);

                });
            });

            it('should send a click with session manager', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendClick, performanceAdUnit);
            });

        });

    });
});
