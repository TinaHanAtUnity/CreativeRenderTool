import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Backend } from 'Backend/Backend';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Platform } from 'Core/Constants/Platform';
import { StorageType } from 'Core/Native/Storage';
import { ICore } from 'Core/ICore';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
import { IsMadeWithUnity } from 'Ads/Utilities/IsMadeWithUnity';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('IsMadeWithUnityTests', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICore;
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreModule(nativeBridge);
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should send the event when Storage API key is not present', () => {
            sinon.stub(HttpKafka, 'sendEvent').returns(TestFixtures.getOkNativeResponse());
            sinon.stub(core.Api.Storage, 'get').withArgs(StorageType.PRIVATE, 'user.hasSentIsMadeWithUnity').returns(Promise.resolve(false));
            sinon.stub(core.Api.Storage, 'set').withArgs(StorageType.PRIVATE, 'user.hasSentIsMadeWithUnity').returns(Promise.resolve());
            const kafkaSpy = <sinon.SinonStub>HttpKafka.sendEvent;
            const storageSpy = <sinon.SinonStub>core.Api.Storage.set;
            return IsMadeWithUnity.sendIsMadeWithUnity(core.Api.Storage, core.SdkDetectionInfo).then(() => {
                sinon.assert.calledOnce(kafkaSpy);
                sinon.assert.calledOnce(storageSpy);
            });
        });

        it('should NOT send the event when the key is present', () => {
            sinon.stub(HttpKafka, 'sendEvent').returns(TestFixtures.getOkNativeResponse());
            sinon.stub(core.Api.Storage, 'get').withArgs(StorageType.PRIVATE, 'user.hasSentIsMadeWithUnity').returns(Promise.resolve(true));
            const kafkaSpy = <sinon.SinonStub>HttpKafka.sendEvent;
            return IsMadeWithUnity.sendIsMadeWithUnity(core.Api.Storage, core.SdkDetectionInfo).then(() => {
                sinon.assert.notCalled(kafkaSpy);
            });
        });
    });
});
