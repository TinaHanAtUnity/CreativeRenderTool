import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { MetaData } from 'Utilities/MetaData';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import {PurchasingUtilities} from "../../../Utilities/PurchasingUtilities";

describe('PurchasingUtilitiesTest', () => {
    let metaData: MetaData;

    beforeEach(() => {
        metaData = new MetaData(TestFixtures.getNativeBridge());

        sinon.stub(metaData, 'getKeys').returns(Promise.resolve(['catalog']));
        sinon.stub(metaData, 'get')
            .withArgs('iap.catalog').returns(Promise.resolve([true, [
                { "productId" : "free.sword", "localizedPriceString" : "$0.00", "localizedTitle" : "Sword of Minimal Value" },
            { "productId" : "100.gold.coins", "localizedPriceString" : "$0.99", "localizedTitle" : "100 in-game Gold Coins" }]]))
            .withArgs('test.testNumber').returns(Promise.resolve([true, 1234]));
    });

    it('should get available products', () => {
        return PurchasingUtilities.refresh(metaData).then(() => {
            assert.equal(true, PurchasingUtilities.purchasesAvailable, 'purchases are not available');
        });
    });

    it('should not get undefined number', () => {
        return TestEnvironment.setup(metaData).then(() => {
            assert.isUndefined(TestEnvironment.get('undefinedNumber'), 'undefined test metadata found');
        });
    });
});
