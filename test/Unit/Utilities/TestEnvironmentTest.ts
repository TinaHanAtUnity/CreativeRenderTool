import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { MetaData } from 'Utilities/MetaData';
import { TestFixtures } from 'Helpers/TestFixtures';
import { TestEnvironment } from 'Utilities/TestEnvironment';

describe('MetaDataTest', () => {
    let metaData: MetaData;

    beforeEach(() => {
        metaData = new MetaData(TestFixtures.getNativeBridge());

        sinon.stub(metaData, 'getKeys').returns(Promise.resolve(['testNumber']));
        sinon.stub(metaData, 'get')
            .withArgs('test.clearTestMetaData').returns(Promise.resolve([false, undefined]))
            .withArgs('test.testNumber').returns(Promise.resolve([true, 1234]));
    });

    it('should get defined number', () => {
        return TestEnvironment.setup(metaData).then(() => {
            assert.equal(1234, TestEnvironment.get('testNumber'), 'test metadata number does not match');
        });
    });

    it('should not get undefined number', () => {
        return TestEnvironment.setup(metaData).then(() => {
            assert.isUndefined(TestEnvironment.get('undefinedNumber'), 'undefined test metadata found');
        });
    });
});
