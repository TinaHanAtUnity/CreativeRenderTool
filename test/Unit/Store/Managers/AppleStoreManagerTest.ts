import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { AppleStoreManager } from 'Store/Managers/AppleStoreManager';
import { IStoreApi } from 'Store/IStore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { ProductsApi } from 'Store/Native/iOS/Products';
import { AppSheetApi } from 'Store/Native/iOS/AppSheet';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';

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

    let products: ProductsApi;
    let appSheet: AppSheetApi;
    let store: IStoreApi;
    let appleStoreManager: AppleStoreManager;
    let analyticsManager: IAnalyticsManager;

    beforeEach(() => {
        const nativeBridge = TestFixtures.getNativeBridge(Platform.IOS, TestFixtures.getBackend(Platform.IOS));
        analyticsManager = sinon.createStubInstance(AnalyticsManager);
        products = new ProductsApiMock(nativeBridge);
        appSheet = sinon.createStubInstance(AppSheetApi);
        store = {
            iOS: {
                Products: products,
                AppSheet: appSheet
            }
        };
        appleStoreManager = new AppleStoreManager(store, analyticsManager);
        assert.exists(appleStoreManager);
    });

    describe('Constructor sets up object', () => {

        it('Subscribes to onTransaction', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>products.onTransaction.subscribe);
        });

        it('Starts transaction Observer', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>products.startTransactionObserver);
        });

    });

});
