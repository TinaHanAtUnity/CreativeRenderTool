import 'mocha';
import * as sinon from 'sinon';

import { ConnectivityManager } from '../../src/ts/Managers/ConnectivityManager';

describe('ConnectivityManager', () => {
    let connectivityManager: ConnectivityManager;
    let nativeBridgeMock;

    before(() => {
        nativeBridgeMock = {
            subscribe: sinon.spy(),
            invoke: sinon.spy(),
        };

        connectivityManager = new ConnectivityManager(nativeBridgeMock);
    });

    it('should subscribe to native bridges connectivity events', () => {
        sinon.assert.called(nativeBridgeMock.subscribe);
    });

    describe('when calling setListeningStatus', () => {

        before(() => {
            connectivityManager.setListeningStatus(true);
        });

        it('should call invoke DeviceInfo on native bridge', () => {
            sinon.assert.calledWith(nativeBridgeMock.invoke, 'DeviceInfo', 'setConnectionMonitoring', [true]);
        });

    });
});