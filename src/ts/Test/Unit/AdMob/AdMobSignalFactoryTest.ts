import 'mocha';
import { assert } from 'chai';

import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { NativeBridge } from 'Native/NativeBridge';
import { unity_proto } from '../../../../proto/unity_proto.js';
import * as protobuf from 'protobufjs/minimal';

describe('AdMobSignalFactoryTest', () => {
    it('should work', () => {
        let nativeBridge: NativeBridge = TestFixtures.getNativeBridge();
        let clientInfo: ClientInfo = TestFixtures.getClientInfo();
        let deviceInfo: DeviceInfo = TestFixtures.getDeviceInfo();

        return AdMobSignalFactory.getAdRequestSignal(nativeBridge, clientInfo, deviceInfo).then(signal => {
            const encodedMsg: string = signal.getBase64ProtoBuf();

            const buffer = new Uint8Array(protobuf.util.base64.length(encodedMsg));
            protobuf.util.base64.decode(encodedMsg, buffer, 0);
            const decodedInfo = unity_proto.UnityInfo.decode(buffer);
            assert.equal(decodedInfo.field_41, clientInfo.getApplicationName());
        });
    });
});
