import { GdprManager } from 'Ads/Managers/GdprManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { FinishState } from 'Core/Constants/FinishState';
import { ABGroupBuilder } from 'Core/Models/ABGroup';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

import DummyPromo from 'json/DummyPromoCampaign.json';
import 'mocha';
import { PromoAdUnit } from 'Promo/AdUnits/PromoAdUnit';
import { PromoEventHandler } from 'Promo/EventHandlers/PromoEventHandler';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('PromoEventHandlersTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    const json = JSON.parse(DummyPromo);
    let nativeBridge: NativeBridge;
    let promoAdUnit: PromoAdUnit;
    let sandbox: sinon.SinonSandbox;
    const purchaseTrackingUrls = 'https://events.iap.unity3d.com/events/v1/purchase?co=USA&creid=5a57d399d7482b0945616f35&gid=1019712&pjid=c4b860aa-e0a8-4a58-9f6c-95d419461f1e&plid=placementA&pmid=5a57d3a206a1590006a1d28e&prdid=com.product.2&stky=0&store=google&txid=UX-47c9ac4c-39c5-4e0e-685kl%3Bkl%3Be-66d4619dcc81&uid=567f09ab1ae7f2fc01402d9e&val=4.99';

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        sandbox.stub(PurchasingUtilities, 'onPromoClosed');
        sandbox.stub(PurchasingUtilities, 'onPurchase');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('when calling onClose', () => {
        it('should hide adunit', () => {
            promoAdUnit = sinon.createStubInstance(PromoAdUnit);

            PromoEventHandler.onClose(promoAdUnit, TestFixtures.getPromoCampaign(), 'myCoolPlacement');
            sinon.assert.called(<sinon.SinonSpy>promoAdUnit.hide);
        });

        it('should set adunit finish state to completed', () => {
            promoAdUnit = sinon.createStubInstance(PromoAdUnit);

            PromoEventHandler.onClose(promoAdUnit, TestFixtures.getPromoCampaign(), 'myCoolPlacement');
            sinon.assert.calledWith(<sinon.SinonStub>promoAdUnit.setFinishState, FinishState.COMPLETED);
        });

        it('should call sendPromoPayload', () => {
            promoAdUnit = sinon.createStubInstance(PromoAdUnit);

            PromoEventHandler.onClose(promoAdUnit, TestFixtures.getPromoCampaign(), 'myCoolPlacement');
            sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.onPromoClosed);
        });
    });

    describe('when calling onPromoClick', () => {
        it('should hide adunit', () => {
            promoAdUnit = sinon.createStubInstance(PromoAdUnit);

            PromoEventHandler.onPromoClick(promoAdUnit, TestFixtures.getPromoCampaign(), 'myCoolPlacement');
            sinon.assert.called(<sinon.SinonSpy>promoAdUnit.hide);
        });

        it('should set adunit finish state to completed', () => {
            promoAdUnit = sinon.createStubInstance(PromoAdUnit);

            PromoEventHandler.onPromoClick(promoAdUnit, TestFixtures.getPromoCampaign(), 'myCoolPlacement');
            sinon.assert.calledWith(<sinon.SinonStub>promoAdUnit.setFinishState, FinishState.COMPLETED);
        });

        it('should call onPurchase', () => {
            promoAdUnit = sinon.createStubInstance(PromoAdUnit);

            PromoEventHandler.onPromoClick(promoAdUnit, TestFixtures.getPromoCampaign(), 'myCoolPlacement');
            sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.onPurchase);
        });
    });

    describe('when calling onGDPRPopupSkipped', () => {
        let gdprManager: GdprManager;

        beforeEach(() => {
            gdprManager = sinon.createStubInstance(GdprManager);
        });

        it ('should set the optOutRecorded flag in the configuration', () => {
            const config = sinon.createStubInstance(AdsConfiguration);

            config.isOptOutRecorded.returns(false);

            PromoEventHandler.onGDPRPopupSkipped(config, gdprManager);
            sinon.assert.calledWith(<sinon.SinonSpy>config.setOptOutRecorded, true);
        });

        it('should send GDPR operative Event with skip', () => {
            const config = sinon.createStubInstance(AdsConfiguration);

            config.isOptOutRecorded.returns(false);

            PromoEventHandler.onGDPRPopupSkipped(config, gdprManager);
            sinon.assert.calledWithExactly(<sinon.SinonSpy>gdprManager.sendGDPREvent, 'skip');
        });

        it('should not call gdpr or set optOutRecorded when already recorded', () => {
            const config = sinon.createStubInstance(AdsConfiguration);

            config.isOptOutRecorded.returns(true);
            PromoEventHandler.onGDPRPopupSkipped(config, gdprManager);
            sinon.assert.notCalled(<sinon.SinonSpy>config.setOptOutRecorded);
            sinon.assert.notCalled(<sinon.SinonSpy>gdprManager.sendGDPREvent);
        });
    });
});
