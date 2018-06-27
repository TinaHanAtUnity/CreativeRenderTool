import 'mocha';
import * as sinon from 'sinon';

import { IEndScreenDownloadParameters } from 'EventHandlers/EndScreenEventHandler';
import { NativeBridge } from 'Native/NativeBridge';
import { Overlay } from 'Views/Overlay';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Request, INativeResponse } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { PerformanceCampaign, StoreName } from 'Models/Campaigns/PerformanceCampaign';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { Video } from 'Models/Assets/Video';
import { FocusManager } from 'Managers/FocusManager';
import { IOperativeEventParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { PerformanceEndScreenEventHandler } from 'EventHandlers/PerformanceEndScreenEventHandler';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';
import { Placement } from 'Models/Placement';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { Configuration } from 'Models/Configuration';
import { Privacy } from 'Views/Privacy';
import { GdprManager } from 'Managers/GdprManager';

describe('EndScreenEventHandlerTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, container: AdUnitContainer, overlay: Overlay, endScreen: PerformanceEndScreen;
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
    let campaign: PerformanceCampaign;
    let placement: Placement;
    let configuration: Configuration;

    describe('with onDownloadAndroid', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            }, Platform.ANDROID);

            campaign = TestFixtures.getCampaign();
            focusManager = new FocusManager(nativeBridge);
            container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
            metaDataManager = new MetaDataManager(nativeBridge);
            const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request = new Request(nativeBridge, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo();
            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            sessionManager = new SessionManager(nativeBridge, request);
            configuration = TestFixtures.getConfiguration();
            operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                configuration: configuration,
                campaign: campaign
            });
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
            sinon.spy(nativeBridge.Intent, 'launch');

            const video = new Video('', TestFixtures.getSession());

            const privacy = new Privacy(nativeBridge, configuration.isCoppaCompliant());
            endScreen = new PerformanceEndScreen(nativeBridge, TestFixtures.getCampaign(), deviceInfo.getLanguage(), clientInfo.getGameId(), privacy, false);
            overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
            placement = TestFixtures.getPlacement();
            const gdprManager = sinon.createStubInstance(GdprManager);

            performanceAdUnitParameters = {
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: placement,
                campaign: campaign,
                configuration: configuration,
                request: request,
                options: {},
                endScreen: endScreen,
                overlay: overlay,
                video: video,
                privacy: privacy,
                gdprManager: gdprManager
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

            const params: IOperativeEventParams = { placement: placement,
                videoOrientation: 'landscape',
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo()
            };
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, params);
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

            it('with APK download link and API is greater than or equal to 21, it should launch web search intent', () => {
                performanceAdUnitParameters.campaign = TestFixtures.getCampaignFollowsRedirects();
                performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);

                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                    url: 'http://foo.url.com',
                    response: 'foo response',
                    responseCode: 200
                }));

                sinon.stub(nativeBridge, 'getApiLevel').returns(21);

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: true,
                    clickAttributionUrl: 'https://blah.com?apk_download_link=https://cdn.apk.com'
                });

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                        'action': 'android.intent.action.WEB_SEARCH',
                        'extras': [{ key: 'query', value: 'https://cdn.apk.com' }]
                    });
                });
            });

            it('with APK download link and API is less than 21, it should launch view intent', () => {
                performanceAdUnitParameters.campaign = TestFixtures.getCampaignFollowsRedirects();
                performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);

                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                    url: 'http://foo.url.com',
                    response: 'foo response',
                    responseCode: 200
                }));

                sinon.stub(nativeBridge, 'getApiLevel').returns(20);

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: true,
                    clickAttributionUrl: 'https://blah.com?apk_download_link=https://cdn.apk.com'
                });

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'https://cdn.apk.com'
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
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getStore').returns(StoreName.GOOGLE);
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
                const params: IOperativeEventParams = { placement: placement,
                    videoOrientation: 'landscape',
                    adUnitStyle: undefined,
                    asset: performanceAdUnit.getVideo()
                };
                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, params);
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

            container = new ViewController(nativeBridge, TestFixtures.getIosDeviceInfo(), focusManager, clientInfo);
            const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request = new Request(nativeBridge, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.IOS);
            deviceInfo = TestFixtures.getIosDeviceInfo();
            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            sessionManager = new SessionManager(nativeBridge, request);

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.spy(nativeBridge.UrlScheme, 'open');

            const video = new Video('', TestFixtures.getSession());
            campaign = TestFixtures.getCampaign();
            campaign.set('store', StoreName.APPLE);
            campaign.set('appStoreId', '11111');
            operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                configuration: configuration,
                campaign: campaign
            });

            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);

            const privacy = new Privacy(nativeBridge, configuration.isCoppaCompliant());
            endScreen = new PerformanceEndScreen(nativeBridge, campaign, deviceInfo.getLanguage(), clientInfo.getGameId(), privacy, false);
            overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
            const gdprManager = sinon.createStubInstance(GdprManager);

            performanceAdUnitParameters = {
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: campaign,
                configuration: configuration,
                request: request,
                options: {},
                endScreen: endScreen,
                overlay: overlay,
                video: video,
                privacy: privacy,
                gdprManager: gdprManager
            };

            performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
            endScreenEventHandler = new PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
        });

        it('should send a click with session manager', () => {
            sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
            performanceAdUnitParameters.deviceInfo = deviceInfo;
            performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
            endScreenEventHandler = new PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);

            endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                gamerId: performanceAdUnitParameters.campaign.getGamerId(),
                store: performanceAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
            });

            const params: IOperativeEventParams = { placement: placement,
                videoOrientation: 'landscape',
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo()
            };
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, params);
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should open url scheme', () => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
                performanceAdUnitParameters.deviceInfo = deviceInfo;
                performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                endScreenEventHandler = new PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);

                campaign = TestFixtures.getCampaignFollowsRedirects();
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
                sinon.stub(deviceInfo, 'getOsVersion').returns('8.1');
                campaign = TestFixtures.getCampaign();
                campaign.set('store', StoreName.APPLE);
                campaign.set('appStoreId', '11111');
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getBypassAppSheet').returns(false);
                sinon.stub(campaign, 'getStore').returns(StoreName.APPLE);

                performanceAdUnitParameters.deviceInfo = deviceInfo;
                performanceAdUnitParameters.campaign = campaign;
                performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                endScreenEventHandler = new PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);

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
                sinon.assert.called(<sinon.SinonSpy>nativeBridge.UrlScheme.open);
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
            });

        });

        describe('with no follow redirects and bypass app sheet', () => {
            beforeEach(() => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');

                campaign = TestFixtures.getCampaign();
                campaign.set('store', StoreName.APPLE);
                campaign.set('appStoreId', '11111');
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getBypassAppSheet').returns(true);
                sinon.stub(campaign, 'getStore').returns(StoreName.APPLE);

                performanceAdUnitParameters.deviceInfo = deviceInfo;
                performanceAdUnitParameters.campaign = campaign;

                performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                endScreenEventHandler = new PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);

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
                sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
                performanceAdUnitParameters.deviceInfo = deviceInfo;
                performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                endScreenEventHandler = new PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getBypassAppSheet').returns(false);
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
                const params: IOperativeEventParams = { placement: placement,
                    videoOrientation: 'landscape',
                    adUnitStyle: undefined,
                    asset: performanceAdUnit.getVideo()
                };
                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, params);
            });
        });
    });
});
