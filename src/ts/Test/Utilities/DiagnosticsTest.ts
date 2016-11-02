import 'mocha';
import * as sinon from 'sinon';

import { Request } from 'Utilities/Request';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Platform } from 'Constants/Platform';
import { HttpKafka } from 'Utilities/HttpKafka';

describe('DiagnosticsTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.TEST, false);
    });

    it('should generate proper request', () => {
        const request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
        const mockRequest = sinon.mock(request);
        mockRequest.expects('post').withArgs('https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"test":true}}');
        HttpKafka.setRequest(request);
        Diagnostics.trigger({'test': true}).then(value => {
            mockRequest.verify();
        });
    });

    it('should generate proper request with info', () => {
        const request = new Request(nativeBridge, new WakeUpManager(nativeBridge));

        const deviceInfo = new DeviceInfo(nativeBridge);
        const clientInfo = new ClientInfo(Platform.ANDROID, [
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

        const mockRequest = sinon.mock(request);
        mockRequest.expects('post').withArgs('https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":{"gameId":"12345","testMode":false,"bundleId":"com.unity3d.ads.example","bundleVersion":"2.0.0-test2","sdkVersion":"2000","sdkVersionName":"2.0.0-alpha2","platform":"android","encrypted":false,"configUrl":"http://example.com/config.json","webviewUrl":"http://example.com/index.html","webviewHash":null},"device":{}}}\n{"type":"ads.sdk2.diagnostics","msg":{"test":true}}');
        HttpKafka.setRequest(request);
        HttpKafka.setDeviceInfo(deviceInfo);
        HttpKafka.setClientInfo(clientInfo);
        Diagnostics.trigger({'test': true}).then(value => {
            mockRequest.verify();
        });
    });
});
