import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { MetaData } from 'Core/Utilities/MetaData';
import { Backend } from 'Backend/Backend';
import { PrivacyEnvironment } from 'Privacy/PrivacyEnvironment';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('PrivacyEnvironmentTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let metaData: MetaData;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            metaData = new MetaData(core);

            sinon.stub(metaData, 'getKeys').returns(Promise.resolve(['testValue']));
            sinon.stub(metaData, 'get')
                .withArgs('privacyenv.testValue').returns(Promise.resolve([true, 1234]));
        });

        it('should get defined value', () => {
            return PrivacyEnvironment.setup(metaData).then(() => {
                assert.equal(1234, PrivacyEnvironment.get('testValue'), 'privacy environment metadata number does not match');
            });
        });

        it('should not get undefined vaue', () => {
            return PrivacyEnvironment.setup(metaData).then(() => {
                assert.isUndefined(PrivacyEnvironment.get('undefinedTestValue'), 'undefined privacy environment metadata found');
            });
        });

        it ('defined value should be set', () => {
            return PrivacyEnvironment.setup(metaData).then(() => {
                assert.isTrue(PrivacyEnvironment.isSet('testValue'), 'isSet should return true for defined value');
            });
        });

        it ('undefined value should be set', () => {
            return PrivacyEnvironment.setup(metaData).then(() => {
                assert.isFalse(PrivacyEnvironment.isSet('undefinedTestValue'), 'isSet should return false for undefined value');
            });
        });
    });
});