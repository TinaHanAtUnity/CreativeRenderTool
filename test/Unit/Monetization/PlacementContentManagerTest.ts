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
import {
    IPlacementContentParams,
    IPlacementContentType,
    PlacementContentsApi
} from 'Monetization/Native/PlacementContents';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingApi } from 'Promo/Native/Purchasing';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import * as sinon from 'sinon';
import { asStub } from 'TestHelpers/Functions';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IMonetizationApi } from 'Monetization/IMonetization';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { IPromoApi } from 'Promo/IPromo';
import { IAdsApi } from 'Ads/IAds';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('PlacementContentManager', () => {
        let manager: PlacementContentManager;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let ads: IAdsApi;
        let monetization: IMonetizationApi;
        let promo: IPromoApi;
        let campaignManager: CampaignManager;
        let placementManager: PlacementManager;
        let configuration: AdsConfiguration;

        beforeEach(() => {
            configuration = TestFixtures.getAdsConfiguration();
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            ads = TestFixtures.getAdsApi(nativeBridge);
            monetization = TestFixtures.getMonetizationApi(nativeBridge);
            promo = TestFixtures.getPromoApi(nativeBridge);

            sinon.stub(monetization.PlacementContents, 'createPlacementContent').resolves();
            sinon.stub(monetization.PlacementContents, 'setPlacementContentState').resolves();
            sinon.stub(monetization.Listener, 'sendPlacementContentReady').resolves();
            sinon.stub(monetization.Listener, 'sendPlacementContentStateChanged').resolves();
            campaignManager = sinon.createStubInstance(CampaignManager);
            (<any>campaignManager).onCampaign = new Observable2<string, Campaign>();
            (<any>campaignManager).onNoFill = new Observable1<string>();
            (<any>promo.Purchasing).onIAPSendEvent = new Observable1<string>();
            placementManager = new PlacementManager(ads, configuration);

            sinon.stub(placementManager, 'getPlacementCampaignMap').returns({
                'promoId': TestFixtures.getPromoCampaign(),
                'performanceId': TestFixtures.getXPromoCampaign()
            });

            manager = new PlacementContentManager(monetization, promo, configuration, campaignManager, placementManager);
        });

        describe('creating placement content', () => {
            type Matcher = (placement: Placement, campaign: Campaign, params: IPlacementContentParams) => void;

            interface ITest {
                name: string;
                placementId: string;
                campaign: Campaign;
                matcher: Matcher;
            }

            let sandbox: sinon.SinonSandbox;
            beforeEach(() => {
                sandbox = sinon.createSandbox();
                sandbox.stub(PurchasingUtilities, 'getProductName').returns('Example Product');
                sandbox.stub(PurchasingUtilities, 'getProductLocalizedPrice').returns('$1.99');
                sandbox.stub(PurchasingUtilities, 'addCampaignPlacementIds');
            });
            afterEach(() => {
                sandbox.restore();
            });

            const t: ITest[] = [{
                name: 'Performance Campaign (Rewarded)',
                placementId: 'rewardedVideoZone',
                campaign: TestFixtures.getCampaign(),
                matcher: (placement, campaign, params) => {
                    assert.equal(params.type, IPlacementContentType.SHOW_AD);
                    assert.equal(params.rewarded, !placement.allowSkip());
                }
            }, {
                name: 'Promo Campaign',
                placementId: 'rewardedVideoZone',
                campaign: TestFixtures.getPromoCampaign(),
                matcher: (placement, campaign, params) => {
                    if(campaign instanceof PromoCampaign) {
                        assert.equal(params.type, IPlacementContentType.PROMO_AD);
                        assert.equal(params.product.localizedPrice, PurchasingUtilities.getProductLocalizedPrice(params.productId));
                        assert.equal(params.product.localizedPriceString, PurchasingUtilities.getProductPrice(params.productId));
                        assert.equal(params.product.localizedTitle, PurchasingUtilities.getProductName(params.productId));
                        assert.equal(params.product.productId, campaign.getIapProductId());
                        assert.equal(params.costs.length, campaign.getCosts().length);
                        assert.equal(params.costs[0].itemId, campaign.getCosts()[0].getId());
                        assert.equal(params.costs[0].quantity, campaign.getCosts()[0].getQuantity());
                        assert.equal(params.costs[0].type, campaign.getCosts()[0].getType());
                        assert.equal(params.payouts.length, campaign.getPayouts().length);
                        assert.equal(params.payouts[0].itemId, campaign.getPayouts()[0].getId());
                        assert.equal(params.payouts[0].type, campaign.getPayouts()[0].getType());
                        assert.equal(params.payouts[0].quantity, campaign.getPayouts()[0].getQuantity());
                    } else {
                        assert.fail('campaign must be of type PromoCampaign');
                    }
                }
            }];

            t.forEach((tt, i) => {

                beforeEach(() => {
                    campaignManager.onCampaign.trigger(tt.placementId, tt.campaign);
                    return new Promise(setTimeout);
                });

                describe(`on campaign for ${tt.name}`, () => {
                    it('should be created with proper params', () => {
                        const call = asStub(monetization.PlacementContents.createPlacementContent).getCall(i);
                        tt.matcher(configuration.getPlacement(tt.placementId), tt.campaign, call.args[1]);
                    });

                    it('should send placement content state change events', () => {
                        sinon.assert.calledWith(asStub(monetization.PlacementContents.setPlacementContentState), tt.placementId, PlacementContentState.READY);
                        sinon.assert.calledWith(asStub(monetization.Listener.sendPlacementContentStateChanged), tt.placementId, PlacementContentState.WAITING, PlacementContentState.READY);
                    });

                    it('should send placement content state as ready', () => {
                        sinon.assert.calledWith(asStub(monetization.Listener.sendPlacementContentReady), tt.placementId);
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
                    const call = asStub(monetization.PlacementContents.createPlacementContent).getCall(0);
                    const params = call.args[1];
                    assert.equal(params.type, IPlacementContentType.NO_FILL);
                    assert.equal(params[0], placementId);
                });

                it('should set the placement content state as undecided', () => {
                    sinon.assert.calledWith(asStub(monetization.PlacementContents.setPlacementContentState), placementId, PlacementContentState.NO_FILL);
                    sinon.assert.calledWith(asStub(monetization.Listener.sendPlacementContentStateChanged), placementId, PlacementContentState.WAITING, PlacementContentState.NO_FILL);
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
                    sinon.assert.calledWith(asStub(monetization.PlacementContents.setPlacementContentState), otherPlacementId, PlacementContentState.WAITING);
                    sinon.assert.calledWith(asStub(monetization.Listener.sendPlacementContentStateChanged), otherPlacementId, PlacementContentState.READY, PlacementContentState.WAITING);
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
                    monetization.PlacementContents.sendAdFinished(placementId, finishState);
                });
            });
        });

        describe('Handling PlacementContent SendEvent', () => {
            let sandbox: sinon.SinonSandbox;

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                sandbox.stub(PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve([{
                    productId: 'asdf',
                    localizedPriceString: 'asdf',
                    localizedTitle: 'asdf',
                    productType: 'asdfasdf',
                    isoCurrencyCode: 'asdfa',
                    localizedPrice: 1
                }]));
            });
            afterEach(() => {
                sandbox.restore();
            });

            it('Should call refresh catalog when IAP payload type is CatalogUpdated', () => {
                promo.Purchasing.onIAPSendEvent.trigger('{"type": "CatalogUpdated"}');

                sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.refreshCatalog);
            });

            it('should not handle update when passed IAP payload type is not CatalogUpdated', () => {
                promo.Purchasing.onIAPSendEvent.trigger('{"type": "CatalogUpdaed"}');

                sinon.assert.notCalled(<sinon.SinonSpy>PurchasingUtilities.refreshCatalog);
            });

            describe('if product is not in the catalog', () => {
                beforeEach(() => {
                    sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(false);

                    promo.Purchasing.onIAPSendEvent.trigger('{"type": "CatalogUpdated"}');
                    return new Promise(setTimeout);
                });

                it('should set the current placementContent state to waiting', () => {
                    sinon.assert.calledWith(asStub(monetization.Listener.sendPlacementContentStateChanged), 'promoId', PlacementContentState.NOT_AVAILABLE, PlacementContentState.WAITING);
                });
            });

            describe('if product is in the catalog', () => {
                beforeEach(() => {
                    sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);

                    promo.Purchasing.onIAPSendEvent.trigger('{"type": "CatalogUpdated"}');
                    return new Promise(setTimeout);
                });

                it('should mark placement as ready if product is in the catalog', () => {
                    sinon.assert.calledWith(asStub(monetization.Listener.sendPlacementContentReady), 'promoId');
                });
            });
        });
    });
});
