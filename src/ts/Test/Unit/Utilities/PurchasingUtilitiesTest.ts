import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { MetaData } from 'Utilities/MetaData';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { PurchasingUtilities} from 'Utilities/PurchasingUtilities';

describe('PurchasingUtilitiesTest', () => {
    let metaData: MetaData;

    beforeEach(() => {
        metaData = new MetaData(TestFixtures.getNativeBridge());

        sinon.stub(metaData, 'getKeys').returns(Promise.resolve(['catalog']));
        sinon.stub(metaData, 'get')
            .withArgs('iap.catalog').returns(Promise.resolve([true, [
                { "productId" : "free.sword", "localizedPriceString" : "$0.00", "localizedTitle" : "Sword of Minimal Value" },
            { "productId" : "100.gold.coins", "localizedPriceString" : "$0.99", "localizedTitle" : "100 in-game Gold Coins" }]]));
    });

    it('should indicate that products are available', () => {
        return PurchasingUtilities.refresh(metaData).then(() => {
            assert.equal(true, PurchasingUtilities.purchasesAvailable(), 'purchases are not available');
        });
    });

    it('should indicate that a particular product is available', () => {
        return PurchasingUtilities.refresh(metaData).then(() => {
            assert.equal(true, PurchasingUtilities.productAvailable('100.gold.coins'), 'product is unavailable');
        });
    });

    it('should indicate that an unknown product is not available', () => {
        return PurchasingUtilities.refresh(metaData).then(() => {
            assert.equal(false, PurchasingUtilities.productAvailable('100.gold.noncoins'), 'unknown product is available');
        });
    });

    it('should indicate the correct price for an available product', () => {
        return PurchasingUtilities.refresh(metaData).then(() => {
            assert.equal("$0.99", PurchasingUtilities.productPrice('100.gold.coins'), 'unexpected product price');
        });
    });

    it('should indicate the correct description for an available product', () => {
        return PurchasingUtilities.refresh(metaData).then(() => {
            assert.equal("100 in-game Gold Coins", PurchasingUtilities.productDescription('100.gold.coins'), 'unexpected product description');
        });
    });

});
