import * as sinon from 'sinon';
import { Platform } from 'Core/Constants/Platform';
import { Placement } from 'Ads/Models/Placement';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { AdmobOpenMeasurementManager } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementManager';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { Backend } from 'Backend/Backend';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ICoreApi } from 'Core/ICore';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} AdmobOpenMeasurementManager`, () => {
        const sandbox = sinon.createSandbox();
        let placement: Placement;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let clientInformation: ClientInfo;
        let campaign: AdMobCampaign;
        let deviceInfo: DeviceInfo;
        let request: RequestManager;

        const initAdMobOMManager = () => {
            placement = TestFixtures.getPlacement();
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            clientInformation = TestFixtures.getClientInfo(platform);
            campaign = sandbox.createStubInstance(AdMobCampaign);
            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            } else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            request = sinon.createStubInstance(RequestManager);

            // const openMeasurement: OpenMeasurement = sandbox.createStubInstance(OpenMeasurement);
            return new AdmobOpenMeasurementManager(platform, core, clientInformation, campaign, placement, deviceInfo, request);
        };

        describe('DOM Hierarchy', () => {
            let omManager: AdmobOpenMeasurementManager;
            // let openMeasurement: OpenMeasurement;

            beforeEach(() => {
                // openMeasurement = sandbox.createStubInstance(OpenMeasurement);
                omManager = initAdMobOMManager();
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('addToViewHierarchy', () => {
                //
            });
            it('removeFromViewHieararchy', () => {
                //
            });
            it('injectVerificationResources', () => {
                //
            });
        });
        describe('adEvents', () => {
            it('impression', () => {
                //
            });
            it('loaded', () => {
                //
            });
            it('start', () => {
                //
            });
            it('playerStateChanged', () => {
                //
            });
            it('sendFirstQuartile', () => {
                //
            });
            it('sendMidpoint', () => {
                //
            });
            it('sendThirdQuartile', () => {
                //
            });
            it('completed', () => {
                //
            });
            it('pause', () => {
                //
            });
            it('resume', () => {
                //
            });
            it('skipped', () => {
                //
            });
            it('volumeChange', () => {
                //
            });
            it('adUserInteraction', () => {
                //
            });
            it('bufferStart', () => {
                //
            });
            it('bufferFinish', () => {
                //
            });
            it('geometryChange', () => {
                //
            });
        });

        describe('session events', () => {
            let omManager: AdmobOpenMeasurementManager;
            // let openMeasurement: OpenMeasurement;

            beforeEach(() => {
                // openMeasurement = sandbox.createStubInstance(OpenMeasurement);
                omManager = initAdMobOMManager();
                // omManager.injectVerificationResources();
            });
            afterEach(() => {
                sandbox.restore();
            });

            // it('sessionStart should be called twice', () => {
            //     omManager.sessionStart();
            //     sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.sessionStart);
            // });
            // it('sessionFinish should be called twice', () => {
            //     omManager.sessionFinish();
            //     sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.sessionFinish);
            // });
        });
    });
});
