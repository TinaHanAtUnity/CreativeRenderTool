import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { AppleStoreManager } from 'Store/Managers/AppleStoreManager';
import { IStoreApi } from 'Store/IStore';
import { ICore } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { ProductsApi } from 'Store/Native/iOS/Products';
import { AppSheetApi } from 'Store/Native/iOS/AppSheet';
import { ProgrammaticTrackingService, PurchasingMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';

class ProductsApiMock extends ProductsApi {
    public readonly onProductRequestErrorNoProducts = sinon.createStubInstance(Observable1);
    public readonly onProductRequestComplete = sinon.createStubInstance(Observable2);
    public readonly onProductRequestFailed = sinon.createStubInstance(Observable2);
    public readonly onTransaction = sinon.createStubInstance(Observable1);

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge);
        sinon.stub(this, 'startTransactionObserver');
    }
}

describe('AppleStoreManager Tests', () => {

    let core: ICore;
    let products: ProductsApi;
    let appSheet: AppSheetApi;
    let store: IStoreApi;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let appleStoreManager: AppleStoreManager;

    beforeEach(() => {
        const nativeBridge = TestFixtures.getNativeBridge(Platform.IOS, TestFixtures.getBackend(Platform.IOS));
        core = TestFixtures.getCoreModule(nativeBridge);
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        core.ProgrammaticTrackingService = programmaticTrackingService;
        products = new ProductsApiMock(nativeBridge);
        appSheet = sinon.createStubInstance(AppSheetApi);
        store = {
            iOS: {
                Products: products,
                AppSheet: appSheet
            }
        }
        appleStoreManager = new AppleStoreManager(core, store);
        assert.exists(appleStoreManager);
    });

    describe('Constructor sets up object', () => {

        it('Subscribes to onTransaction', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>products.onTransaction.subscribe);
        });

        it('Starts transaction Observer', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>products.startTransactionObserver);
        });

        it('Reports PurchasingAppleStoreStarted', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>programmaticTrackingService.reportMetric);
            sinon.assert.calledWith(<sinon.SinonSpy>programmaticTrackingService.reportMetric, PurchasingMetric.PurchasingAppleStoreStarted);
        });

    });

});
