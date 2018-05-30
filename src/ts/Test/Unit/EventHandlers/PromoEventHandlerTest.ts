import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { PromoAdUnit, IPromoAdUnitParameters } from 'AdUnits/PromoAdUnit';
import { PromoEventHandler } from 'EventHandlers/PromoEventHandler';
import { Activity } from 'AdUnits/Containers/Activity';
import { Promo } from 'Views/Promo';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Models/Placement';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { DeviceInfo } from 'Models/DeviceInfo';
import { SessionManager } from 'Managers/SessionManager';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { Request, INativeResponse } from 'Utilities/Request';
import { Session } from 'Models/Session';
import DummyPromo from 'json/DummyPromoCampaign.json';
import { FocusManager } from 'Managers/FocusManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { PurchasingUtilities } from 'Utilities/PurchasingUtilities';
import { Configuration } from 'Models/Configuration';
import { SinonStub, SinonSandbox } from 'sinon';
import { OperativeEventManager } from 'Managers/OperativeEventManager';

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
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('when calling onClose', () => {
        it('should hide adunit', () => {
            promoAdUnit = sinon.createStubInstance(PromoAdUnit);

            PromoEventHandler.onClose(nativeBridge, promoAdUnit, '111', '111', 1, [purchaseTrackingUrls]);
            sinon.assert.called(<sinon.SinonSpy>promoAdUnit.hide);
        });
    });

    describe('when calling onPromo', () => {
        it('should hide adunit', () => {
            promoAdUnit = sinon.createStubInstance(PromoAdUnit);

            PromoEventHandler.onClose(nativeBridge, promoAdUnit, '111', '111', 1, [purchaseTrackingUrls]);
            sinon.assert.called(<sinon.SinonSpy>promoAdUnit.hide);
        });

        it('should call startPurchaseEvent', () => {
            const promoView = <Promo><any> {
                hide: sinon.spy()
            };
            promoAdUnit = sinon.createStubInstance(PromoAdUnit);
            sandbox.stub(PurchasingUtilities, 'sendPromoPayload');

            PromoEventHandler.onPromo(nativeBridge, promoAdUnit, 'com.unit.test.iapproductid', [purchaseTrackingUrls]);
            sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.sendPromoPayload);
        });
    });
});
