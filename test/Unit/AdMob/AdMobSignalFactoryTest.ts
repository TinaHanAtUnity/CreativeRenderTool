import 'mocha';
import { assert } from 'chai';

import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ClientInfo } from 'Models/ClientInfo';
import { FocusManager } from 'Managers/FocusManager';
import { NativeBridge } from 'Native/NativeBridge';
import { unity_proto } from '../../../src/proto/unity_proto.js';
import * as protobuf from 'protobufjs/minimal';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { MetaDataManager } from 'Managers/MetaDataManager';

describe('AdMobSignalFactoryTest', () => {
    xit('basic test', () => {
        const nativeBridge: NativeBridge = TestFixtures.getNativeBridge();
        const clientInfo: ClientInfo = TestFixtures.getClientInfo();
        const deviceInfo: AndroidDeviceInfo = TestFixtures.getAndroidDeviceInfo();
        const focusManager: FocusManager = new FocusManager(nativeBridge);
        const metaDataManager: MetaDataManager = new MetaDataManager(nativeBridge);

        return new AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager).getAdRequestSignal().then(signal => {
            const encodedMsg: string = signal.getBase64ProtoBuf();

            const buffer = new Uint8Array(protobuf.util.base64.length(encodedMsg));
            protobuf.util.base64.decode(encodedMsg, buffer, 0);
            const decodedProtoBuf = unity_proto.UnityProto.decode(buffer);

            assert.equal(decodedProtoBuf.protoName, unity_proto.UnityProto.ProtoName.UNITY_INFO);
            assert.equal(decodedProtoBuf.encryptionMethod, unity_proto.UnityProto.EncryptionMethod.UNENCRYPTED);

            const decodedSignal = unity_proto.UnityInfo.decode(decodedProtoBuf.encryptedBlobs[0]);
            assert.equal(decodedSignal.field_41, clientInfo.getApplicationName());
        });
    });
});
