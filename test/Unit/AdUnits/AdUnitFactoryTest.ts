import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';

import { AdUnitFactory } from 'Ads/AdUnits/AdUnitFactory';

import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { assert } from 'chai';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
import { Request } from 'Core/Utilities/Request';
import { XHRequest } from 'Core/Utilities/XHRequest';

import { DisplayInterstitialAdUnit } from 'Display/AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';

import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import { MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';
import { PlayableMRAID } from 'MRAID/Views/PlayableMRAID';
import { PromoAdUnit } from 'Promo/AdUnits/PromoAdUnit';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import * as sinon from 'sinon';
import { asStub } from 'TestHelpers/Functions';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

describe('AdUnitFactoryTest', () => {

    let sandbox: sinon.SinonSandbox;
    let nativeBridge: NativeBridge;
    let storageBridge: StorageBridge;
    let focusManager: FocusManager;
    let container: AdUnitContainer;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let sessionManager: SessionManager;
    let operativeEventManager: OperativeEventManager;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
    let metaDataManager: MetaDataManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: Request;
    let adUnitParameters: IAdUnitParameters<Campaign>;
    let wakeUpManager: WakeUpManager;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        storageBridge = new StorageBridge(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
        sandbox.stub(container, 'close').returns(Promise.resolve());
        sandbox.stub(container, 'open').returns(Promise.resolve());
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const placement = TestFixtures.getPlacement();
        coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationJson));
        adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationJson));
        deviceInfo = <DeviceInfo>{getLanguage: () => 'en', getAdvertisingIdentifier: () => '000', getLimitAdTracking: () => false, getOsVersion: () => '8.0'};
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        thirdPartyEventManager.setTemplateValues({ '%ZONE%': placement.getId(), '%SDK_VERSION%': clientInfo.getSdkVersion().toString() });
        sessionManager = new SessionManager(nativeBridge, request, storageBridge);
        const campaign = TestFixtures.getCampaign();
        const gdprManager = sinon.createStubInstance(GdprManager);
        const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            storageBridge: storageBridge,
            campaign: campaign
        });

        sandbox.stub(MoatViewabilityService, 'initMoat');

        const webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        webPlayerContainer.onPageStarted = new Observable1<string>();
        webPlayerContainer.shouldOverrideUrlLoading = new Observable2<string, string>();
        asStub(webPlayerContainer.setSettings).resolves();
        asStub(webPlayerContainer.clearSettings).resolves();
        adUnitParameters = {
            webPlayerContainer: webPlayerContainer,
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: placement,
            campaign: campaign,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            request: request,
            options: {},
            gdprManager: gdprManager,
            programmaticTrackingService: programmaticTrackingService
        };

        sandbox.spy(thirdPartyEventManager, 'sendEvent');
        sandbox.spy(request, 'get');
        sandbox.stub(nativeBridge.WebPlayer, 'setSettings').returns(Promise.resolve());
        sandbox.stub(nativeBridge.WebPlayer, 'clearSettings').returns(Promise.resolve());
        sandbox.stub(XHRequest, 'get').returns(Promise.resolve('mraid creative'));
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('MRAID AdUnit Factory', () => {
        describe('basic MRAID functionality', () => {
            let campaign: MRAIDCampaign;

            beforeEach(() => {
                campaign = TestFixtures.getProgrammaticMRAIDCampaign();
                const resourceUrl = campaign.getResourceUrl();
                if (resourceUrl) {
                    resourceUrl.setFileId('1234');
                }

                adUnitParameters.campaign = campaign;
            });

            after(() => {
                AdUnitFactory.setForcedPlayableMRAID(false);
            });

            it('should create MRAID view', () => {
                const adUnit = <MRAIDAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
                assert.isTrue(adUnit.getMRAIDView() instanceof MRAID, 'view should be MRAID');
            });

            it('should create PlayableMRAID view', () => {
                AdUnitFactory.setForcedPlayableMRAID(false);

                const resourceUrl = campaign.getResourceUrl();
                if (resourceUrl) {
                    resourceUrl.set('url', 'https://cdn.unityads.unity3d.com/playables/production/unity/xinstall.html');
                }

                const adUnit = <MRAIDAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
                assert.isTrue(adUnit.getMRAIDView() instanceof PlayableMRAID, 'view should be PlayableMRAID');
            });

            it('should be forced to create PlayableMRAID view', () => {
                AdUnitFactory.setForcedPlayableMRAID(true);
                const adUnit = <MRAIDAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
                assert.isTrue(adUnit.getMRAIDView() instanceof PlayableMRAID, 'view should be PlayableMRAID');
            });
        });

        describe('eventhandler functionality', () => {
            let httpKafkaStub: any;

            beforeEach(() => {
                httpKafkaStub = sinon.stub(HttpKafka, 'sendEvent').resolves();
            });

            afterEach(() => {
                httpKafkaStub.restore();
            });

            it('should not send onPlayableAnalyticsEvent for MRAIDCampaign', () => {
                const campaign = TestFixtures.getProgrammaticMRAIDCampaign();
                adUnitParameters.campaign = campaign;
                const adUnit = <MRAIDAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
                adUnit.show();
                assert.isFalse(httpKafkaStub.called);
            });

            it('should send onPlayableAnalyticsEvent on show if ad is Sonic Playable', () => {
                const campaign = TestFixtures.getProgrammaticMRAIDCampaign({ creativeId: '109455881' });
                adUnitParameters.campaign = campaign;
                const adUnit = <MRAIDAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
                adUnit.show();
                sinon.assert.calledWith(<sinon.SinonSpy>httpKafkaStub, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, sinon.match.has('type', 'playable_show'));
                sinon.assert.calledOnce(httpKafkaStub);
            });

            it('should send onPlayableAnalyticsEvent for PerformanceMRAIDCampaign', () => {
                const campaign = TestFixtures.getPerformanceMRAIDCampaign();
                adUnitParameters.campaign = campaign;
                const adUnit = <MRAIDAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
                adUnit.show();
                sinon.assert.calledWith(<sinon.SinonSpy>httpKafkaStub, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, sinon.match.has('type', 'playable_show'));
                sinon.assert.calledOnce(httpKafkaStub);
            });
        });
    });

    describe('MRAID AdUnit', () => {
        let adUnit: MRAIDAdUnit;
        let testThirdPartyEventManager: any;
        let campaign: MRAIDCampaign;

        beforeEach(() => {
            testThirdPartyEventManager = {
                thirdPartyEvent: sinon.stub().returns(Promise.resolve())
            };

            campaign = TestFixtures.getProgrammaticMRAIDCampaign();
            const resourceUrl = campaign.getResourceUrl();
            if(resourceUrl) {
                resourceUrl.setFileId('1234');
            }

            operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign
            });

            sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
            sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
            sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
            sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());

            adUnitParameters.campaign = campaign;
            adUnitParameters.operativeEventManager = operativeEventManager;
            adUnit = <MRAIDAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
        });

        describe('on hide', () => {
            it('should trigger onClose when hide is called', (done) => {
                adUnit.setShowing(true);
                adUnit.onClose.subscribe(() => {
                    assert.equal(adUnit.isShowing(), false);
                    done();
                });

                adUnit.hide();
            });

            it('should trigger onFinish when hide is called', (done) => {
                adUnit.setShowing(true);
                adUnit.onFinish.subscribe(() => {
                    done();
                });

                adUnit.hide();
            });

            it('should call trackers on on finish state completed', () => {
                adUnit.setShowing(true);
                adUnit.setFinishState(FinishState.COMPLETED);

                adUnit.hide();

                sinon.assert.calledOnce(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile);
                sinon.assert.calledOnce(<sinon.SinonSpy>operativeEventManager.sendView);
                sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'mraid complete', '12345', 'http://test.complete.com/complete1');
            });

            it('should call sendSkip on finish state skipped', () => {
                adUnit.setShowing(true);
                adUnit.setFinishState(FinishState.SKIPPED);

                adUnit.hide();

                sinon.assert.calledOnce(<sinon.SinonSpy>operativeEventManager.sendSkip);
            });
        });

        describe('on show', () => {
            it('should trigger onStart', (done) => {
                adUnit.onStart.subscribe(() => {
                    adUnit.hide();
                    done();
                });

                adUnit.show();
            });

            it('should call sendStart', () => {
                adUnit.show();
                sinon.assert.calledOnce(<sinon.SinonSpy>operativeEventManager.sendStart);
                adUnit.hide();
            });

            it('should send impressions', () => {
                adUnit.show();
                sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'mraid impression', '12345', 'http://test.impression.com/blah1');
                sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'mraid impression', '12345', 'http://test.impression.com/blah2');
                adUnit.hide();
            });

            it('should replace macros in the postback impression url', () => {
                adUnit.show();
                (<sinon.SinonSpy>thirdPartyEventManager.sendEvent).restore();
                assert.equal('http://test.impression.com/fooId/blah?sdkVersion=2000', (<sinon.SinonSpy>request.get).getCall(2).args[0], 'should have replaced template values in the url');
                adUnit.hide();
            });
        });

        it('should call click tracker', () => {
            adUnit.sendClick();
            sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'mraid click', '12345', 'http://test.complete.com/click1');
        });
    });

    describe('DisplayInterstitialAdUnit', () => {
        describe('On static-interstial campaign', () => {
            let adUnit: DisplayInterstitialAdUnit;
            let campaign: DisplayInterstitialCampaign;

            beforeEach(() => {
                campaign = TestFixtures.getDisplayInterstitialCampaign();
                adUnitParameters.campaign = campaign;
                adUnitParameters.operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                    nativeBridge: nativeBridge,
                    request: request,
                    metaDataManager: metaDataManager,
                    sessionManager: sessionManager,
                    clientInfo: clientInfo,
                    deviceInfo: deviceInfo,
                    coreConfig: coreConfig,
                    adsConfig: adsConfig,
                    storageBridge: storageBridge,
                    campaign: campaign
                });

                sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
                sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
                sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
                sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());

                adUnit = <DisplayInterstitialAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
            });

            describe('on show', () => {
                it('should send tracking events', () => {
                    return adUnit.show().then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
                        sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'display impression', campaign.getSession().getId(), 'https://unity3d.com/impression');
                        return adUnit.hide();
                    });
                });
            });
        });
    });

    describe('Promo AdUnit', () => {
        let promoAdUnit: PromoAdUnit;
        let campaign: PromoCampaign;

        beforeEach(() => {
            campaign = TestFixtures.getPromoCampaign();
            sandbox.stub(PurchasingUtilities, 'getProductPrice').returns('3 €');
            sandbox.stub(campaign, 'getSession').returns({
                getId: sinon.stub().returns('1111')
            });
            adUnitParameters.campaign = campaign;
            adUnitParameters.operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign
            });

            sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
            sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
            sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
            sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
            sandbox.stub(PurchasingUtilities, 'getProductType').returns('NonConsumable');

            promoAdUnit = <PromoAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
        });
        describe('on show', () => {
            it('should trigger onStart', (done) => {
                promoAdUnit.onStart.subscribe(() => {
                    done();
                });
                promoAdUnit.show();
            });
        });
        describe('on hide', () => {
            it('should trigger onClose when hide is called', (done) => {
                promoAdUnit.setShowing(true);
                promoAdUnit.onClose.subscribe(() => {
                    assert.equal(promoAdUnit.isShowing(), false);
                    done();
                });

                promoAdUnit.hide();
            });
        });
    });

    describe('XPromo AdUnit', () => {
        let adUnit: XPromoAdUnit;
        let campaign: XPromoCampaign;

        beforeEach(() => {
            campaign = TestFixtures.getXPromoCampaign();

            adUnitParameters.campaign = campaign;
            adUnitParameters.operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign
            });

            sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
            sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
            sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
            sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());

            adUnit = <XPromoAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
        });

        describe('on hide', () => {
            it('should trigger onClose when hide is called', (done) => {
                adUnit.setShowing(true);
                adUnit.onClose.subscribe(() => {
                    assert.equal(adUnit.isShowing(), false);
                    done();
                });

                adUnit.hide();
            });
        });

        describe('on show', () => {
            it('should trigger onStart', (done) => {
                adUnit.onStart.subscribe(() => {
                    adUnit.hide();
                    done();
                });

                adUnit.show();
            });
        });
    });
});
