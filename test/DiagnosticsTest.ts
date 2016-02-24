/// <reference path="../typings/tsd.d.ts" />

import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { Request } from '../src/ts/Utilities/Request';
import { Diagnostics } from '../src/ts/Utilities/Diagnostics';
import { NativeBridge } from '../src/ts/NativeBridge';

describe('DiagnosticsTest', () => {
    it('should generate proper request', () => {
        let nativeBridge = new NativeBridge(null);
        let request = new Request(nativeBridge);
        let mockRequest = sinon.mock(request);
        mockRequest.expects('post').withArgs('https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"device":null,"client":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"test":true}}');
        Diagnostics.trigger(request, {'test': true});
        mockRequest.verify();
    });
});
