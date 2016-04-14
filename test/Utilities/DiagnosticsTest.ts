/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import * as sinon from 'sinon';

import { Request } from '../../src/ts/Utilities/Request';
import { Diagnostics } from '../../src/ts/Utilities/Diagnostics';
import { DeviceInfo } from '../../src/ts/Models/DeviceInfo';
import { ClientInfo } from '../../src/ts/Models/ClientInfo';
import { EventManager } from '../../src/ts/Managers/EventManager';
import {NativeBridge} from "../../src/ts/Native/NativeBridge";

describe('DiagnosticsTest', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, false);
    });    
    
    it('should generate proper request', () => {
        let request = new Request(nativeBridge);
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('diagnosticEvent').withArgs('https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"test":true}}');
        Diagnostics.trigger(eventManager, {'test': true});
        mockEventManager.verify();
    });

    it('should generate proper request with info', () => {
        let request = new Request(nativeBridge);
        let eventManager = new EventManager(nativeBridge, request);

        let deviceInfo = new DeviceInfo();
        let clientInfo = new ClientInfo([
            '12345',
            false,
            'com.unity3d.ads.example',
            '2.0.0-test2',
            '2.0.0-alpha2',
            'android',
            true,
            'http://example.com/config.json',
            'http://example.com/index.html',
            null
        ]);

        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('diagnosticEvent').withArgs('https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":{"game_id":"12345","test_mode":false,"application_name":"com.unity3d.ads.example","application_version":"2.0.0-test2","sdk_version":"2.0.0-alpha2","platform":"android","encrypted":false,"config_url":"http://example.com/config.json","webview_url":"http://example.com/index.html","webview_hash":null},"device":{}}}\n{"type":"ads.sdk2.diagnostics","msg":{"test":true}}');
        Diagnostics.trigger(eventManager, {'test': true}, clientInfo, deviceInfo);
        mockEventManager.verify();
    });
});
