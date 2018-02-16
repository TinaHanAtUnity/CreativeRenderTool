import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { AdUnitFactory } from 'AdUnits/AdUnitFactory';
import { Vast } from 'Models/Vast/Vast';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Platform } from 'Constants/Platform';
import { Configuration } from 'Models/Configuration';
import { DeviceInfo } from 'Models/DeviceInfo';
import { SessionManager } from 'Managers/SessionManager';
import { VastVideoEventHandlers } from 'EventHandlers/VastVideoEventHandlers';
import { PerformanceVideoEventHandlers } from 'EventHandlers/PerformanceVideoEventHandlers';
import { NativeBridge } from 'Native/NativeBridge';

import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Activity } from 'AdUnits/Containers/Activity';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { FinishState } from 'Constants/FinishState';
import { FocusManager } from 'Managers/FocusManager';

import { DisplayInterstitialAdUnit } from 'AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';

import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { MoatViewabilityService } from 'Utilities/MoatViewabilityService';
import { XPromoAdUnit } from 'AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { PromoAdUnit } from 'AdUnits/PromoAdUnit';
import { PurchasingUtilities } from 'Utilities/PurchasingUtilities';

describe('AdUnitFactoryTest', () => {

    let sandbox: sinon.SinonSandbox;
    let nativeBridge: NativeBridge;
    let focusManager: FocusManager;
    let container: AdUnitContainer;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let sessionManager: SessionManager;
    let operativeEventManager: OperativeEventManager;
    let config: Configuration;
    let metaDataManager: MetaDataManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: Request;
    let adUnitParameters: IAdUnitParameters<Campaign>;
    let comScoreService: ComScoreTrackingService;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        metaDataManager = new MetaDataManager(nativeBridge);
        focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        sandbox.stub(container, 'close').returns(Promise.resolve());
        sandbox.stub(container, 'open').returns(Promise.resolve());
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        config = new Configuration(JSON.parse(ConfigurationJson));
        deviceInfo = <DeviceInfo>{getLanguage: () => 'en', getAdvertisingIdentifier: () => '000', getLimitAdTracking: () => false};
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        sessionManager = new SessionManager(nativeBridge);
        operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
        comScoreService = new ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);

        sandbox.stub(MoatViewabilityService, 'initMoat');

        adUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            comScoreTrackingService: comScoreService,
            placement: TestFixtures.getPlacement(),
            campaign: TestFixtures.getCampaign(),
            configuration: config,
            request: request,
            options: {}
        };
        sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
        sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
        sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
        sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());
        sandbox.spy(thirdPartyEventManager, 'sendEvent');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Performance AdUnit', () => {
        it('should call onVideoError on video controller error ', () => {
            sandbox.stub(PerformanceVideoEventHandlers, 'onVideoError').returns(null);

            const videoAdUnit = <PerformanceAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
            videoAdUnit.onError.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>PerformanceVideoEventHandlers.onVideoError);
        });
    });

    describe('VAST AdUnit', () => {
        it('should call onVideoError on video controller error', () => {
            sandbox.stub(VastVideoEventHandlers, 'onVideoError').returns(null);
            const vast = new Vast([], []);
            sandbox.stub(vast, 'getVideoUrl').returns('http://www.google.fi');
            const vastCampaign = TestFixtures.getEventVastCampaign();
            adUnitParameters.campaign = vastCampaign;
            adUnitParameters.forceOrientation = ForceOrientation.NONE;
            const videoAdUnit = <VastAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
            videoAdUnit.onError.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>VastVideoEventHandlers.onVideoError);
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

            adUnitParameters.campaign = campaign;
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
                sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'mraid impression', '12345', 'http://test.impression.com/fooId/blah?sdkVersion=2000');
                adUnit.hide();
            });
        });

        it('should call click tracker', () => {
            adUnit.sendClick();
            sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'mraid click', '12345', 'http://test.complete.com/click1');
        });
    });

    const displayUnitTests = (isStaticInterstitialUrlCampaign: boolean): void => {
        let adUnit: DisplayInterstitialAdUnit;
        let campaign: DisplayInterstitialCampaign;
        let server: sinon.SinonFakeServer;

        beforeEach(() => {
            campaign = TestFixtures.getDisplayInterstitialCampaign(isStaticInterstitialUrlCampaign);
            adUnitParameters.campaign = campaign;
            adUnit = <DisplayInterstitialAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);

            if (isStaticInterstitialUrlCampaign) {
                server = sinon.fakeServer.create();
                server.respondImmediately = true;
                server.respondWith('<a href="http://unity3d.com"></a>');
            }
        });

        afterEach(() => {
            if (server) {
                server.restore();
            }
        });

        describe('on show', () => {
            it('should send tracking events', () => {
                return adUnit.show().then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'display impression', campaign.getSession().getId(), 'https://unity3d.com/impression');
                    return adUnit.hide();
                });
            });
        });
    };

    describe('DisplayInterstitialAdUnit', () => {
        const isStaticInterstitialUrlCampaign = true;

        describe('On static-interstial campaign', () => {
            displayUnitTests(!isStaticInterstitialUrlCampaign);
        });

        describe('On static-interstial-url campaign', () => {
            displayUnitTests(isStaticInterstitialUrlCampaign);
        });
    });

    describe('Promo AdUnit', () => {
        let promoAdUnit: PromoAdUnit;
        let campaign: PromoCampaign;
        beforeEach(() => {
            campaign = TestFixtures.getPromoCampaign();
            sandbox.stub(PurchasingUtilities, 'productPrice').returns("3 €");
            sandbox.stub(campaign, 'getSession').returns({
                getId: sinon.stub().returns('1111')
            });
            adUnitParameters.campaign = campaign;

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
