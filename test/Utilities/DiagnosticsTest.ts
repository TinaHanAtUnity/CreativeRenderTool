/// <reference path="../../typings/index.d.ts" />

import 'mocha';
import * as sinon from 'sinon';

import { Request } from '../../src/ts/Utilities/Request';
import { Diagnostics } from '../../src/ts/Utilities/Diagnostics';
import { DeviceInfo } from '../../src/ts/Models/DeviceInfo';
import { ClientInfo } from '../../src/ts/Models/ClientInfo';
import { EventManager } from '../../src/ts/Managers/EventManager';
import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import { WakeUpManager } from '../../src/ts/Managers/WakeUpManager';
import { Platform } from '../../src/ts/Constants/Platform';

describe('DiagnosticsTest', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.TEST, false);
    });

    it('should generate proper request', () => {
        let request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('diagnosticEvent').withArgs('https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"test":true}}');
        Diagnostics.setEventManager(eventManager);
        Diagnostics.trigger({'test': true}).then(value => {
            mockEventManager.verify();
        });
    });

    it('should generate proper request with info', () => {
        let request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
        let eventManager = new EventManager(nativeBridge, request);

        let deviceInfo = new DeviceInfo(nativeBridge);
        let clientInfo = new ClientInfo(Platform.ANDROID, [
            '12345',
            false,
            'com.unity3d.ads.example',
            '2.0.0-test2',
            '2000',
            '2.0.0-alpha2',
            true,
            'http://example.com/config.json',
            'http://example.com/index.html',
            null
        ]);

        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('diagnosticEvent').withArgs('https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":{"gameId":"12345","testMode":false,"bundleId":"com.unity3d.ads.example","bundleVersion":"2.0.0-test2","sdkVersion":"2000","sdkVersionName":"2.0.0-alpha2","platform":"android","encrypted":false,"configUrl":"http://example.com/config.json","webviewUrl":"http://example.com/index.html","webviewHash":null},"device":{}}}\n{"type":"ads.sdk2.diagnostics","msg":{"test":true}}');
        Diagnostics.setEventManager(eventManager);
        Diagnostics.setDeviceInfo(deviceInfo);
        Diagnostics.setClientInfo(clientInfo);
        Diagnostics.trigger({'test': true}).then(value => {
            mockEventManager.verify();
        });
    });
});
