import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { FocusManager } from 'Managers/FocusManager';
import { FailedOperativeEventManager } from 'Managers/FailedOperativeEventManager';
import { StorageType } from 'Native/Api/Storage';
import { HttpKafka } from 'Utilities/HttpKafka';
import { FailedXpromoOperativeEventManager } from 'Managers/FailedXpromoOperativeEventManager';

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
            return Promise.resolve({url: 'http://test.url', data: '{\"testdata\": \"test\"}'});
        });
        sinon.stub(nativeBridge.Storage, 'delete').callsFake(() => {
            return Promise.resolve();
        });
        sinon.stub(nativeBridge.Storage, 'write').callsFake(() => {
            return Promise.resolve();
        });

        const manager = new FailedOperativeEventManager('12345', '12345');
        return manager.sendFailedEvent(nativeBridge, request, true).then(() => {
            sinon.assert.calledOnce(<sinon.SinonSpy>request.post);
            sinon.assert.calledWith(<sinon.SinonSpy>request.post, 'http://test.url', '{\"testdata\": \"test\"}');
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
        sinon.stub(nativeBridge.Storage, 'getKeys').callsFake(() => {
            return Promise.resolve(['event1', 'event2']);
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

        const manager = new FailedOperativeEventManager('12345', 'none');
        return manager.sendFailedEvents(nativeBridge, request).then(() => {
            sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.getKeys);
            sinon.assert.calledTwice(<sinon.SinonSpy>nativeBridge.Storage.get);
            sinon.assert.calledTwice(<sinon.SinonSpy>nativeBridge.Storage.delete);
            assert.equal((<sinon.SinonSpy>nativeBridge.Storage.delete).getCall(0).args[1], 'session.12345.operative.event1');
            assert.equal((<sinon.SinonSpy>nativeBridge.Storage.delete).getCall(1).args[1], 'session.12345.operative.event2');
            sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.write);
        });
    });

    it('Sending failed Xpromo events', () => {
        sinon.stub(request, 'post').callsFake(() => {
            return Promise.resolve();
        });
        sinon.stub(nativeBridge.Storage, 'get').callsFake(() => {
            return Promise.resolve({kafkaType: 'test.kafka.type', data: '{\"testdata\": \"test\"}'});
        });
        sinon.stub(nativeBridge.Storage, 'delete').callsFake(() => {
            return Promise.resolve();
        });
        sinon.stub(nativeBridge.Storage, 'write').callsFake(() => {
            return Promise.resolve();
        });

        HttpKafka.setRequest(request);

        const manager = new FailedXpromoOperativeEventManager('12345', '12345');
        return manager.sendFailedEvent(nativeBridge, request, true).then(() => {
            sinon.assert.calledOnce(<sinon.SinonSpy>request.post);
            sinon.assert.calledWith(<sinon.SinonSpy>request.post, 'https://httpkafka.unityads.unity3d.com/v1/events');
            sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.get);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Storage.get, StorageType.PRIVATE, 'session.12345.xpromooperative.12345');
            sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.delete);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Storage.delete, StorageType.PRIVATE, 'session.12345.xpromooperative.12345');
            sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.write);
        });
    });
});
