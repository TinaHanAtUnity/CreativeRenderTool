import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { FocusManager } from 'Managers/FocusManager';
import { FailedOperativeEventManager } from 'Managers/FailedOperativeEventManager';
import { StorageType } from 'Native/Api/Storage';

describe('FailedOperativeEventManagerTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let request: Request;
    let focusManager: FocusManager;
    let wakeUpManager: WakeUpManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
    });

    it('Sending failed event', () => {
        sinon.stub(request, 'post').callsFake(() => {
            return Promise.resolve();
        });
        sinon.stub(nativeBridge.Storage, 'get').callsFake(() => {
            return Promise.resolve({url: 'http://test.url', data: '{testdata: \'test\'}'});
        });
        sinon.stub(nativeBridge.Storage, 'delete').callsFake(() => {
            return Promise.resolve();
        });
        sinon.stub(nativeBridge.Storage, 'write').callsFake(() => {
            return Promise.resolve();
        });

        const manager = new FailedOperativeEventManager('12345', '12345');
        return manager.sendFailedEvent(nativeBridge, request).then(() => {
            sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.get);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Storage.get, StorageType.PRIVATE, 'session.12345.operative.12345');
            sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.delete);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Storage.delete, StorageType.PRIVATE, 'session.12345.operative.12345');
            sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.write);
        });
    });

    it('Storing failed event', () => {
        sinon.stub(nativeBridge.Storage, 'set').callsFake(() => {
            return Promise.resolve();
        });
        sinon.stub(nativeBridge.Storage, 'write').callsFake(() => {
            return Promise.resolve();
        });

        const manager = new FailedOperativeEventManager('12345', '12345');
        return manager.storeFailedEvent(nativeBridge, {test1: 'test1', test2: 'test2'}).then(() => {
            sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.set);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Storage.set, StorageType.PRIVATE, 'session.12345.operative.12345', {test1: 'test1', test2: 'test2'});
            sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.write);
        });
    });

    it('Sending failed events', () => {
        sinon.stub(request, 'post').callsFake(() => {
            return Promise.resolve();
        });
        sinon.stub(nativeBridge.Storage, 'get').callsFake(() => {
            return Promise.resolve({
                session1: {url: 'http://test.url1', data: '{testdata1: \'test1\'}'},
                session2: {url: 'http://test.url2', data: '{testdata2: \'test2\'}'}
            });
        });
        sinon.stub(nativeBridge.Storage, 'delete').callsFake(() => {
            return Promise.resolve();
        });
        sinon.stub(nativeBridge.Storage, 'write').callsFake(() => {
            return Promise.resolve();
        });
    });
});
