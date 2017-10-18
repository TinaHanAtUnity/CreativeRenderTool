import 'mocha';
import * as sinon from 'sinon';

import { IEndScreenDownloadParameters } from 'EventHandlers/EndScreenEventHandler';
import { NativeBridge } from 'Native/NativeBridge';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Request, INativeResponse } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { PerformanceCampaign, StoreName } from "Models/Campaigns/PerformanceCampaign";
import { MetaDataManager } from 'Managers/MetaDataManager';
import { Video } from 'Models/Assets/Video';
import { FocusManager } from 'Managers/FocusManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { PerformanceEndScreenEventHandler } from 'EventHandlers/PerformanceEndScreenEventHandler';

describe('EndScreenEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, container: AdUnitContainer, overlay: Overlay, endScreen: EndScreen;
    let sessionManager: SessionManager;
    let performanceAdUnit: PerformanceAdUnit;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let performanceAdUnitParameters: IPerformanceAdUnitParameters;
    let endScreenEventHandler: PerformanceEndScreenEventHandler;

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

            const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request = new Request(nativeBridge, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);

            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            sessionManager = new SessionManager(nativeBridge);
            operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
            sinon.spy(nativeBridge.Intent, 'launch');
            const video = new Video('');

            performanceAdUnitParameters = {
                forceOrientation: ForceOrientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: TestFixtures.getCampaign(),
                configuration: TestFixtures.getConfiguration(),
                request: request,
                options: {},
                endScreen: endScreen,
                overlay: overlay,
                video: video
            };

            performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
            endScreenEventHandler = new PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
        });

        it('should send a click with session manager', () => {
            endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                store: performanceAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
            });

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, performanceAdUnit);
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                performanceAdUnitParameters.campaign = TestFixtures.getCampaignFollowsRedirects();
                performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);

                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                    url: 'http://foo.url.com',
                    response: 'foo response',
                    responseCode: 200,
                    headers: [['location', 'market://foobar.com']]
                }));

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'market://foobar.com'
                    });
                });
            });

            it('with response that does not contain location, it should not launch intent', () => {
                performanceAdUnitParameters.campaign = TestFixtures.getCampaignFollowsRedirects();
                performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);

                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                (<sinon.SinonSpy>operativeEventManager.sendClick).restore();
                sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });

                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Intent.launch);
                });
            });

        });

        describe('with no follow redirects', () => {
            beforeEach(() => {
                sinon.stub(<PerformanceCampaign> performanceAdUnit.getCampaign(), 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(<PerformanceCampaign> performanceAdUnit.getCampaign(), 'getStore').returns(StoreName.GOOGLE);
                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });

            });

            it('should send a click with session manager', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, performanceAdUnit);
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

            const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request = new Request(nativeBridge, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.IOS);
            deviceInfo = TestFixtures.getDeviceInfo(Platform.IOS);

            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            sessionManager = new SessionManager(nativeBridge);
            operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
            sinon.spy(nativeBridge.UrlScheme, 'open');

            const video = new Video('');

            const campaign = TestFixtures.getCampaign();
            campaign.set('store', StoreName.APPLE);
            campaign.set('appStoreId', '11111');

            performanceAdUnitParameters = {
                forceOrientation: ForceOrientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: TestFixtures.getCampaign(),
                configuration: TestFixtures.getConfiguration(),
                request: request,
                options: {},
                endScreen: endScreen,
                overlay: overlay,
                video: video
            };

            performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
            endScreenEventHandler = new PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
        });

        it('should send a click with session manager', () => {
            deviceInfo = <DeviceInfo><any>{getOsVersion: () => '9.0'};

            endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                store: performanceAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
            });

            // EndScreenEventHandlers.onDownloadIos(nativeBridge, operativeEventManager, thirdPartyEventManager, performanceAdUnit, deviceInfo, clientInfo);

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, performanceAdUnit);
        });

        describe('with follow redirects', () => {
            deviceInfo = <DeviceInfo><any>{getOsVersion: () => '9.0'};
            it('with response that contains location, it should open url scheme', () => {
                const campaign = TestFixtures.getCampaignFollowsRedirects();
                campaign.set('store', StoreName.APPLE);
                performanceAdUnitParameters.campaign = TestFixtures.getCampaignFollowsRedirects();

                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                    url: 'http://foo.url.com',
                    response: 'foo response',
                    responseCode: 200,
                    headers: [['location', 'appstore://foobar.com']]
                }));

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'appstore://foobar.com');
                });
            });

            it('with response that does not contain location, it should not call open', () => {
                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                (<sinon.SinonSpy>operativeEventManager.sendClick).restore();
                sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });

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

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });
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

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });
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

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });
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
                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, performanceAdUnit);
            });
        });
    });
});
