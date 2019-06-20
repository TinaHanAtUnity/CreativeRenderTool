import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { ICore } from 'Core/ICore';
import { IStoreApi } from 'Store/IStore';
import { AndroidStoreApi } from 'Store/Native/Android/Store';
import { ProgrammaticTrackingService, PurchasingMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { GoogleStoreManager } from 'Store/Managers/GoogleStoreManager';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { Observable0, Observable2, Observable3 } from 'Core/Utilities/Observable';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

class AndroidStoreApiMock extends AndroidStoreApi {
    public readonly onInitialized = sinon.createStubInstance(Observable0);
    public readonly onInitializationFailed = sinon.createStubInstance(Observable0);
    public readonly onDisconnected = sinon.createStubInstance(Observable0);
    public readonly onBillingSupportedResult = sinon.createStubInstance(Observable2);
    public readonly onBillingSupportedError = sinon.createStubInstance(Observable3);
    public readonly onGetPurchasesResult = sinon.createStubInstance(Observable2);
    public readonly onGetPurchasesError = sinon.createStubInstance(Observable3);
    public readonly onPurchaseHistoryResult = sinon.createStubInstance(Observable2);
    public readonly onPurchaseHistoryError = sinon.createStubInstance(Observable3);
    public readonly onSkuDetailsResult = sinon.createStubInstance(Observable2);
    public readonly onSkuDetailsError = sinon.createStubInstance(Observable3);
    public readonly onPurchaseStatusOnResume = sinon.createStubInstance(Observable2);
    public readonly onPurchaseStatusOnResumeError = sinon.createStubInstance(Observable3);
    public readonly onPurchaseStatusOnStop = sinon.createStubInstance(Observable2);
    public readonly onPurchaseStatusOnStopError = sinon.createStubInstance(Observable3);

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge);
        sinon.stub(this, 'initialize');
    }
}

describe('GoogleStoreManager Tests', () => {
    let core: ICore;
    let androidStore: AndroidStoreApi;
    let store: IStoreApi;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let googleStoreManager: GoogleStoreManager;

    beforeEach(() => {
        const nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, TestFixtures.getBackend(Platform.ANDROID));
        core = TestFixtures.getCoreModule(nativeBridge);
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        core.ProgrammaticTrackingService = programmaticTrackingService;
        androidStore = new AndroidStoreApiMock(nativeBridge);
        store = {
            Android: {
                Store: androidStore
            }
        };
        googleStoreManager = new GoogleStoreManager(core, store);
        assert.exists(googleStoreManager);
    });

    describe('Constructor sets up object', () => {

        it('Subscribes to onInitialized', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>androidStore.onInitialized.subscribe);
        });

        it('Subscribes to onInitializationFailed', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>androidStore.onInitializationFailed.subscribe);
        });

        it('Subscribes to onDisconnected', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>androidStore.onDisconnected.subscribe);
        });

        it('Subscribes to onPurchaseStatusOnResume', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>androidStore.onPurchaseStatusOnResume.subscribe);
        });

        it('Subscribes to onPurchaseStatusOnStop', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>androidStore.onPurchaseStatusOnStop.subscribe);
        });

        it('initializes android store', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>androidStore.initialize);
        });

        it('Reports PurchasingGoogleStoreStarted', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>programmaticTrackingService.reportMetric);
            sinon.assert.calledWith(<sinon.SinonSpy>programmaticTrackingService.reportMetric, PurchasingMetric.PurchasingGoogleStoreStarted);
        });

    });

});
