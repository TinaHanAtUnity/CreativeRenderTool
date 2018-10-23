import 'mocha';
import * as sinon from 'sinon';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Request } from 'Core/Utilities/Request';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { MonetizationListenerApi } from 'Monetization/Native/MonetizationListener';
import { PlacementContentsApi } from 'Monetization/Native/PlacementContents';
import { CustomPurchasingApi } from 'Purchasing/Native/CustomPurchasing';

describe('NativePromoEventHandlerTest', () => {
    let sandbox: sinon.SinonSandbox;
    let nativeBridge: NativeBridge;
    let nativePromoEventHandler: NativePromoEventHandler;
    let clientInfo: ClientInfo;
    let request: Request;
    let focusManager: FocusManager;
    let wakeUpManager: WakeUpManager;

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        nativeBridge.Monetization = {
            Listener: sinon.createStubInstance(MonetizationListenerApi),
            PlacementContents: sinon.createStubInstance(PlacementContentsApi),
            CustomPurchasing: sinon.createStubInstance(CustomPurchasingApi)
        };
        (<sinon.SinonStub>nativeBridge.Monetization.CustomPurchasing.available).resolves(false);
        clientInfo = sinon.createStubInstance(ClientInfo);
        focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        (<sinon.SinonStub>clientInfo.getSdkVersion).returns(3000);
        sandbox.stub(PurchasingUtilities, 'onPurchase');

        nativePromoEventHandler = new NativePromoEventHandler(nativeBridge, clientInfo, request);
        sandbox.stub((<any>nativePromoEventHandler)._thirdPartyEventManager, 'sendWithGet');
        sandbox.stub((<any>nativePromoEventHandler)._thirdPartyEventManager, 'setTemplateValue');
        sandbox.stub(nativePromoEventHandler.onClose, 'trigger');
    });

    afterEach(() => {
       sandbox.restore();
    });

    describe('onImpression', () => {

        it('should replace %ZONE% template value and fire tracking urls for impression', () => {

            return nativePromoEventHandler.onImpression(TestFixtures.getPromoCampaign(), 'test').then(() => {
                sinon.assert.calledWith((<any>nativePromoEventHandler)._thirdPartyEventManager.setTemplateValue, '%ZONE%', 'test');
                sinon.assert.calledThrice((<any>nativePromoEventHandler)._thirdPartyEventManager.sendWithGet);
            });
        });
    });

    describe('onPromoClosed', () => {
        it('should fire tracking urls', () => {
            return nativePromoEventHandler.onPromoClosed(TestFixtures.getPromoCampaign()).then(() => {
                sinon.assert.calledOnce((<any>nativePromoEventHandler)._thirdPartyEventManager.sendWithGet);
            });
        });

        it('should trigger on close to refresh campaigns', () => {
            return nativePromoEventHandler.onPromoClosed(TestFixtures.getPromoCampaign()).then(() => {
                sinon.assert.calledOnce(<sinon.SinonSpy>nativePromoEventHandler.onClose.trigger);
            });
        });
    });

    describe('onClick', () => {
        it('should fire click tracking urls', () => {
            return nativePromoEventHandler.onClick('test', TestFixtures.getPromoCampaign(), 'test').then(() => {
                sinon.assert.calledWith((<any>nativePromoEventHandler)._thirdPartyEventManager.setTemplateValue, '%ZONE%', 'test');
                sinon.assert.calledOnce((<any>nativePromoEventHandler)._thirdPartyEventManager.sendWithGet);
                sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.onPurchase);
            });
        });
    });
});
