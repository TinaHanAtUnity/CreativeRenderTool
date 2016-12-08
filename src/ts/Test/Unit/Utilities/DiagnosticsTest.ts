import 'mocha';
import * as sinon from 'sinon';

import { Request, INativeResponse } from 'Utilities/Request';
import { Diagnostics } from 'Utilities/Diagnostics';
import { ClientInfo } from 'Models/ClientInfo';
import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Platform } from 'Constants/Platform';
import { HttpKafka } from 'Utilities/HttpKafka';
import { Configuration } from 'Models/Configuration';
import { TestFixtures } from '../TestHelpers/TestFixtures';

import ConfigurationJson from 'json/Configuration.json';

describe('DiagnosticsTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let resolvedPromise: Promise<INativeResponse>;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.TEST, false);
    });

    it('should generate proper request', () => {
        const request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
        resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());
        sinon.stub(request, 'post').returns(resolvedPromise);
        HttpKafka.setRequest(request);

        Diagnostics.trigger({'test': true});
        return resolvedPromise.then(() => {
            sinon.assert.calledWith(<sinon.SinonStub>request.post,
                'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"test":true}}');

        });
    });

    it('should generate proper request with info', () => {
        const request = new Request(nativeBridge, new WakeUpManager(nativeBridge));

        resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());
        sinon.stub(request, 'post').returns(resolvedPromise);

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

        const configuration = new Configuration(JSON.parse(ConfigurationJson));

        HttpKafka.setRequest(request);
        HttpKafka.setClientInfo(clientInfo);
        HttpKafka.setConfiguration(configuration);
        Diagnostics.trigger({'test': true});

        return resolvedPromise.then(() => {
            sinon.assert.calledWith(<sinon.SinonStub>request.post,
                'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":{"gameId":"12345","testMode":false,"bundleId":"com.unity3d.ads.example","bundleVersion":"2.0.0-test2","sdkVersion":"2000","sdkVersionName":"2.0.0-alpha2","platform":"android","encrypted":false,"configUrl":"http://example.com/config.json","webviewUrl":"http://example.com/index.html","webviewHash":null},"device":null,"country":"fi"}}\n{"type":"ads.sdk2.diagnostics","msg":{"test":true}}');
        });
    });
});
