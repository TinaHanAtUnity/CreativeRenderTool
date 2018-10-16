import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { assert } from 'chai';
import { FinishState } from 'Core/Constants/FinishState';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable0, Observable1, Observable2 } from 'Core/Utilities/Observable';
import 'mocha';
import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';
import { PlacementContentManager } from 'Monetization/Managers/PlacementContentManager';
import { MonetizationListenerApi } from 'Monetization/Native/MonetizationListener';
import { IPlacementContentParams, IPlacementContentType, PlacementContentsApi } from 'Monetization/Native/PlacementContents';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingApi } from 'Promo/Native/Purchasing';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import * as sinon from 'sinon';
import { asStub, asSpy } from 'TestHelpers/Functions';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('PlacementContentManager', () => {
    let manager: PlacementContentManager;
    let nativeBridge: NativeBridge;
    let campaignManager: CampaignManager;
    let placementManager: PlacementManager;
    let configuration: AdsConfiguration;

    beforeEach(() => {
        configuration = TestFixtures.getAdsConfiguration();
        nativeBridge = sinon.createStubInstance(NativeBridge);
        (<any>nativeBridge).Monetization = {
            PlacementContents: sinon.createStubInstance(PlacementContentsApi),
            Listener: sinon.createStubInstance(MonetizationListenerApi)
        };

        (<any>nativeBridge).Purchasing = sinon.createStubInstance(PurchasingApi);

        asStub(nativeBridge.Monetization.PlacementContents.createPlacementContent).resolves();
        asStub(nativeBridge.Monetization.PlacementContents.setPlacementContentState).resolves();
        asStub(nativeBridge.Monetization.Listener.sendPlacementContentReady).resolves();
        asStub(nativeBridge.Monetization.Listener.sendPlacementContentStateChanged).resolves();
        campaignManager = sinon.createStubInstance(CampaignManager);
        (<any>campaignManager).onCampaign = new Observable2<string, Campaign>();
        (<any>campaignManager).onNoFill = new Observable1<string>();
        (<any>nativeBridge.Purchasing).onIAPSendEvent = new Observable1<string>();
        placementManager = new PlacementManager(nativeBridge, configuration);

        sinon.stub(placementManager, 'getPlacementCampaignMap').returns({
            'promoId': TestFixtures.getPromoCampaign(),
            'performanceId': TestFixtures.getXPromoCampaign()
        });

        manager = new PlacementContentManager(nativeBridge, configuration, campaignManager, placementManager);
    });

    describe('creating placement content', () => {
        type Matcher = (placement: Placement, campaign: Campaign, params: IPlacementContentParams) => void;
        interface ITest {
            name: string;
            placementId: string;
            campaign: Campaign;
            matcher: Matcher;
        }

        const t: ITest[] = [{
            name: 'Performance Campaign (Rewarded)',
            placementId: 'rewardedVideoZone',
            campaign: TestFixtures.getCampaign(),
            matcher: (placement, campaign, params) => {
                assert.equal(params.type, IPlacementContentType.SHOW_AD);
                assert.equal(params.rewarded, !placement.allowSkip());
            }
        }];

        t.forEach((tt, i) => {

            beforeEach(() => {
                campaignManager.onCampaign.trigger(tt.placementId, tt.campaign);
                return new Promise(setTimeout);
            });

            describe(`on campaign for ${tt.name}`, () => {
                it('should be created with proper params', () => {
                    const call = asStub(nativeBridge.Monetization.PlacementContents.createPlacementContent).getCall(i);
                    tt.matcher(configuration.getPlacement(tt.placementId), tt.campaign, call.args[1]);
                });

                it('should send placement content state change events', () => {
                    sinon.assert.calledWith(asStub(nativeBridge.Monetization.PlacementContents.setPlacementContentState), tt.placementId, PlacementContentState.READY);
                    sinon.assert.calledWith(asStub(nativeBridge.Monetization.Listener.sendPlacementContentStateChanged), tt.placementId, PlacementContentState.WAITING, PlacementContentState.READY);
                });

                it('should send placement content state as ready', () => {
                    sinon.assert.calledWith(asStub(nativeBridge.Monetization.Listener.sendPlacementContentReady), tt.placementId);
                });
            });
        });
    });

    describe('on no fill', () => {
        it('should create an undecided placement content', () => {
            const placementId = 'foobar';
            beforeEach(() => {
                campaignManager.onNoFill.trigger(placementId);
                return new Promise(setTimeout);
            });
            it('should create an undecided placement content type', () => {
                const call = asStub(nativeBridge.Monetization.PlacementContents.createPlacementContent).getCall(0);
                const params = call.args[1];
                assert.equal(params.type, IPlacementContentType.NO_FILL);
                assert.equal(params[0], placementId);
            });

            it('should set the placement content state as undecided', () => {
                sinon.assert.calledWith(asStub(nativeBridge.Monetization.PlacementContents.setPlacementContentState), placementId, PlacementContentState.NO_FILL);
                sinon.assert.calledWith(asStub(nativeBridge.Monetization.Listener.sendPlacementContentStateChanged), placementId, PlacementContentState.WAITING, PlacementContentState.NO_FILL);
            });
        });
    });

    describe('setting the current ad unit', () => {
        let adUnit: AbstractAdUnit;
        const placementId = 'foobar';

        beforeEach(() => {
            adUnit = sinon.createStubInstance(AbstractAdUnit);
            (<any>adUnit).onStart = new Observable0();
            (<any>adUnit).onClose = new Observable0();
            manager.setCurrentAdUnit(placementId, adUnit);
        });

        describe('on start', () => {
            const otherPlacementId = 'barbaz';

            beforeEach(() => {
                // Normally, I wouldn't advocate for this type of inspection into private members.
                (<any>manager)._placementContentMap[otherPlacementId] = {
                    type: IPlacementContentType.SHOW_AD,
                    state: PlacementContentState.READY
                };

                adUnit.onStart.trigger();
                return new Promise(setTimeout);
            });

            it('should set all other ads to waiting', () => {
                sinon.assert.calledWith(asStub(nativeBridge.Monetization.PlacementContents.setPlacementContentState), otherPlacementId, PlacementContentState.WAITING);
                sinon.assert.calledWith(asStub(nativeBridge.Monetization.Listener.sendPlacementContentStateChanged), otherPlacementId, PlacementContentState.READY, PlacementContentState.WAITING);
            });
        });

        describe('on finish', () => {
            const finishState = FinishState.COMPLETED;

            beforeEach(() => {
                asStub(adUnit.getFinishState).returns(finishState);
                adUnit.onClose.trigger();
                return new Promise(setTimeout);
            });

            it('should call the ad finished listeners for this placement content', () => {
                nativeBridge.Monetization.PlacementContents.sendAdFinished(placementId, finishState);
            });
        });
    });
});