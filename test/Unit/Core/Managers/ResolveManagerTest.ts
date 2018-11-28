import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';

import { ResolveManager } from 'Core/Managers/ResolveManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import { TestFixtures } from 'TestHelpers/TestFixtures';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ResolveTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let resolve: ResolveManager;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            resolve = new ResolveManager(core);
        });

        it('Resolve host with success', () => {
            const testHost: string = 'www.example.net';
            const testIp: string = '1.2.3.4';

            return resolve.resolve(testHost).then(([id, host, ip]) => {
                assert.equal(testHost, host, 'Hostname does not match the request');
                assert.equal(testIp, ip, 'IP address was not successfully resolved');
            });
        });

        it('Resolve host with failure', () => {
            const failHost: string = 'www.fail.com';
            const expectedError: string = 'Error';
            const expectedErrorMsg: string = 'Error message';

            return resolve.resolve(failHost).then(() => {
                assert.fail('Failed resolve must not be successful');
            }, ([error, errorMsg]) => {
                assert.equal(expectedError, error, 'Failed resolve error does not match');
                assert.equal(expectedErrorMsg, errorMsg, 'Failed resolve error message does not match');
            });
        });
    });
});
