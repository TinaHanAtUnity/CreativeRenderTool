import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { assert } from 'chai';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as protobuf from 'protobufjs/minimal';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { unity_proto } from '../../../src/proto/unity_proto.js';

describe('AdMobSignalFactoryTest', () => {
    xit('basic test', () => {
        const nativeBridge: NativeBridge = TestFixtures.getNativeBridge();
        const core = TestFixtures.getCoreApi(nativeBridge);
        const ads = TestFixtures.getAdsApi(nativeBridge);
        const clientInfo: ClientInfo = TestFixtures.getClientInfo();
        const deviceInfo: AndroidDeviceInfo = TestFixtures.getAndroidDeviceInfo();
        const focusManager: FocusManager = new FocusManager(nativeBridge.getPlatform(), core);
        const metaDataManager: MetaDataManager = new MetaDataManager(core);

        return new AdMobSignalFactory(nativeBridge.getPlatform(), core, ads, clientInfo, deviceInfo, focusManager).getAdRequestSignal().then(signal => {
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
