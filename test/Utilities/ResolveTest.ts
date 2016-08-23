import 'mocha';
import * as Sinon from 'sinon';
import { assert } from 'chai';

import { Resolve } from 'Utilities/Resolve';
import { NativeBridge } from 'Native/NativeBridge';
import { ResolveApi } from 'Native/Api/Resolve';

class TestResolveApi extends ResolveApi {

    public resolve(id: string, host: string): Promise<string> {
        if(host.indexOf('fail') !== -1) {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['RESOLVE', 'FAILED', id, host, 'Error', 'Error message']);
            }, 0);
        } else {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['RESOLVE', 'COMPLETE', id, host, '1.2.3.4']);
            }, 0);
        }
        return Promise.resolve(id);
    }

}

describe('ResolveTest', () => {
    let handleInvocation = Sinon.spy();
    let handleCallback = Sinon.spy();
    let nativeBridge: NativeBridge, resolveApi: TestResolveApi, resolve: Resolve;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        resolveApi = nativeBridge.Resolve = new TestResolveApi(nativeBridge);
        resolve = new Resolve(nativeBridge);
    });

    it('Resolve host with success', () => {
        let testHost: string = 'www.example.net';
        let testIp: string = '1.2.3.4';

        return resolve.resolve(testHost).then(([host, ip]) => {
            assert.equal(testHost, host, 'Hostname does not match the request');
            assert.equal(testIp, ip, 'IP address was not successfully resolved');
        });
    });

    it('Resolve host with failure', () => {
        let failHost: string = 'www.fail.com';
        let expectedError: string = 'Error';
        let expectedErrorMsg: string = 'Error message';

        return resolve.resolve(failHost).then(() => {
            assert.fail('Failed resolve must not be successful');
        }, ([error, errorMsg]) => {
            assert.equal(expectedError, error, 'Failed resolve error does not match');
            assert.equal(expectedErrorMsg, errorMsg, 'Failed resolve error message does not match');
        });
    });
});
