import 'mocha';
import { assert } from 'chai';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { SdkDetectionInfo } from 'Core/Models/SdkDetectionInfo';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`MediationDetectionInfoTest - ${Platform[platform]}`, () => {

        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let sdkDetectionInfo: SdkDetectionInfo;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            sdkDetectionInfo = new SdkDetectionInfo(platform, core);
            backend.Api.ClassDetection.setPlatform(platform);
        });

        it('should return false when detected class is not present', () => {
            return sdkDetectionInfo.detectSdks().then(() => {
                const result = sdkDetectionInfo.getSdkDetectionJSON();
                assert(result === '{"AdMob":false,"MoPub":false,"IronSource":false,"Fyber":false,"SafeDK":false,"UnityEngine":false}');
            });
        });

        it('should return true when detected class is present', () => {
            backend.Api.ClassDetection.setClassesArePresent(true);
            return sdkDetectionInfo.detectSdks().then(() => {
                const result = sdkDetectionInfo.getSdkDetectionJSON();
                assert(result === '{"AdMob":true,"MoPub":true,"IronSource":true,"Fyber":true,"SafeDK":true,"UnityEngine":true}');
            });
        });
    });
});
