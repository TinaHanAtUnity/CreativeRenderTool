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
import { AndroidVideoAdUnitController } from 'AdUnits/AndroidVideoAdUnitController';
import { IosVideoAdUnitController } from 'AdUnits/IosVideoAdUnitController';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Platform } from 'Constants/Platform';

describe('EndScreenEventHandlersTest', () => {

    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController, overlay: Overlay, endScreen: EndScreen;
    let sessionManager: SessionManager;
    let performanceAdUnit: PerformanceAdUnit;

    describe('with onDownloadAndroid', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            });

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

            videoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, TestFixtures.getPlacement(), <Campaign>{
                getVideoUrl: () => 'fake url',
                getAppStoreId: () => 'fooAppId',
                getClickAttributionUrlFollowsRedirects: () => true
            }, overlay, null);

            performanceAdUnit = new PerformanceAdUnit(nativeBridge, videoAdUnitController, endScreen);
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
                let response = TestFixtures.getOkNativeResponse();
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

            videoAdUnitController = new IosVideoAdUnitController(nativeBridge, TestFixtures.getPlacement(), <Campaign>{
                getVideoUrl: () => 'fake url',
                getAppStoreId: () => '1appId1',
                getClickAttributionUrlFollowsRedirects: () => true,
                getBypassAppSheet: () => false
            }, overlay, null);

            performanceAdUnit = new PerformanceAdUnit(nativeBridge, videoAdUnitController, endScreen);
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
                let response = TestFixtures.getOkNativeResponse();
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
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://itunes.apple.com/app/id1appId1');
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
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://itunes.apple.com/app/id1appId1');
            });

        });


    });

});
