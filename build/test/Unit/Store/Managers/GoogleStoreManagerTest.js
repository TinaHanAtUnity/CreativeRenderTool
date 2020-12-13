import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { AndroidStoreApi } from 'Store/Native/Android/Store';
import { GoogleStoreManager } from 'Store/Managers/GoogleStoreManager';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { Observable0, Observable2, Observable3 } from 'Core/Utilities/Observable';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
class AndroidStoreApiMock extends AndroidStoreApi {
    constructor(nativeBridge) {
        super(nativeBridge);
        this.onInitialized = sinon.createStubInstance(Observable0);
        this.onInitializationFailed = sinon.createStubInstance(Observable0);
        this.onDisconnected = sinon.createStubInstance(Observable0);
        this.onBillingSupportedResult = sinon.createStubInstance(Observable2);
        this.onBillingSupportedError = sinon.createStubInstance(Observable3);
        this.onGetPurchasesResult = sinon.createStubInstance(Observable2);
        this.onGetPurchasesError = sinon.createStubInstance(Observable3);
        this.onPurchaseHistoryResult = sinon.createStubInstance(Observable2);
        this.onPurchaseHistoryError = sinon.createStubInstance(Observable3);
        this.onSkuDetailsResult = sinon.createStubInstance(Observable2);
        this.onSkuDetailsError = sinon.createStubInstance(Observable3);
        this.onPurchaseStatusOnResume = sinon.createStubInstance(Observable2);
        this.onPurchaseStatusOnResumeError = sinon.createStubInstance(Observable3);
        this.onPurchaseStatusOnStop = sinon.createStubInstance(Observable2);
        this.onPurchaseStatusOnStopError = sinon.createStubInstance(Observable3);
        sinon.stub(this, 'initialize');
    }
}
describe('GoogleStoreManager Tests', () => {
    let androidStore;
    let store;
    let googleStoreManager;
    let analyticsManager;
    beforeEach(() => {
        const nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, TestFixtures.getBackend(Platform.ANDROID));
        androidStore = new AndroidStoreApiMock(nativeBridge);
        store = {
            Android: {
                Store: androidStore
            }
        };
        analyticsManager = sinon.createStubInstance(AnalyticsManager);
        googleStoreManager = new GoogleStoreManager(store, analyticsManager);
        assert.exists(googleStoreManager);
    });
    describe('Constructor sets up object', () => {
        it('Subscribes to onInitialized', () => {
            sinon.assert.calledOnce(androidStore.onInitialized.subscribe);
        });
        it('Subscribes to onInitializationFailed', () => {
            sinon.assert.calledOnce(androidStore.onInitializationFailed.subscribe);
        });
        it('Subscribes to onDisconnected', () => {
            sinon.assert.calledOnce(androidStore.onDisconnected.subscribe);
        });
        it('Subscribes to onPurchaseStatusOnResume', () => {
            sinon.assert.calledOnce(androidStore.onPurchaseStatusOnResume.subscribe);
        });
        it('Subscribes to onPurchaseStatusOnStop', () => {
            sinon.assert.calledOnce(androidStore.onPurchaseStatusOnStop.subscribe);
        });
        it('initializes android store', () => {
            sinon.assert.calledOnce(androidStore.initialize);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR29vZ2xlU3RvcmVNYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9TdG9yZS9NYW5hZ2Vycy9Hb29nbGVTdG9yZU1hbmFnZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU5QixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDdkUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUdsRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUU5RCxNQUFNLG1CQUFvQixTQUFRLGVBQWU7SUFpQjdDLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBakJSLGtCQUFhLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RELDJCQUFzQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvRCxtQkFBYyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2RCw2QkFBd0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakUsNEJBQXVCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hF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