import 'mocha';
import { assert } from 'chai';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { MediationDetectionInfo } from 'Core/Models/MediationDetectionInfo';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('MediationDetectionInfoTest - ' + Platform[platform], () => {

        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let mediationDetectionInfo: MediationDetectionInfo;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            mediationDetectionInfo = new MediationDetectionInfo(platform, core);
        });

        it('should return false when detected class is not present', () => {
            return mediationDetectionInfo.detectMediation().then(() => {
                const result = mediationDetectionInfo.getMediationDetectionJSON();
                assert(result === '{"mediationA":false,"mediationB":false,"mediationC":false,"mediationD":false}');
            });
        });

        it('should return true when detected class is present', () => {
            backend.Api.ClassDetection.setClassIsPresent(true);
            return mediationDetectionInfo.detectMediation().then(() => {
                const result = mediationDetectionInfo.getMediationDetectionJSON();
                assert(result === '{"mediationA":true,"mediationB":true,"mediationC":true,"mediationD":true}');
            });
        });
    });
});
