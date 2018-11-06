import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { Request } from 'Core/Utilities/Request';
import { OrganicPurchase, IOrganicPurchase, OrganicPurchaseManager } from 'Purchasing/OrganicPurchaseManager';
import { Observable2 } from 'Core/Utilities/Observable';
import { StorageApi } from 'Core/Native/Storage';

describe('OrganicPurchaseManager', () => {

    let organicPurchase: OrganicPurchase | undefined;

    let nativeBridge: NativeBridge;
    let promoEvents: PromoEvents;
    let request: Request;
    let organicPurchaseManager: OrganicPurchaseManager;
    let onSetObservable: Observable2<string, object>;
    let getStub: sinon.SinonStub;
    let setStub: sinon.SinonStub;
    let writeStub: sinon.SinonStub;
    let postStub: sinon.SinonStub;

    beforeEach(() => {

        nativeBridge = sinon.createStubInstance(NativeBridge);
        nativeBridge.Storage = sinon.createStubInstance(StorageApi);
        request = sinon.createStubInstance(Request);
        promoEvents = sinon.createStubInstance(PromoEvents);
        organicPurchaseManager = new OrganicPurchaseManager(nativeBridge, promoEvents, request);

        onSetObservable = new Observable2();
        nativeBridge.Storage.onSet = onSetObservable;
        getStub = <sinon.SinonStub>nativeBridge.Storage.get;
        setStub = (<sinon.SinonStub>nativeBridge.Storage.set);
        writeStub = (<sinon.SinonStub>nativeBridge.Storage.write);
        postStub = (<sinon.SinonStub>request.post);

        getStub.resolves({});
        setStub.resolves({});
        writeStub.resolves({});
        postStub.resolves({});
        (<sinon.SinonStub>promoEvents.onOrganicPurchaseSuccess).resolves({});
    });

    it('should subscribe to Storage.onSet in initialize', () => {
        const subscribeStub = sinon.stub(onSetObservable, 'subscribe');
        return organicPurchaseManager.initialize().then(() => {
            sinon.assert.calledOnce(subscribeStub);
        });
    });

    it('should not do anything if iap.purchases is undefined', () => {
        return organicPurchaseManager.initialize().then(() => {
            sinon.assert.calledOnce(getStub);
            sinon.assert.notCalled(setStub);
            sinon.assert.notCalled(writeStub);
            sinon.assert.notCalled(postStub);
            sinon.assert.notCalled(<sinon.SinonStub>promoEvents.onOrganicPurchaseSuccess);
        });
    });

    it('happy path with one purchase',() => {
        getStub.resolves([{'productId': 'testId', 'price': 1234, 'currency': 'USD', 'receiptPurchaseData': 'test receipt data', 'signature': 'testSignature'}]);
        return organicPurchaseManager.initialize().then(() => {
            sinon.assert.calledOnce(getStub);
            sinon.assert.calledOnce(setStub);
            sinon.assert.calledOnce(writeStub);
            sinon.assert.calledOnce(postStub);
            sinon.assert.calledOnce(<sinon.SinonStub>promoEvents.onOrganicPurchaseSuccess);
            assert.equal(postStub.firstCall.args[0], 'https://events.iap.unity3d.com/events/v1/organic_purchase?native=false&iap_service=false');
        });
    });

    it('happy path with two purchases',() => {
        getStub.resolves([{'productId': 'testId', 'price': 1234, 'currency': 'USD', 'receiptPurchaseData': 'test receipt data', 'signature': 'testSignature'}, {'productId': 'testId', 'price': 1234, 'currency': 'USD', 'receiptPurchaseData': 'test receipt data', 'signature': 'testSignature'}]);
        return organicPurchaseManager.initialize().then(() => {
            sinon.assert.calledOnce(getStub);
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
                signature: 'testSignaure'
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
