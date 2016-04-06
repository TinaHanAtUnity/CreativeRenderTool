import 'mocha';
import * as sinon from 'sinon';

import { ConnectivityManager } from '../../src/ts/Managers/ConnectivityManager';
import { Observable } from '../../src/ts/Utilities/Observable';

describe('ConnectivityManager', () => {
    let connectivityManager: ConnectivityManager;
    let nativeBridgeMock;

    before(() => {
        nativeBridgeMock = new Observable();

        sinon.spy(nativeBridgeMock, 'subscribe');
        nativeBridgeMock.invoke = sinon.spy();

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

    describe('when nativeBridge receives CONNECTIVITY_CONNECTED', () => {

        let connectionListenerMock;

        before(() => {
            connectionListenerMock = sinon.spy();
            connectivityManager.subscribe('connected', connectionListenerMock);

            nativeBridgeMock.trigger('CONNECTIVITY_CONNECTED', 'wififoo', 'networkfoo');
        });

        it('should invoke connected method on subscriber', () => {
            sinon.assert.calledWith(connectionListenerMock, 'wififoo', 'networkfoo');
        });
    });
});