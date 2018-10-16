import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { Backend } from '../../../src/ts/Backend/Backend';
import { ICoreApi } from '../../../src/ts/Core/Core';
import { TestFixtures } from '../../TestHelpers/TestFixtures';

describe('ConnectivityApi', () => {
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;

    beforeEach(() => {
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
    });

    it('should call Connectivity.setConnectionMonitoring on native bridge', () => {
        core.Connectivity.setListeningStatus(true);
        const spy = sinon.spy(backend, 'handleInvocation');
        sinon.assert.calledWith(spy, JSON.stringify([['Connectivity', 'setConnectionMonitoring', [true], '1']]));
    });

    it('should trigger onConnected', () => {
        const spy = sinon.spy();
        core.Connectivity.onConnected.subscribe(spy);
        core.Connectivity.handleEvent('CONNECTED', [true, 0]);
        sinon.assert.calledWith(spy, true, 0);
    });

    it('should throw', () => {
        assert.throws(() => {
            core.Connectivity.handleEvent('INVALID', []);
        });
    });

});
