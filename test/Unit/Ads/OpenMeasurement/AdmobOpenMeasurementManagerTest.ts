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
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { IVerificationScriptResource } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { assert } from 'chai';

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

            return new AdmobOpenMeasurementManager(platform, core, clientInformation, campaign, placement, deviceInfo, request);
        };

        describe('DOM Hierarchy', () => {
            let omManager: AdmobOpenMeasurementManager;
            let verificationResource: IVerificationScriptResource;

            beforeEach(() => {
                omManager = initAdMobOMManager();
                sandbox.stub(omManager.getAdmobBridge(), 'connect');
                sandbox.stub(omManager.getAdmobBridge(), 'disconnect');
            });

            afterEach(() => {
                sandbox.restore();
            });

            describe('injectVerificationResources', () => {
                beforeEach(() => {
                    sandbox.stub(omManager, 'setupOMInstance');
                });

                it ('should add multiple om instances to dom and inject', () => {
                    verificationResource = {
                        resourceUrl: 'http://scoot.com',
                        vendorKey: 'scoot',
                        verificationParameters: 'scootage'
                    };
                    omManager.injectVerificationResources([verificationResource, verificationResource]);
                    sinon.assert.calledTwice(<sinon.SinonStub>omManager.setupOMInstance);
                });
            });

            it('addToViewHierarchy', () => {
                omManager.addToViewHierarchy();
                sinon.assert.called(<sinon.SinonStub>omManager.getAdmobBridge().connect);
            });
            it('removeFromViewHieararchy', () => {
                omManager.removeFromViewHieararchy();
                sinon.assert.called(<sinon.SinonStub>omManager.getAdmobBridge().disconnect);
            });
        });

        describe('session event additional handling', () => {
            let omManager: AdmobOpenMeasurementManager;

            beforeEach(() => {
                omManager = initAdMobOMManager();
                sandbox.stub(omManager.getAdmobBridge(), 'sendSessionFinish');
                sandbox.stub(omManager, 'setupOMInstance');
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('sessionFinish should should pass to admob session interface bridge', () => {
                omManager.sessionFinish();
                sinon.assert.calledOnce(<sinon.SinonStub>omManager.getAdmobBridge().sendSessionFinish);
            });
        });
    });
});
