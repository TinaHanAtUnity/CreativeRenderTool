import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import { MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAID } from 'MRAID/Views/MRAID';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ProgrammaticMRAIDEventHandler } from 'MRAID/EventHandlers/ProgrammaticMRAIDEventHandler';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ProgrammaticMRAIDEventHandlersTest', () => {
        let backend;
        let nativeBridge;
        let container;
        let core;
        let ads;
        let store;
        let ar;
        let storageBridge;
        let mraidView;
        let placement;
        let focusManager;
        let request;
        let operativeEventManager;
        let deviceInfo;
        let clientInfo;
        let thirdPartyEventManager;
        let programmaticMraidEventHandler;
        let programmaticMraidCampaign;
        let privacyManager;
        let privacySDK;
        describe('with Programmatic MRAID', () => {
            let programmaticMraidAdUnitParams;
            let metaDataManager;
            let sessionManager;
            let coreConfig;
            let adsConfig;
            let programmaticMraidAdUnit;
            let privacy;
            let clickDestinationUrl;
            let webPlayerContainer;
            beforeEach(() => {
                backend = TestFixtures.getBackend(platform);
                nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                core = TestFixtures.getCoreApi(nativeBridge);
                ads = TestFixtures.getAdsApi(nativeBridge);
                store = TestFixtures.getStoreApi(nativeBridge);
                ar = TestFixtures.getARApi(nativeBridge);
                storageBridge = new StorageBridge(core);
                focusManager = new FocusManager(platform, core);
                metaDataManager = new MetaDataManager(core);
                request = new RequestManager(platform, core, new WakeUpManager(core));
                clickDestinationUrl = 'https://market_url.com';
                sinon.stub(request, 'followRedirectChain').resolves(clickDestinationUrl);
                placement = TestFixtures.getPlacement();
                privacyManager = sinon.createStubInstance(UserPrivacyManager);
                clientInfo = TestFixtures.getClientInfo(platform);
                if (platform === Platform.ANDROID) {
                    deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                    container = new Activity(core, ads, deviceInfo);
                }
                else if (platform === Platform.IOS) {
                    deviceInfo = TestFixtures.getIosDeviceInfo(core);
                    container = new ViewController(core, ads, deviceInfo, focusManager, clientInfo);
                }
                thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
                sessionManager = new SessionManager(core, request, storageBridge);
                coreConfig = TestFixtures.getCoreConfiguration();
                adsConfig = TestFixtures.getAdsConfiguration();
                programmaticMraidCampaign = TestFixtures.getProgrammaticMRAIDCampaign();
                webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
                privacySDK = TestFixtures.getPrivacySDK(core);
                privacy = new Privacy(platform, programmaticMraidCampaign, privacyManager, privacySDK.isGDPREnabled(), coreConfig.isCoppaCompliant(), 'en');
                mraidView = new MRAID(platform, core, deviceInfo, placement, programmaticMraidCampaign, privacy, true, coreConfig.getAbGroup());
                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                    platform,
                    core,
                    ads,
                    request: request,
                    metaDataManager: metaDataManager,
                    sessionManager: sessionManager,
                    clientInfo: clientInfo,
                    deviceInfo: deviceInfo,
                    coreConfig: coreConfig,
                    adsConfig: adsConfig,
                    storageBridge: storageBridge,
                    campaign: programmaticMraidCampaign,
                    playerMetadataServerId: 'test-gamerSid',
                    privacySDK: privacySDK,
                    userPrivacyManager: privacyManager
                });
                programmaticMraidAdUnitParams = {
                    platform,
                    core,
                    ads,
                    store,
                    ar,
                    forceOrientation: Orientation.LANDSCAPE,
                    focusManager: focusManager,
                    container: container,
                    deviceInfo: deviceInfo,
                    clientInfo: clientInfo,
                    thirdPartyEventManager: thirdPartyEventManager,
                    operativeEventManager: operativeEventManager,
                    placement: TestFixtures.getPlacement(),
                    campaign: programmaticMraidCampaign,
                    coreConfig: coreConfig,
                    adsConfig: adsConfig,
                    request: request,
                    options: {},
                    mraid: mraidView,
                    endScreen: undefined,
                    privacy: privacy,
                    privacyManager: privacyManager,
                    webPlayerContainer: webPlayerContainer,
                    privacySDK: privacySDK
                };
                programmaticMraidAdUnit = new MRAIDAdUnit(programmaticMraidAdUnitParams);
                programmaticMraidEventHandler = new ProgrammaticMRAIDEventHandler(programmaticMraidAdUnit, programmaticMraidAdUnitParams);
                sinon.stub(programmaticMraidAdUnit, 'sendClick').returns(sinon.spy());
            });
            afterEach(() => {
                programmaticMraidAdUnit.setShowing(true);
                return programmaticMraidAdUnit.hide();
            });
            describe('when calling onClick', () => {
                if (platform === Platform.IOS) {
                    describe('on iOS', () => {
                        it('should send a tracking event for programmatic mraid click', () => {
                            sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledOnce(programmaticMraidAdUnit.sendClick);
                            });
                        });
                        it('should send second tracking event for programmatic mraid click after processing the first', () => {
                            sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                    sinon.assert.calledTwice(programmaticMraidAdUnit.sendClick);
                                });
                            });
                        });
                        it('should ignore user clicks while processing the first click event', () => {
                            const mockMraidView = sinon.mock(mraidView);
                            const expectationMraidView = sinon.mock(mraidView).expects('setCallButtonEnabled').twice();
                            sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                mockMraidView.verify();
                                assert.equal(expectationMraidView.getCall(0).args[0], false, 'Should block CTA event while processing click event');
                                assert.equal(expectationMraidView.getCall(1).args[0], true, 'Should enable CTA event after processing click event');
                            });
                        });
                        it('should send a click with session manager', () => {
                            sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(operativeEventManager.sendClick, { placement: placement, asset: programmaticMraidAdUnitParams.campaign.getResourceUrl() });
                            });
                        });
                        it('should send a view with session manager', () => {
                            sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(operativeEventManager.sendView, { placement: placement, asset: programmaticMraidAdUnitParams.campaign.getResourceUrl() });
                            });
                        });
                        it('should send a third quartile event with session manager', () => {
                            sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(operativeEventManager.sendThirdQuartile, { placement: placement, asset: programmaticMraidAdUnitParams.campaign.getResourceUrl() });
                            });
                        });
                        it('should open click through link', () => {
                            sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(core.iOS.UrlScheme.open, clickDestinationUrl);
                            });
                        });
                    });
                }
                if (platform === Platform.ANDROID) {
                    describe('on Android', () => {
                        it('should send a tracking event for programmatic mraid click', () => {
                            sinon.stub(core.Android.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledOnce(programmaticMraidAdUnit.sendClick);
                            });
                        });
                        it('should send second tracking event for programmatic mraid click after processing the first', () => {
                            sinon.stub(core.Android.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                    sinon.assert.calledTwice(programmaticMraidAdUnit.sendClick);
                                });
                            });
                        });
                        it('should ignore user clicks while processing the first click event', () => {
                            const mockMraidView = sinon.mock(mraidView);
                            const expectationMraidView = sinon.mock(mraidView).expects('setCallButtonEnabled').twice();
                            sinon.stub(core.Android.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                mockMraidView.verify();
                                assert.equal(expectationMraidView.getCall(0).args[0], false, 'Should block CTA event while processing click event');
                                assert.equal(expectationMraidView.getCall(1).args[0], true, 'Should enable CTA event after processing click event');
                            });
                        });
                        it('should send a click with session manager', () => {
                            sinon.stub(core.Android.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(operativeEventManager.sendClick, { placement: placement, asset: programmaticMraidAdUnitParams.campaign.getResourceUrl() });
                            });
                        });
                        it('should send a view with session manager', () => {
                            sinon.stub(core.Android.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(operativeEventManager.sendView, { placement: placement, asset: programmaticMraidAdUnitParams.campaign.getResourceUrl() });
                            });
                        });
                        it('should send a third quartile event with session manager', () => {
                            sinon.stub(core.Android.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(operativeEventManager.sendThirdQuartile, { placement: placement, asset: programmaticMraidAdUnitParams.campaign.getResourceUrl() });
                            });
                        });
                        it('should open click through link', () => {
                            sinon.stub(core.Android.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(core.Android.Intent.launch, clickDestinationUrl);
                            });
                        });
                    });
                }
            });
            describe('when calling custom impression event multiple times', () => {
                it('should only send tracking event once', () => {
                    sinon.stub(programmaticMraidAdUnit, 'sendImpression');
                    programmaticMraidEventHandler.onCustomImpressionEvent();
                    programmaticMraidEventHandler.onCustomImpressionEvent();
                    sinon.assert.calledOnce(programmaticMraidAdUnit.sendImpression);
                });
            });
            describe('on Webview Resizing for webplayer', () => {
                beforeEach(() => {
                    sinon.stub(deviceInfo, 'getScreenWidth').resolves(500);
                    sinon.stub(deviceInfo, 'getScreenHeight').resolves(600);
                    sinon.stub(container, 'setViewFrame');
                });
                if (platform === Platform.ANDROID) {
                    context('onWebViewFullScreen', () => {
                        beforeEach(() => {
                            return programmaticMraidEventHandler.onWebViewFullScreen();
                        });
                        it('should set webview view frame to full screen', () => {
                            sinon.assert.calledWith(container.setViewFrame, 'webview', 0, 0, 500, 600);
                        });
                    });
                    context('onWebViewReduceSize', () => {
                        beforeEach(() => {
                            return programmaticMraidEventHandler.onWebViewReduceSize();
                        });
                        it('should set webview view frame to top of window', () => {
                            sinon.assert.calledWith(container.setViewFrame, 'webview', 0, 0, 500, 30);
                        });
                    });
                }
                if (platform === Platform.IOS) {
                    context('onWebViewFullScreen', () => {
                        beforeEach(() => {
                            return programmaticMraidEventHandler.onWebViewFullScreen();
                        });
                        it('should set webview view frame to full screen', () => {
                            sinon.assert.calledWith(container.setViewFrame, 'webview', 0, 0, 500, 600);
                        });
                    });
                    context('onWebViewReduceSize', () => {
                        beforeEach(() => {
                            return programmaticMraidEventHandler.onWebViewReduceSize();
                        });
                        it('should set webview view frame to top of window', () => {
                            sinon.assert.calledWith(container.setViewFrame, 'webview', 0, 0, 500, 36);
                        });
                    });
                }
            });
            describe('onPlayableAnalytics Event', () => {
                beforeEach(() => {
                    sinon.stub(HttpKafka, 'sendEvent');
                });
                it('should send an analytics event', () => {
                    programmaticMraidEventHandler.onPlayableAnalyticsEvent(15, 12, 0, 'win_screen', { 'level': 2 });
                    sinon.assert.called(HttpKafka.sendEvent);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljTVJBSURFdmVudEhhbmRsZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L01SQUlEL1Byb2dyYW1tYXRpY01SQUlERXZlbnRIYW5kbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFtQixXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUV0RixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVyRSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUN6RixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDN0QsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFJN0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQU01RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQTBCLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRWhGLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxQyxPQUFP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