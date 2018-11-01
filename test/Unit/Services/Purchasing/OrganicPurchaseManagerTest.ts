import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CustomPurchasingAdapter } from 'Purchasing/CustomPurchasingAdapter';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { Request } from 'Core/Utilities/Request';
import { CustomPurchasingApi } from 'Purchasing/Native/CustomPurchasing';
import { OrganicPurchase, IOrganicPurchase } from 'Purchasing/OrganicPurchaseManager';
import { IProduct, ITransactionErrorDetails, ITransactionDetails} from 'Purchasing/PurchasingAdapter';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { asStub } from 'TestHelpers/Functions';
import { StorageApi, StorageType } from 'Core/Native/Storage';

describe('CustomPurchasingAdapter', () => {
    let nativeBridge: NativeBridge;
    // let analyticsManager: AnalyticsManager;
    let promoEvents: PromoEvents;
    let request: Request;
    let sandbox: sinon.SinonSandbox;
    let purchasingAdapter: CustomPurchasingAdapter;
    // let customPurchasing: CustomPurchasingApi;
    let onSetStub: sinon.SinonStub;
    let getStub: sinon.SinonStub;
    let setStub: sinon.SinonStub;
    // let writeStub: sinon.SinonStub;
    let iapMetaData:any;
    let organicPurchase: OrganicPurchase | undefined; 
    let storageTrigger: (eventType: string, data: any) => void;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        //analyticsManager = sinon.createStubInstance(AnalyticsManager);
        //promoEvents = sinon.createStubInstance(PromoEvents);
        request = sinon.createStubInstance(Request);
        sandbox = sinon.createSandbox();
        //customPurchasing = sinon.createStubInstance(CustomPurchasingApi);

        nativeBridge.Storage = sinon.createStubInstance(StorageApi);
        (<any>nativeBridge.Storage).onSet = new Observable2<string, object>();
        onSetStub = sinon.stub(nativeBridge.Storage.onSet, 'subscribe');
        getStub = <sinon.SinonStub>nativeBridge.Storage.get;
        setStub = (<sinon.SinonStub>nativeBridge.Storage.set).resolves();
        // writeStub = (<sinon.SinonStub>nativeBridge.Storage.write).resolves();
        iapMetaData = '{ iap_purchases: {productId: {value: \'productIDID\'}, price: {value:1.25} }}';
        
        getStub.callsFake((fun) => {
           return Promise.resolve(iapMetaData);
        });
        onSetStub.callsFake((fun) => {
            storageTrigger = fun;
        });

        // (<any>nativeBridge).Monetization = {
        //     CustomPurchasing: customPurchasing
        // };

        // (<sinon.SinonStub>customPurchasing.refreshCatalog).returns(Promise.resolve());
        // (<sinon.SinonStub>customPurchasing.purchaseItem).returns(Promise.resolve());

        // (<any>nativeBridge).Monetization.CustomPurchasing.onProductsRetrieved = new Observable1<IProduct[]>();
        // (<any>nativeBridge).Monetization.CustomPurchasing.onTransactionComplete = new Observable1<ITransactionDetails>();
        // (<any>nativeBridge).Monetization.CustomPurchasing.onTransactionError = new Observable1<ITransactionErrorDetails>();

        //purchasingAdapter = new CustomPurchasingAdapter(nativeBridge, analyticsManager, promoEvents, request);
        sandbox.stub((<any>purchasingAdapter)._thirdPartyEventManager, 'sendWithGet');
        sandbox.stub((<any>purchasingAdapter)._thirdPartyEventManager, 'sendWithPost');
    });

    // const triggerRefreshCatalog = (value: IProduct[]) => {
    //     return new Promise((resolve) => {
    //         (<any>nativeBridge).Monetization.CustomPurchasing.onProductsRetrieved.trigger(value);
    //         setTimeout(resolve);
    //     });
    // };

    // const triggerTransactionComplete = (value: ITransactionDetails) => {
    //     return new Promise((resolve) => {
    //         (<any>nativeBridge).Monetization.CustomPurchasing.onTransactionComplete.trigger(value);
    //         setTimeout(resolve);
    //     });
    // };

    // const triggerTransactionError = (value: ITransactionErrorDetails) => {
    //     return new Promise((resolve) => {
    //         (<any>nativeBridge).Monetization.CustomPurchasing.onTransactionError.trigger(value);
    //         setTimeout(resolve);
    //     });
    // };

    afterEach(() => {
        sandbox.restore();
    });

    it('should subscribe to Storage.onSet', () => {
        sinon.assert.calledOnce(onSetStub);
    });

    describe('iap.purchases metadata', () => {
        it('should not do anything if iap.purchases is undefined', () => {
            storageTrigger('', {});
            sinon.assert.calledOnce(onSetStub);
            sinon.assert.notCalled(setStub);
        });

        it('should retrieve iap.purchase metadata',() => {
            iapMetaData = '{ iap_purchases: {productId: {value: \'productIDID\'}, price: {value:1.25} }}';
            storageTrigger('', {'iap.purchases': {productId: {value: 'productIDID'}, price: {value:1.25} }});
            asStub(promoEvents.onOrganicPurchaseSuccess).returns(Promise.resolve());
            return Promise.resolve().then(() => {
                sinon.assert.calledOnce(onSetStub);
                sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'iap.purchases');
                sinon.assert.calledWith(setStub, StorageType.PUBLIC, 'iap.purchases', []);
                return(<Promise<void>>getStub.firstCall.returnValue).then((data) => {
                    assert.deepEqual(data, iapMetaData);
                    sinon.assert.called(<sinon.SinonStub>promoEvents.onOrganicPurchaseSuccess);
                    sinon.assert.called(<sinon.SinonStub>request.post);
                });
            });
        });
        it('should reset iap.purchase metadata after each retrieve', () => {
            sinon.assert.calledOnce(onSetStub);
            return(<Promise<void>>getStub.firstCall.returnValue).then((data) => {
                assert.isUndefined(data);
            });
        });
    });

    describe('Create OrganicPurchase', () => {
        it('create OrganicPurchase with all fields', () => {
            const organicPurchaseEvent: IOrganicPurchase = {
                productId: 'productIDID',
                price: 1.25,
                currency: 'EUR',
                receiptPurchaseData: 'testReceiptPurchaseData',
                signature: 'testSignaure'
            } 
            organicPurchase = new OrganicPurchase(organicPurchaseEvent);
            
            assert.deepEqual('productIDID', organicPurchase.getId());
            assert.deepEqual(1.25, organicPurchase.getPrice());
            assert.deepEqual('EUR', organicPurchase.getCurrency());
            assert.deepEqual('testReceiptPurchaseData', organicPurchase.getReceipt());
            assert.deepEqual('testSignaure', organicPurchase.getSignature());
        });

        xit('create OrganicPurchase with missing fields', () => {
            const organicPurchaseEvent: IOrganicPurchase = {
                productId: 'productIDID',
                price: 1.25,
                currency: 'EUR',
                receiptPurchaseData: 'testReceiptPurchaseData',
                signature: 'testSignaure'
            }; 
            organicPurchase = new OrganicPurchase(organicPurchaseEvent);

            assert.deepEqual('productIDID', organicPurchase.getId());
            assert.deepEqual(1.25, organicPurchase.getPrice());
            assert.isUndefined(organicPurchase.getCurrency());
            assert.isUndefined(organicPurchase.getReceipt());
            assert.isUndefined(organicPurchase.getSignature());
        });

        xit('create OrganicPurchase with no value', () => {
            const organicPurchaseEvent: IOrganicPurchase = {
                productId: 'productIDID',
                price: 1.25,
                currency: 'EUR',
                receiptPurchaseData: 'testReceiptPurchaseData',
                signature: 'testSignaure'
            } 
            organicPurchase = new OrganicPurchase(organicPurchaseEvent);

            assert.exists(organicPurchase);
            assert.isUndefined(organicPurchase.getId());
        });

        xit('create OrganicPurchase with unexpected key', () => {
            const organicPurchaseEvent: IOrganicPurchase = {
                productId: 'productIDID',
                price: 1.25,
                currency: 'EUR',
                receiptPurchaseData: 'testReceiptPurchaseData',
                signature: 'testSignaure'
            } 
            organicPurchase = new OrganicPurchase(organicPurchaseEvent);

            assert.deepEqual('productIDID', organicPurchase.getId());
            assert.deepEqual(1.25, organicPurchase.getPrice());
            assert.isUndefined(organicPurchase.getCurrency());
            assert.isUndefined(organicPurchase.getReceipt());
            assert.isUndefined(organicPurchase.getSignature());
        });
    });

});
