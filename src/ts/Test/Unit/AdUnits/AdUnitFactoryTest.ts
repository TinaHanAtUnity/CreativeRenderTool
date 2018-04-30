import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { AdUnitFactory } from 'AdUnits/AdUnitFactory';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Platform } from 'Constants/Platform';
import { Configuration } from 'Models/Configuration';
import { DeviceInfo } from 'Models/DeviceInfo';
import { SessionManager } from 'Managers/SessionManager';
import { NativeBridge } from 'Native/NativeBridge';

import { Activity } from 'AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
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
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';

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
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
        sandbox.stub(container, 'close').returns(Promise.resolve());
        sandbox.stub(container, 'open').returns(Promise.resolve());
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        config = new Configuration(JSON.parse(ConfigurationJson));
        deviceInfo = <DeviceInfo>{getLanguage: () => 'en', getAdvertisingIdentifier: () => '000', getLimitAdTracking: () => false, getOsVersion: () => '8.0'};
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        sessionManager = new SessionManager(nativeBridge, request);
        const campaign = TestFixtures.getCampaign();

        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            configuration: config,
            campaign: campaign
        });

        comScoreService = new ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);
        sandbox.stub(MoatViewabilityService, 'initMoat');

        adUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            comScoreTrackingService: comScoreService,
            placement: TestFixtures.getPlacement(),
            campaign: campaign,
            configuration: config,
            request: request,
            options: {}
        };

        sandbox.spy(thirdPartyEventManager, 'sendEvent');
        sandbox.stub(nativeBridge.WebPlayer, 'setSettings').returns(Promise.resolve());
        sandbox.stub(nativeBridge.WebPlayer, 'clearSettings').returns(Promise.resolve());
    });

    afterEach(() => {
        sandbox.restore();
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
                configuration: config,
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
                sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'mraid impression', '12345', 'http://test.impression.com/fooId/blah?sdkVersion=2000');
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
                    configuration: config,
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
            sandbox.stub(PurchasingUtilities, 'productPrice').returns('3 €');
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
                configuration: config,
                campaign: campaign
            });

            sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
            sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
            sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
            sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());

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
                configuration: config,
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
