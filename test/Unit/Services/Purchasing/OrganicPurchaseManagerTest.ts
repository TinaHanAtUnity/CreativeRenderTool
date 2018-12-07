import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { OrganicPurchase, IOrganicPurchase, OrganicPurchaseManager } from 'Purchasing/OrganicPurchaseManager';
import { Observable2 } from 'Core/Utilities/Observable';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { RequestManager } from 'Core/Managers/RequestManager';

describe('OrganicPurchaseManager', () => {

    let organicPurchase: OrganicPurchase | undefined;
    let promoEvents: PromoEvents;
    let request: RequestManager;
    let storage: StorageApi;
    let organicPurchaseManager: OrganicPurchaseManager;
    let onSetObservable: Observable2<string, object>;
    let getStub: sinon.SinonStub;
    let setStub: sinon.SinonStub;
    let writeStub: sinon.SinonStub;
    let postStub: sinon.SinonStub;

    beforeEach(() => {
        request = sinon.createStubInstance(RequestManager);
        storage = sinon.createStubInstance(StorageApi);
        promoEvents = sinon.createStubInstance(PromoEvents);
        organicPurchaseManager = new OrganicPurchaseManager(storage, promoEvents, request);

        onSetObservable = new Observable2();
        storage.onSet = onSetObservable;
        getStub = <sinon.SinonStub>storage.get;
        setStub = (<sinon.SinonStub>storage.set);
        writeStub = (<sinon.SinonStub>storage.write);
        postStub = (<sinon.SinonStub>request.post);

        getStub.resolves({});
        setStub.resolves({});
        writeStub.resolves({});
        postStub.resolves({});
        (<sinon.SinonStub>promoEvents.onOrganicPurchaseSuccess).resolves({});
    });

    it('should subscribe to Storage.onSet in initialize', () => {
        const subscribeSpy = sinon.spy(onSetObservable, 'subscribe');
        const unsubscribeSpy = sinon.spy(onSetObservable, 'unsubscribe');
        return organicPurchaseManager.initialize().then(() => {
            sinon.assert.calledTwice(unsubscribeSpy);
            sinon.assert.calledOnce(subscribeSpy);
        });
    });

    it('should call storage get once when onSet triggered', () => {
        return organicPurchaseManager.initialize().then(() => {
            getStub.resetHistory();
            onSetObservable.trigger('test', {});
            sinon.assert.calledOnce(getStub);
        });
    });

    it('should not do anything if iap.purchases is undefined', () => {
        return organicPurchaseManager.initialize().then(() => {
            sinon.assert.calledOnce(getStub);
            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'iap.purchases');
            sinon.assert.notCalled(setStub);
            sinon.assert.notCalled(writeStub);
            sinon.assert.notCalled(postStub);
            sinon.assert.notCalled(<sinon.SinonStub>promoEvents.onOrganicPurchaseSuccess);
        });
    });

    it('happy path with one purchase', () => {
        getStub.resolves([{'productId': 'testId', 'price': 1234, 'currency': 'USD', 'receiptPurchaseData': 'test receipt data', 'signature': 'testSignature'}]);
        return organicPurchaseManager.initialize().then(() => {
            sinon.assert.calledOnce(getStub);
            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'iap.purchases');
            sinon.assert.calledOnce(setStub);
            sinon.assert.calledOnce(writeStub);
            sinon.assert.calledOnce(postStub);
            sinon.assert.calledOnce(<sinon.SinonStub>promoEvents.onOrganicPurchaseSuccess);
            assert.equal(postStub.firstCall.args[0], 'https://events.iap.unity3d.com/events/v1/organic_purchase?native=false&iap_service=false');

        });
    });

    it('happy path with two purchases', () => {
        getStub.resolves([{'productId': 'testId', 'price': 1234, 'currency': 'USD', 'receiptPurchaseData': 'test receipt data', 'signature': 'testSignature'}, {'productId': 'testId', 'price': 1234, 'currency': 'USD', 'receiptPurchaseData': 'test receipt data', 'signature': 'testSignature'}]);
        return organicPurchaseManager.initialize().then(() => {
            sinon.assert.calledOnce(getStub);
            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'iap.purchases');
            sinon.assert.calledOnce(setStub);
            sinon.assert.calledOnce(writeStub);
            sinon.assert.calledTwice(postStub);
            sinon.assert.calledTwice(<sinon.SinonStub>promoEvents.onOrganicPurchaseSuccess);
        });
    });

    describe('Create OrganicPurchase', () => {
        it('create OrganicPurchase with all fields', () => {
            const organicPurchaseEvent: IOrganicPurchase = {
                productId: 'productIDID',
                price: 1.25,
                currency: 'EUR',
                receiptPurchaseData: 'testReceiptPurchaseData',
                signature: 'testSignaure',
                ts: 0
            };
            organicPurchase = new OrganicPurchase(organicPurchaseEvent);

            assert.equal('productIDID', organicPurchase.getId());
            assert.equal(1.25, organicPurchase.getPrice());
            assert.equal('EUR', organicPurchase.getCurrency());
            assert.equal('testReceiptPurchaseData', organicPurchase.getReceipt());
            assert.deepEqual('testSignaure', organicPurchase.getSignature());
        });

        it('create OrganicPurchase with missing fields', () => {
            const organicPurchaseEvent: IOrganicPurchase = <IOrganicPurchase>{
                productId: 'productIDID',
                price: 1.25
            };
            organicPurchase = new OrganicPurchase(organicPurchaseEvent);

            assert.equal('productIDID', organicPurchase.getId());
            assert.equal(1.25, organicPurchase.getPrice());
            assert.isUndefined(organicPurchase.getCurrency());
            assert.isUndefined(organicPurchase.getReceipt());
            assert.isUndefined(organicPurchase.getSignature());
        });

        it('create OrganicPurchase with no value', () => {
            const organicPurchaseEvent: IOrganicPurchase = <any>undefined;
            organicPurchase = new OrganicPurchase(organicPurchaseEvent);

            assert.exists(organicPurchase);
            assert.isUndefined(organicPurchase.getId());
        });

        it('create OrganicPurchase with extra key', () => {
            const organicPurchaseEvent: IOrganicPurchase = <IOrganicPurchase><any>{
                productId: 'productIDID',
                price: 1.25,
                currency: 'EUR',
                receiptPurchaseData: 'testReceiptPurchaseData',
                signature: 'testSignaure',
                extraKey: 'test'
            };
            try {
                organicPurchase = new OrganicPurchase(organicPurchaseEvent);
                assert.fail('should throw');
            } catch (error) {
                assert.exists(error);
            }
        });
    });

});
