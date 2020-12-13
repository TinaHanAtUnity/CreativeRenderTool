import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { AppleStoreManager } from 'Store/Managers/AppleStoreManager';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { ProductsApi } from 'Store/Native/iOS/Products';
import { AppSheetApi } from 'Store/Native/iOS/AppSheet';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
class ProductsApiMock extends ProductsApi {
    constructor(nativeBridge) {
        super(nativeBridge);
        this.onProductRequestErrorNoProducts = sinon.createStubInstance(Observable1);
        this.onProductRequestComplete = sinon.createStubInstance(Observable2);
        this.onProductRequestFailed = sinon.createStubInstance(Observable2);
        this.onTransaction = sinon.createStubInstance(Observable1);
        sinon.stub(this, 'startTransactionObserver');
    }
}
describe('AppleStoreManager Tests', () => {
    let products;
    let appSheet;
    let store;
    let appleStoreManager;
    let analyticsManager;
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
            sinon.assert.calledOnce(products.onTransaction.subscribe);
        });
        it('Starts transaction Observer', () => {
            sinon.assert.calledOnce(products.startTransactionObserver);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwbGVTdG9yZU1hbmFnZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1N0b3JlL01hbmFnZXJzL0FwcGxlU3RvcmVNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFFckUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXhELE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFckUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFOUQsTUFBTSxlQUFnQixTQUFRLFdBQVc7SUFNckMsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7UUFOUixvQ0FBK0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDeEUsNkJBQXdCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pFLDJCQUFzQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvRCxrQkFBYSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUlsRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0lBQ2pELENBQUM7Q0FDSjtBQUVELFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7SUFFckMsSUFBSSxRQUFxQixDQUFDO0lBQzFCLElBQUksUUFBcUIsQ0FBQztJQUMxQixJQUFJLEtBQWdCLENBQUM7SUFDckIsSUFBSSxpQkFBb0MsQ0FBQztJQUN6QyxJQUFJLGdCQUFtQyxDQUFDO0lBRXhDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN2RyxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5RCxRQUFRLEdBQUcsSUFBSSxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDN0MsUUFBUSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNqRCxLQUFLLEdBQUc7WUFDSixHQUFHLEVBQUU7Z0JBQ0QsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFFBQVEsRUFBRSxRQUFRO2FBQ3JCO1NBQ0osQ0FBQztRQUNGLGlCQUFpQixHQUFHLElBQUksaUJBQWlCLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDbkUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3JDLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtRQUV4QyxFQUFFLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO1lBQ25DLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFpQixRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlFLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtZQUNuQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsUUFBUSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDL0UsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDIn0=