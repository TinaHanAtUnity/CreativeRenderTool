import { IAdsApi } from 'Ads/IAds';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import { assert } from 'chai';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { PlayerMetaData } from 'Core/Models/MetaData/PlayerMetaData';

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
    let metadataManager: MetaDataManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let templateValues: [string, string][];

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
        metadataManager = sinon.createStubInstance(MetaDataManager);
        const playerMetaData = sinon.createStubInstance(PlayerMetaData);
        (<sinon.SinonStub>playerMetaData.getServerId).returns('test-serverId');
        (<sinon.SinonStub>metadataManager.fetch).resolves(playerMetaData);

        nativePromoEventHandler = new NativePromoEventHandler(core, ads, purchasing, clientInfo, request, metadataManager);
        (<any>nativePromoEventHandler).createThirdPartyEventManager = (_templateValues: [string, string][]) => {
            templateValues = _templateValues;
            thirdPartyEventManager = new ThirdPartyEventManager(core, request, _templateValues);
            sinon.stub(thirdPartyEventManager, 'sendWithGet');
            return thirdPartyEventManager;
        };
        sandbox.stub(nativePromoEventHandler.onClose, 'trigger');
    });

    afterEach(() => {
       sandbox.restore();
    });

    describe('onImpression', () => {

        it('should replace %ZONE% template value and fire tracking urls for impression', () => {

            return nativePromoEventHandler.onImpression(TestFixtures.getPromoCampaign(), 'test').then(() => {
                assert.deepEqual(templateValues, [
                    [ThirdPartyEventManager.zoneMacro, 'test'],
                    [ThirdPartyEventManager.sdkVersionMacro, '3000'],
                    [ThirdPartyEventManager.gamerSidMacro, 'test-serverId']
                ]);
                sinon.assert.calledThrice(<sinon.SinonStub>thirdPartyEventManager.sendWithGet);
                sinon.assert.calledWith(<sinon.SinonStub>thirdPartyEventManager.sendWithGet, 'impression', '12345', 'http://test.impression.com/blah1');
                sinon.assert.calledWith(<sinon.SinonStub>thirdPartyEventManager.sendWithGet, 'impression', '12345', 'http://test.impression.com/blah2');
                sinon.assert.calledWith(<sinon.SinonStub>thirdPartyEventManager.sendWithGet, 'impression', '12345', 'http://test.impression.com/%ZONE%/blah?sdkVersion=%SDK_VERSION%');
            });
        });
    });

    describe('onPromoClosed', () => {
        it('should fire tracking urls', () => {
            return nativePromoEventHandler.onImpression(TestFixtures.getPromoCampaign(), 'test').then(() => {
                return nativePromoEventHandler.onPromoClosed(TestFixtures.getPromoCampaign()).then(() => {
                    sinon.assert.callCount(<sinon.SinonStub>thirdPartyEventManager.sendWithGet, 4);
                    sinon.assert.calledWith(<sinon.SinonStub>thirdPartyEventManager.sendWithGet, 'complete', '12345', 'http://test.complete.com/complete1');
                });
            });
        });

        it('should trigger on close to refresh campaigns', () => {
            return nativePromoEventHandler.onImpression(TestFixtures.getPromoCampaign(), 'test').then(() => {
                return nativePromoEventHandler.onPromoClosed(TestFixtures.getPromoCampaign()).then(() => {
                    sinon.assert.calledOnce(<sinon.SinonSpy>nativePromoEventHandler.onClose.trigger);
                });
            });
        });
    });

    describe('onClick', () => {
        it('should fire click tracking urls', () => {
            return nativePromoEventHandler.onImpression(TestFixtures.getPromoCampaign(), 'test').then(() => {
                return nativePromoEventHandler.onClick('test', TestFixtures.getPromoCampaign(), 'test').then(() => {
                    sinon.assert.callCount(<sinon.SinonStub>thirdPartyEventManager.sendWithGet, 4);
                    sinon.assert.calledOnce(<sinon.SinonSpy>PurchasingUtilities.onPurchase);
                    sinon.assert.calledWith(<sinon.SinonStub>thirdPartyEventManager.sendWithGet, 'click', '12345', 'http://test.complete.com/click1');
                });
            });
        });
    });
});
