import { assert } from 'chai';

import { MetaData } from 'Core/Utilities/MetaData';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Platform } from 'Core/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('MetaDataTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let metaData: MetaData;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            metaData = new MetaData(core);

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
});
