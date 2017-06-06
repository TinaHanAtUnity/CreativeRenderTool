import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { PromoAdUnit } from 'AdUnits/PromoAdUnit';
import { PromoEventHandlers } from 'EventHandlers/PromoEventHandlers';
import { Activity } from 'AdUnits/Containers/Activity';
import { Promo } from 'Views/Promo';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Models/Placement';
import { PromoCampaign } from 'Models/PromoCampaign';

describe('PromoEventHandlersTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    const sessionManager = <SessionManager><any>{};
    let container: AdUnitContainer;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
    });

    describe('when calling onClose', () => {
        it('should hide adunit', () => {
            const promoView = <Promo><any> {
                hide: sinon.spy()
            };
            const promoAdUnit = new PromoAdUnit(nativeBridge, container, sessionManager, <Placement><any>{}, <PromoCampaign><any>{}, promoView, {});
            sinon.stub(promoAdUnit, 'hide').returns(sinon.spy());

            PromoEventHandlers.onClose(promoAdUnit);
            sinon.assert.called(<sinon.SinonSpy>promoAdUnit.hide);
        });
    });

    describe('when calling onPromo', () => {
        it('should hide adunit', () => {
            const promoView = <Promo><any> {
                hide: sinon.spy()
            };
            const promoAdUnit = new PromoAdUnit(nativeBridge, container, sessionManager, <Placement><any>{}, <PromoCampaign><any>{}, promoView, {});
            sinon.stub(promoAdUnit, 'hide').returns(sinon.spy());

            PromoEventHandlers.onClose(promoAdUnit);
            sinon.assert.called(<sinon.SinonSpy>promoAdUnit.hide);
        });

        it('should call native listener with the iapProductId', () => {
            const promoView = <Promo><any> {
                hide: sinon.spy()
            };
            const promoAdUnit = new PromoAdUnit(nativeBridge, container, sessionManager, <Placement><any>{}, <PromoCampaign><any>{}, promoView, {});
            sinon.stub(promoAdUnit, 'hide').returns(sinon.spy());
            sinon.stub(nativeBridge.Listener, 'sendInitiatePurchaseEvent');

            PromoEventHandlers.onPromo(nativeBridge, promoAdUnit, 'com.unit.test.iapproductid');
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendInitiatePurchaseEvent, 'com.unit.test.iapproductid');
        });
    });
});
