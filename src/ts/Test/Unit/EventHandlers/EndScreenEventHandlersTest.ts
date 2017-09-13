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
import { WakeUpManager } from 'Managers/WakeUpManager';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { PerformanceCampaign, StoreName } from "Models/PerformanceCampaign";
import { MetaDataManager } from 'Managers/MetaDataManager';
import { Video } from 'Models/Assets/Video';
import { FocusManager } from 'Managers/FocusManager';

describe('EndScreenEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, container: AdUnitContainer, overlay: Overlay, endScreen: EndScreen;
    let sessionManager: SessionManager;
    let performanceAdUnit: PerformanceAdUnit;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;

    describe('with onDownloadAndroid', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            }, Platform.ANDROID);

            focusManager = new FocusManager(nativeBridge);
            container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
            overlay = <Overlay><any> {
                setSkipEnabled: sinon.spy(),
                setSkipDuration: sinon.spy(),
                show: sinon.spy(),
            };

            endScreen = <EndScreen><any> {
                hide: sinon.spy(),
            };

            metaDataManager = new MetaDataManager(nativeBridge);

            sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge),
                new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager))), metaDataManager);

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);
            sinon.spy(nativeBridge.Intent, 'launch');

            performanceAdUnit = new PerformanceAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(),
                TestFixtures.getCampaign(), new Video(''), overlay, TestFixtures.getDeviceInfo(Platform.ANDROID), null, endScreen);
        });

        it('should send a click with session manager', () => {
            EndScreenEventHandlers.onDownloadAndroid(nativeBridge, sessionManager, performanceAdUnit);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendClick, performanceAdUnit);
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                performanceAdUnit = new PerformanceAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(),
                    TestFixtures.getCampaignFollowsRedirects(), new Video(''), overlay, TestFixtures.getDeviceInfo(Platform.ANDROID), null, endScreen);

                sinon.stub(sessionManager.getEventManager(), 'clickAttributionEvent').returns(Promise.resolve({
                    url: 'http://foo.url.com',
                    response: 'foo response',
                    responseCode: 200,
                    headers: [['location', 'market://foobar.com']]
                }));

                EndScreenEventHandlers.onDownloadAndroid(nativeBridge, sessionManager, performanceAdUnit);

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'market://foobar.com'
                    });
                });
            });

            it('with response that does not contain location, it should not launch intent', () => {
                performanceAdUnit = new PerformanceAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(),
                    TestFixtures.getCampaignFollowsRedirects(), new Video(''), overlay, TestFixtures.getDeviceInfo(Platform.ANDROID), null, endScreen);

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
                sinon.stub(<PerformanceCampaign> performanceAdUnit.getCampaign(), 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(<PerformanceCampaign> performanceAdUnit.getCampaign(), 'getStore').returns(StoreName.GOOGLE);
                EndScreenEventHandlers.onDownloadAndroid(nativeBridge, sessionManager, performanceAdUnit);

            });

            it('should send a click with session manager', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendClick, performanceAdUnit);
            });

            it('should launch market view', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'market://details?id=com.iUnity.angryBots'
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

            container = new ViewController(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS), focusManager);

            overlay = <Overlay><any> {
                setSkipEnabled: sinon.spy(),
                setSkipDuration: sinon.spy(),
                show: sinon.spy(),
            };

            endScreen = <EndScreen><any> {
                hide: sinon.spy(),
            };

            sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge),
                new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager))), metaDataManager);

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);
            sinon.spy(nativeBridge.UrlScheme, 'open');

            const campaign = TestFixtures.getCampaign();
            campaign.set('store', StoreName.APPLE);
            campaign.set('appStoreId', '11111');
            performanceAdUnit = new PerformanceAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(),
                campaign, new Video(''), overlay, TestFixtures.getDeviceInfo(Platform.IOS), null, endScreen);
        });

        it('should send a click with session manager', () => {
            deviceInfo = <DeviceInfo><any>{getOsVersion: () => '9.0'};
            EndScreenEventHandlers.onDownloadIos(nativeBridge, sessionManager, performanceAdUnit, deviceInfo);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendClick, performanceAdUnit);
        });

        describe('with follow redirects', () => {
            deviceInfo = <DeviceInfo><any>{getOsVersion: () => '9.0'};
            it('with response that contains location, it should open url scheme', () => {
                const campaign = TestFixtures.getCampaignFollowsRedirects();
                campaign.set('store', StoreName.APPLE);
                performanceAdUnit = new PerformanceAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(),
                    campaign, new Video(''), overlay, TestFixtures.getDeviceInfo(Platform.IOS), null, endScreen);

                sinon.stub(sessionManager.getEventManager(), 'clickAttributionEvent').returns(Promise.resolve({
                    url: 'http://foo.url.com',
                    response: 'foo response',
                    responseCode: 200,
                    headers: [['location', 'appstore://foobar.com']]
                }));

                EndScreenEventHandlers.onDownloadIos(nativeBridge, sessionManager, performanceAdUnit, deviceInfo);

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'appstore://foobar.com');
                });
            });

            it('with response that does not contain location, it should not call open', () => {
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
                sinon.stub(<PerformanceCampaign> performanceAdUnit.getCampaign(), 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(<PerformanceCampaign> performanceAdUnit.getCampaign(), 'getBypassAppSheet').returns(false);
                sinon.stub(<PerformanceCampaign> performanceAdUnit.getCampaign(), 'getStore').returns(StoreName.APPLE);

                EndScreenEventHandlers.onDownloadIos(nativeBridge, sessionManager, performanceAdUnit, deviceInfo);

            });

            it('should launch app store view', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
            });

        });

        describe('with no follow redirects and bypass app sheet', () => {
            beforeEach(() => {
                deviceInfo = <DeviceInfo><any>{getOsVersion: () => '9.0'};
                sinon.stub(<PerformanceCampaign> performanceAdUnit.getCampaign(), 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(<PerformanceCampaign> performanceAdUnit.getCampaign(), 'getBypassAppSheet').returns(true);
                sinon.stub(<PerformanceCampaign> performanceAdUnit.getCampaign(), 'getStore').returns(StoreName.APPLE);

                EndScreenEventHandlers.onDownloadIos(nativeBridge, sessionManager, performanceAdUnit, deviceInfo);

            });

            it('should launch app store view', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
            });

        });

        describe('open app sheet', () => {
            beforeEach(() => {
                deviceInfo = <DeviceInfo><any>{getOsVersion: () => '9.0'};
                sinon.stub(<PerformanceCampaign> performanceAdUnit.getCampaign(), 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(<PerformanceCampaign> performanceAdUnit.getCampaign(), 'getBypassAppSheet').returns(false);
                sinon.stub(nativeBridge.AppSheet, 'canOpen').returns(Promise.resolve(true));
                EndScreenEventHandlers.onDownloadIos(nativeBridge, sessionManager, performanceAdUnit, deviceInfo);
            });

            it('should open app sheet', () => {
                const resolved = Promise.resolve();
                sinon.stub(nativeBridge.AppSheet, 'present').returns(resolved);
                sinon.spy(nativeBridge.AppSheet, 'destroy');

                return new Promise((resolve, reject) => setTimeout(resolve, 500)).then(() => {
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
