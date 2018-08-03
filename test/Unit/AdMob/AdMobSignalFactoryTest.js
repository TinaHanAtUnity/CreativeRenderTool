System.register(["mocha", "chai", "AdMob/AdMobSignalFactory", "../TestHelpers/TestFixtures", "Managers/FocusManager", "../../../../proto/unity_proto.js", "protobufjs/minimal", "Managers/MetaDataManager"], function (exports_1, context_1) {
    "use strict";
    var chai_1, AdMobSignalFactory_1, TestFixtures_1, FocusManager_1, unity_proto_js_1, protobuf, MetaDataManager_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (AdMobSignalFactory_1_1) {
                AdMobSignalFactory_1 = AdMobSignalFactory_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (unity_proto_js_1_1) {
                unity_proto_js_1 = unity_proto_js_1_1;
            },
            function (protobuf_1) {
                protobuf = protobuf_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            }
        ],
        execute: function () {
            describe('AdMobSignalFactoryTest', function () {
                xit('basic test', function () {
                    var nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                    var clientInfo = TestFixtures_1.TestFixtures.getClientInfo();
                    var deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return new AdMobSignalFactory_1.AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager).getAdRequestSignal().then(function (signal) {
                        var encodedMsg = signal.getBase64ProtoBuf();
                        var buffer = new Uint8Array(protobuf.util.base64.length(encodedMsg));
                        protobuf.util.base64.decode(encodedMsg, buffer, 0);
                        var decodedProtoBuf = unity_proto_js_1.unity_proto.UnityProto.decode(buffer);
                        chai_1.assert.equal(decodedProtoBuf.protoName, unity_proto_js_1.unity_proto.UnityProto.ProtoName.UNITY_INFO);
                        chai_1.assert.equal(decodedProtoBuf.encryptionMethod, unity_proto_js_1.unity_proto.UnityProto.EncryptionMethod.UNENCRYPTED);
                        var decodedSignal = unity_proto_js_1.unity_proto.UnityInfo.decode(decodedProtoBuf.encryptedBlobs[0]);
                        chai_1.assert.equal(decodedSignal.field_41, clientInfo.getApplicationName());
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRNb2JTaWduYWxGYWN0b3J5VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkFkTW9iU2lnbmFsRmFjdG9yeVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWFBLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRTtnQkFDL0IsR0FBRyxDQUFDLFlBQVksRUFBRTtvQkFDZCxJQUFNLFlBQVksR0FBaUIsMkJBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDbEUsSUFBTSxVQUFVLEdBQWUsMkJBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDNUQsSUFBTSxVQUFVLEdBQXNCLDJCQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztvQkFDMUUsSUFBTSxZQUFZLEdBQWlCLElBQUksMkJBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDbEUsSUFBTSxlQUFlLEdBQW9CLElBQUksaUNBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFFM0UsT0FBTyxJQUFJLHVDQUFrQixDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTTt3QkFDOUcsSUFBTSxVQUFVLEdBQVcsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7d0JBRXRELElBQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUN2RSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDbkQsSUFBTSxlQUFlLEdBQUcsNEJBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUU5RCxhQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsNEJBQVcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUNyRixhQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSw0QkFBVyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFFcEcsSUFBTSxhQUFhLEdBQUcsNEJBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDdEYsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7b0JBQzFFLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMifQ==