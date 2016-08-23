import 'mocha';
import * as Sinon from 'sinon';

import { Request } from 'Utilities/Request';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { EventManager } from 'Managers/EventManager';
import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Platform } from 'Constants/Platform';

describe('DiagnosticsTest', () => {
    let handleInvocation = Sinon.spy();
    let handleCallback = Sinon.spy();
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.TEST, false);
    });

    it('should generate proper request', () => {
        let request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = Sinon.mock(eventManager);
        mockEventManager.expects('diagnosticEvent').withArgs('https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"test":true}}');
        Diagnostics.trigger(eventManager, {'test': true}).then(value => {
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

        let mockEventManager = Sinon.mock(eventManager);
        mockEventManager.expects('diagnosticEvent').withArgs('https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":{"gameId":"12345","testMode":false,"bundleId":"com.unity3d.ads.example","bundleVersion":"2.0.0-test2","sdkVersion":"2000","sdkVersionName":"2.0.0-alpha2","platform":"android","encrypted":false,"configUrl":"http://example.com/config.json","webviewUrl":"http://example.com/index.html","webviewHash":null},"device":{}}}\n{"type":"ads.sdk2.diagnostics","msg":{"test":true}}');
        Diagnostics.trigger(eventManager, {'test': true}, clientInfo, deviceInfo).then(value => {
            mockEventManager.verify();
        });
    });
});
