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
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { PlayableEventHandler } from 'MRAID/EventHandlers/PlayableEventHandler';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IARApi } from 'AR/AR';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import { MraidIFrameEventBridge } from 'MRAID/Views/MraidIFrameEventBridge';

describe('MRAIDEventHandlersTest', () => {

    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let container: AdUnitContainer;
    let core: ICoreApi;
    let ads: IAdsApi;
    let ar: IARApi;
    let purchasing: IPurchasingApi;
    let storageBridge: StorageBridge;
    let mraidAdUnit: MRAIDAdUnit;
    let mraidView: MRAID;
    let placement: Placement;
    let focusManager: FocusManager;
    let request: RequestManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let extendedMraidAdUnitParams: IMRAIDAdUnitParameters;
    let mraidEventHandler: MRAIDEventHandler;
    let extendedMraidCampaign: MRAIDCampaign;
    let programmaticMraidCampaign: MRAIDCampaign;
    let privacyManager: UserPrivacyManager;
    let programmaticTrackingService: ProgrammaticTrackingService;

    describe('with onClick', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            ar = TestFixtures.getARApi(nativeBridge);
            purchasing = TestFixtures.getPurchasingApi(nativeBridge);

            sinon.spy(core.Android!.Intent, 'launch');
            sinon.spy(ads.Listener, 'sendClickEvent');

            focusManager = new FocusManager(platform, core);
            container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
            request = sinon.createStubInstance(RequestManager);
            placement = TestFixtures.getPlacement();
            request = new RequestManager(platform, core, new WakeUpManager(core));
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo(core);

            thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            operativeEventManager = sinon.createStubInstance(OperativeEventManager);

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaign();
            mraidView = sinon.createStubInstance(MRAID);
            (<sinon.SinonSpy>mraidView.container).restore();
            sinon.stub(mraidView, 'container').returns(document.createElement('div'));
            privacyManager = sinon.createStubInstance(UserPrivacyManager);
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            extendedMraidAdUnitParams = {
            platform,
                core,
                ads,
                ar,
                purchasing,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: extendedMraidCampaign,
                coreConfig: TestFixtures.getCoreConfiguration(),
                adsConfig: TestFixtures.getAdsConfiguration(),
                request: request,
                options: {},
                mraid: mraidView,
                endScreen: undefined,
                privacy: new Privacy(platform, extendedMraidCampaign, privacyManager, false, false),
                privacyManager: privacyManager,
                programmaticTrackingService: programmaticTrackingService
            };

            mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
            sinon.stub(mraidAdUnit, 'sendClick');
            mraidEventHandler = new MRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);
        });

        it('should send a click with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, { placement: placement, asset: extendedMraidAdUnitParams.campaign.getResourceUrl() });
        });

        it('should send a view with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendView, { placement: placement, asset: extendedMraidAdUnitParams.campaign.getResourceUrl() });
        });

        it('should send a third quartile event with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile, { placement: placement, asset: extendedMraidAdUnitParams.campaign.getResourceUrl() });
        });

        it('should send a native click event', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>ads.Listener.sendClickEvent, placement.getId());
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaignFollowsRedirects();
                (<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent).restore();
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                    url: 'http://foo.url.com',
                    response: 'foo response',
                    responseCode: 200,
                    headers: [['location', 'market://foobar.com']]
                }));

                mraidView = new MRAID(platform, core, deviceInfo, placement, extendedMraidCampaign, extendedMraidAdUnitParams.privacy, true, extendedMraidAdUnitParams.coreConfig.getAbGroup());
                mraidView.setMraidEventBridge(new MraidIFrameEventBridge(core, mraidView));
                sinon.stub(mraidView, 'createMRAID').callsFake(() => {
                    return Promise.resolve();
                });

                extendedMraidAdUnitParams.campaign = extendedMraidCampaign;
                extendedMraidAdUnitParams.mraid = mraidView;
                extendedMraidAdUnitParams.thirdPartyEventManager = thirdPartyEventManager;

                mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
                sinon.stub(mraidAdUnit, 'sendClick');
                mraidEventHandler = new MRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);

                mraidEventHandler.onMraidClick('market://foobar.com');

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'market://foobar.com'
                    });
                });
            });

            it('with response that does not contain location, it should not launch intent', () => {
                extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaignFollowsRedirects();
                (<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent).restore();
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve());
                extendedMraidAdUnitParams.mraid = mraidView;
                extendedMraidAdUnitParams.campaign = extendedMraidCampaign;
                extendedMraidAdUnitParams.thirdPartyEventManager = thirdPartyEventManager;
                (<sinon.SinonSpy>operativeEventManager.sendClick).restore();
                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
                extendedMraidAdUnitParams.operativeEventManager = operativeEventManager;

                mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
                sinon.stub(mraidAdUnit, 'sendClick');

                mraidEventHandler = new MRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);
                mraidEventHandler.onMraidClick('http://example.net');

                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>core.Android!.Intent.launch);
                });
            });
        });

        describe('with onPlayableAnalyticsEvent', () => {
            let sandbox: sinon.SinonSandbox;

            before(() => {
                sandbox = sinon.sandbox.create();
            });

            beforeEach(() => {
                extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaign();
                extendedMraidAdUnitParams.campaign = extendedMraidCampaign;
                sandbox.stub(HttpKafka, 'sendEvent');
            });

            afterEach(() => {
                sandbox.restore();
            });

            describe('MRAIDEventHandler', () => {
                it('should not send a analytics event', () => {
                    mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    mraidEventHandler = new MRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);

                    mraidEventHandler.onPlayableAnalyticsEvent(15, 12, 0, 'win_screen', { 'level': 2 });
                    sinon.assert.notCalled(<sinon.SinonStub>HttpKafka.sendEvent);
                });
            });

            describe('PlayableEventHandler', () => {
                it('should send a analytics event', () => {
                    mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    mraidEventHandler = new PlayableEventHandler(mraidAdUnit, extendedMraidAdUnitParams);

                    mraidEventHandler.onPlayableAnalyticsEvent(15, 12, 0, 'win_screen', {'level': 2});

                    const kafkaObject: any = {};
                    kafkaObject.type = 'win_screen';
                    kafkaObject.eventData = {'level': 2};
                    kafkaObject.timeFromShow = 15;
                    kafkaObject.timeFromPlayableStart = 12;
                    kafkaObject.backgroundTime = 0;
                    kafkaObject.auctionId = '12345';
                    kafkaObject.abGroup = 99;

                    const resourceUrl = extendedMraidCampaign.getResourceUrl();
                    if(resourceUrl) {
                        kafkaObject.url = resourceUrl.getOriginalUrl();
                    }
                    sinon.assert.calledWith(<sinon.SinonStub>HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
                });

                it('should send a analytics event without extra event data', () => {
                    mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    mraidEventHandler = new PlayableEventHandler(mraidAdUnit, extendedMraidAdUnitParams);

                    mraidEventHandler.onPlayableAnalyticsEvent(15, 12, 5, 'win_screen', undefined);

                    const kafkaObject: any = {};
                    kafkaObject.type = 'win_screen';
                    kafkaObject.eventData = undefined;
                    kafkaObject.timeFromShow = 15;
                    kafkaObject.timeFromPlayableStart = 12;
                    kafkaObject.backgroundTime = 5;
                    kafkaObject.auctionId = '12345';
                    kafkaObject.abGroup = 99;

                    const resourceUrl = extendedMraidCampaign.getResourceUrl();
                    if(resourceUrl) {
                        kafkaObject.url = resourceUrl.getOriginalUrl();
                    }
                    sinon.assert.calledWith(<sinon.SinonStub>HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
                });
            });
        });
    });

    describe('with Programmatic MRAID', () => {
        let programmaticMraidAdUnitParams: IMRAIDAdUnitParameters;
        let metaDataManager: MetaDataManager;
        let sessionManager: SessionManager;
        let coreConfig: CoreConfiguration;
        let adsConfig: AdsConfiguration;
        let programmaticMraidAdUnit: MRAIDAdUnit;
        let programmaticMraidEventHandler: MRAIDEventHandler;
        let privacy: AbstractPrivacy;

        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            storageBridge = new StorageBridge(core);
            focusManager = new FocusManager(platform, core);
            metaDataManager = new MetaDataManager(core);
            container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
            request = new RequestManager(platform, core, new WakeUpManager(core));
            sinon.stub(request, 'followRedirectChain').resolves();
            placement = TestFixtures.getPlacement();
            privacyManager = sinon.createStubInstance(UserPrivacyManager);

            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            thirdPartyEventManager = new ThirdPartyEventManager(core, request);
            sessionManager = new SessionManager(core, request, storageBridge);
            coreConfig = TestFixtures.getCoreConfiguration();
            adsConfig = TestFixtures.getAdsConfiguration();
            programmaticMraidCampaign = TestFixtures.getProgrammaticMRAIDCampaign();

            privacy = new Privacy(platform, programmaticMraidCampaign, privacyManager, adsConfig.isGDPREnabled(), coreConfig.isCoppaCompliant());
            mraidView = new MRAID(platform, core, <AndroidDeviceInfo>deviceInfo, placement, programmaticMraidCampaign, privacy, true, coreConfig.getAbGroup());
            mraidView.setMraidEventBridge(new MraidIFrameEventBridge(core, mraidView));

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
                purchasing,
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
                programmaticTrackingService: programmaticTrackingService
            };

            programmaticMraidAdUnit = new MRAIDAdUnit(programmaticMraidAdUnitParams);
            programmaticMraidEventHandler = new MRAIDEventHandler(programmaticMraidAdUnit, programmaticMraidAdUnitParams);
            sinon.stub(programmaticMraidAdUnit, 'sendClick').returns(sinon.spy());
        });

        describe('when calling onClick', () => {
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
        });
    });
});
