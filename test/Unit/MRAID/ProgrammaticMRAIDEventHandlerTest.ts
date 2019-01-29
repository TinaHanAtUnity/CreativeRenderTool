import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IAdsApi } from 'Ads/IAds';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IARApi } from 'AR/AR';
import { ProgrammaticMRAIDEventHandler } from 'MRAID/EventHandlers/ProgrammaticMRAIDEventHandler';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';

[Platform.ANDROID, Platform.IOS].forEach(platform => {

    describe('ProgrammaticMRAIDEventHandlersTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let container: AdUnitContainer;
        let core: ICoreApi;
        let ads: IAdsApi;
        let ar: IARApi;
        let storageBridge: StorageBridge;
        let mraidView: MRAID;
        let placement: Placement;
        let focusManager: FocusManager;
        let request: RequestManager;
        let operativeEventManager: OperativeEventManager;
        let deviceInfo: DeviceInfo;
        let clientInfo: ClientInfo;
        let thirdPartyEventManager: ThirdPartyEventManager;
        let programmaticMraidEventHandler: ProgrammaticMRAIDEventHandler;
        let programmaticMraidCampaign: MRAIDCampaign;
        let privacyManager: UserPrivacyManager;
        let programmaticTrackingService: ProgrammaticTrackingService;

        describe('with Programmatic MRAID', () => {
            let programmaticMraidAdUnitParams: IMRAIDAdUnitParameters;
            let metaDataManager: MetaDataManager;
            let sessionManager: SessionManager;
            let coreConfig: CoreConfiguration;
            let adsConfig: AdsConfiguration;
            let programmaticMraidAdUnit: MRAIDAdUnit;
            let privacy: AbstractPrivacy;
            let clickDestinationUrl: string;
            let webPlayerContainer: WebPlayerContainer;

            beforeEach(() => {
                backend = TestFixtures.getBackend(platform);
                nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                core = TestFixtures.getCoreApi(nativeBridge);
                ads = TestFixtures.getAdsApi(nativeBridge);
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
                    container = new Activity(core, ads, <AndroidDeviceInfo>deviceInfo);
                } else if (platform === Platform.IOS) {
                    deviceInfo = TestFixtures.getIosDeviceInfo(core);
                    container = new ViewController(core, ads, <IosDeviceInfo>deviceInfo, focusManager, clientInfo);
                }
                thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
                sessionManager = new SessionManager(core, request, storageBridge);
                coreConfig = TestFixtures.getCoreConfiguration();
                adsConfig = TestFixtures.getAdsConfiguration();
                programmaticMraidCampaign = TestFixtures.getProgrammaticMRAIDCampaign();
                webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);

                programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

                privacy = new Privacy(platform, programmaticMraidCampaign, privacyManager, adsConfig.isGDPREnabled(), coreConfig.isCoppaCompliant());
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
                    playerMetadataServerId: 'test-gamerSid'
                });

                programmaticMraidAdUnitParams = {
                    platform,
                    core,
                    ads,
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
                    privacy: new Privacy(platform, programmaticMraidCampaign, privacyManager, false, false),
                    privacyManager: privacyManager,
                    programmaticTrackingService: programmaticTrackingService,
                    webPlayerContainer: webPlayerContainer
                };

                programmaticMraidAdUnit = new MRAIDAdUnit(programmaticMraidAdUnitParams);
                programmaticMraidEventHandler = new ProgrammaticMRAIDEventHandler(programmaticMraidAdUnit, programmaticMraidAdUnitParams);
                sinon.stub(programmaticMraidAdUnit, 'sendClick').returns(sinon.spy());
            });

            describe('when calling onClick', () => {
                if (platform === Platform.IOS) {
                    describe('on iOS', () => {
                        it('should send a tracking event for programmatic mraid click', () => {
                            sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledOnce(<sinon.SinonSpy>programmaticMraidAdUnit.sendClick);
                            });
                        });

                        it('should send second tracking event for programmatic mraid click after processing the first', () => {
                            sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                    sinon.assert.calledTwice(<sinon.SinonSpy>programmaticMraidAdUnit.sendClick);
                                });
                            });
                        });

                        it('should ignore user clicks while processing the first click event', () => {
                            const mockMraidView = sinon.mock(mraidView);
                            const expectationMraidView = sinon.mock(mraidView).expects('setCallButtonEnabled').twice();
                            sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                mockMraidView.verify();
                                assert.equal(expectationMraidView.getCall(0).args[0], false, 'Should block CTA event while processing click event');
                                assert.equal(expectationMraidView.getCall(1).args[0], true, 'Should enable CTA event after processing click event');
                            });
                        });

                        it('should send a click with session manager', () => {
                            sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, { placement: placement, asset: programmaticMraidAdUnitParams.campaign.getResourceUrl() });
                            });
                        });

                        it('should send a view with session manager', () => {
                            sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendView, { placement: placement, asset: programmaticMraidAdUnitParams.campaign.getResourceUrl() });
                            });
                        });

                        it('should send a third quartile event with session manager', () => {
                            sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile, { placement: placement, asset: programmaticMraidAdUnitParams.campaign.getResourceUrl() });
                            });
                        });

                        it('should open click through link', () => {
                            sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, clickDestinationUrl);
                            });
                        });
                    });
                }

                if (platform === Platform.ANDROID) {
                    describe('on Android', () => {
                        it('should send a tracking event for programmatic mraid click', () => {
                            sinon.stub(core.Android!.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledOnce(<sinon.SinonSpy>programmaticMraidAdUnit.sendClick);
                            });
                        });

                        it('should send second tracking event for programmatic mraid click after processing the first', () => {
                            sinon.stub(core.Android!.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                    sinon.assert.calledTwice(<sinon.SinonSpy>programmaticMraidAdUnit.sendClick);
                                });
                            });
                        });

                        it('should ignore user clicks while processing the first click event', () => {
                            const mockMraidView = sinon.mock(mraidView);
                            const expectationMraidView = sinon.mock(mraidView).expects('setCallButtonEnabled').twice();
                            sinon.stub(core.Android!.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                mockMraidView.verify();
                                assert.equal(expectationMraidView.getCall(0).args[0], false, 'Should block CTA event while processing click event');
                                assert.equal(expectationMraidView.getCall(1).args[0], true, 'Should enable CTA event after processing click event');
                            });
                        });

                        it('should send a click with session manager', () => {
                            sinon.stub(core.Android!.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, { placement: placement, asset: programmaticMraidAdUnitParams.campaign.getResourceUrl() });
                            });
                        });

                        it('should send a view with session manager', () => {
                            sinon.stub(core.Android!.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendView, { placement: placement, asset: programmaticMraidAdUnitParams.campaign.getResourceUrl() });
                            });
                        });

                        it('should send a third quartile event with session manager', () => {
                            sinon.stub(core.Android!.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile, { placement: placement, asset: programmaticMraidAdUnitParams.campaign.getResourceUrl() });
                            });
                        });

                        it('should open click through link', () => {
                            sinon.stub(core.Android!.Intent, 'launch').resolves();
                            programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                                sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, clickDestinationUrl);
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
                    sinon.assert.calledOnce(<sinon.SinonSpy>programmaticMraidAdUnit.sendImpression);
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
                            sinon.assert.calledWith(<sinon.SinonStub>container.setViewFrame, 'webview', 0, 0, 500, 600);
                        });
                    });

                    context('onWebViewReduceSize', () => {
                        beforeEach(() => {
                            return programmaticMraidEventHandler.onWebViewReduceSize();
                        });

                        it('should set webview view frame to top of window', () => {
                            sinon.assert.calledWith(<sinon.SinonStub>container.setViewFrame, 'webview', 0, 0, 500, 30);
                        });
                    });
                }

                if (platform === Platform.IOS) {
                    context('onWebViewFullScreen', () => {
                        beforeEach(() => {
                            return programmaticMraidEventHandler.onWebViewFullScreen();
                        });

                        it('should set webview view frame to full screen', () => {
                            sinon.assert.calledWith(<sinon.SinonStub>container.setViewFrame, 'webview', 0, 0, 500, 600);
                        });
                    });

                    context('onWebViewReduceSize', () => {
                        beforeEach(() => {
                            return programmaticMraidEventHandler.onWebViewReduceSize();
                        });

                        it('should set webview view frame to top of window', () => {
                            sinon.assert.calledWith(<sinon.SinonStub>container.setViewFrame, 'webview', 0, 0, 500, 36);
                        });
                    });
                }
            });
        });
    });
});
