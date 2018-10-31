import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { OrganicPurchase, IOrganicPurchase } from 'Purchasing/OrganicPurchaseManager';

describe('CustomPurchasingAdapter', () => {
    let sandbox: sinon.SinonSandbox;
    let organicPurchase: OrganicPurchase;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Create OrganicPurchase', () => {
        it('create OrganicPurchase with all fields', () => {
            const event = {productId: 'productIDID', price: 1.25, currency: 'EUR', receiptPurchaseData: 'testReceiptPurchaseData', signature: 'testSignaure'};
            organicPurchase = new OrganicPurchase(event);

            assert.deepEqual('productIDID', organicPurchase.getId());
            assert.deepEqual(1.25, organicPurchase.getPrice());
            assert.deepEqual('EUR', organicPurchase.getCurrency());
            assert.deepEqual('testReceiptPurchaseData', organicPurchase.getReceipt());
            assert.deepEqual('testSignaure', organicPurchase.getSignature());
        });

        it('create OrganicPurchase with missing fields', () => {
            const event = <IOrganicPurchase>{productId: 'productIDID', price: 1.25};
            organicPurchase = new OrganicPurchase(event);

            assert.deepEqual('productIDID', organicPurchase.getId());
            assert.deepEqual(1.25, organicPurchase.getPrice());
            assert.isUndefined(organicPurchase.getCurrency());
            assert.isUndefined(organicPurchase.getReceipt());
            assert.isUndefined(organicPurchase.getSignature());
        });

        it('create OrganicPurchase with no value', () => {
            organicPurchase = new OrganicPurchase(<IOrganicPurchase>{});

            assert.exists(organicPurchase);
            assert.isUndefined(organicPurchase.getId());
        });

        it('create OrganicPurchase with unexpected key', () => {
            const event = {productId: 'productIDID', price: 1.25, randomKey: 'random value'};
            organicPurchase = new OrganicPurchase(event);

            assert.deepEqual('productIDID', organicPurchase.getId());
            assert.deepEqual(1.25, organicPurchase.getPrice());
            assert.isUndefined(organicPurchase.getCurrency());
            assert.isUndefined(organicPurchase.getReceipt());
            assert.isUndefined(organicPurchase.getSignature());
        });
    });

});
