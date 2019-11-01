import { assert } from 'chai';
import 'mocha';
import { CatalogRequest } from 'Promo/Models/CatalogRequest';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { IProduct } from 'Purchasing/PurchasingAdapter';
import { RequestManager } from 'Core/Managers/RequestManager';
import * as sinon from 'sinon';

describe('sendCatalogPayload', () => {
    let coreConfig: CoreConfiguration;
    let clientInfo: ClientInfo;
    let requestManager: RequestManager;

    beforeEach(() => {
        coreConfig = TestFixtures.getCoreConfiguration();
        clientInfo = TestFixtures.getClientInfo(Platform.TEST, '123456');
        requestManager = sinon.createStubInstance(RequestManager);
        (<sinon.SinonStub>requestManager.post).returns(Promise.resolve({}));
    });

    const oneProduct = [{
        productId: 'myPromo',
        localizedPriceString: '$2.00',
        localizedTitle: 'test',
        localizedPrice: 2,
        productType: 'consumable',
        isoCurrencyCode: 'USA'
    }];

    const expectedOneProductPayload = {
        country: 'FI',
        gameId: '123456',
        version: '2.0.0-test2',
        products: [{
            productId: 'myPromo',
            productType: 'consumable',
            isoCurrencyCode: 'USA',
            localizedPrice: 2
        }],
        ts: 1000
    };

    const tests: {
        name: string;
        products: IProduct[];
        expectedURL: string;
        expectedPayload: string;
        expectedPostCalled: boolean;
    }[] = [{
        name: 'should send post request with one product',
        products: oneProduct,
        expectedURL: 'https://events-iap.staging.unityads.unity3d.com/v1/catalog',
        expectedPayload: JSON.stringify(expectedOneProductPayload),
        expectedPostCalled: true
    },
    {
        name: 'should not send post request when no products exist',
        products: [],
        expectedPostCalled: false,
        expectedURL: '',
        expectedPayload: ''
    }];

    tests.forEach(t => {
        it(t.name, () => {
            const requestSpy = <sinon.SinonSpy>requestManager.post;
            sinon.stub(Date, 'now').returns(1000);
            const request = new CatalogRequest(clientInfo, coreConfig, requestManager, t.products);
            request.sendCatalogPayload();
            assert.strictEqual(requestSpy.called, t.expectedPostCalled);
            if (t.expectedPostCalled) {
                assert.strictEqual(requestSpy.args[0][0], t.expectedURL);
                assert.equal(requestSpy.args[0][1], t.expectedPayload);
            }
        });
    });
});
