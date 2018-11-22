import { IAdsApi } from 'Ads/IAds';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('NativePromoEventHandlerTest', () => {
    let sandbox: sinon.SinonSandbox;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let purchasing: IPurchasingApi;
    let nativePromoEventHandler: NativePromoEventHandler;
    let clientInfo: ClientInfo;
    let request: RequestManager;
    let wakeUpManager: WakeUpManager;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        purchasing = TestFixtures.getPurchasingApi(nativeBridge);
        sinon.stub(purchasing.CustomPurchasing, 'available').resolves(false);
        clientInfo = sinon.createStubInstance(ClientInfo);
        wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        (<sinon.SinonStub>clientInfo.getSdkVersion).returns(3000);
        sandbox.stub(PurchasingUtilities, 'onPurchase');

        nativePromoEventHandler = new NativePromoEventHandler(core, ads, purchasing, clientInfo, request);
        sandbox.stub((<unknown>nativePromoEventHandler)._thirdPartyEventManager, 'sendWithGet');
        sandbox.stub((<unknown>nativePromoEventHandler)._thirdPartyEventManager, 'setTemplateValue');
        sandbox.stub(nativePromoEventHandler.onClose, 'trigger');
    });

    afterEach(() => {
       sandbox.restore();
    });

    describe('onImpression', () => {

        it('should replace %ZONE% template value and fire tracking urls for impression', () => {

            return nativePromoEventHandler.onImpression(TestFixtures.getPromoCampaign(), 'test').then(() => {
                sinon.assert.calledWith((<unknown>nativePromoEventHandler)._thirdPartyEventManager.setTemplateValue, '%ZONE%', 'test');
                sinon.assert.calledThrice((<unknown>nativePromoEventHandler)._thirdPartyEventManager.sendWithGet);
            });
        });
    });

    describe('onPromoClosed', () => {
        it('should fire tracking urls', () => {
            return nativePromoEventHandler.onPromoClosed(TestFixtures.getPromoCampaign()).then(() => {
                sinon.assert.calledOnce((<unknown>nativePromoEventHandler)._thirdPartyEventManager.sendWithGet);
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
                sinon.assert.calledWith((<unknown>nativePromoEventHandler)._thirdPartyEventManager.setTemplateValue, '%ZONE%', 'test');
                sinon.assert.calledOnce((<unknown>nativePromoEventHandler)._thirdPartyEventManager.sendWithGet);
                sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.onPurchase);
            });
        });
    });
});
