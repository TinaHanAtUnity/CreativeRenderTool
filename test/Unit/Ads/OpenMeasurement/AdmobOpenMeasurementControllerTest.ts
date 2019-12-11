import * as sinon from 'sinon';
import { Platform } from 'Core/Constants/Platform';
import { Placement } from 'Ads/Models/Placement';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { Backend } from 'Backend/Backend';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ICoreApi } from 'Core/ICore';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IAdView, ISessionEvent } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { OpenMeasurementController } from 'Ads/Views/OpenMeasurement/OpenMeasurementController';
import { assert } from 'chai';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { ProgrammaticTrackingService, AdmobMetric } from 'Ads/Utilities/ProgrammaticTrackingService';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} AdmobOpenMeasurementContoller`, () => {
        const sandbox = sinon.createSandbox();
        let placement: Placement;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let clientInformation: ClientInfo;
        let campaign: AdMobCampaign;
        let deviceInfo: DeviceInfo;
        let request: RequestManager;
        let thirdPartyEventManager: ThirdPartyEventManager;
        let programmaticTrackingService: ProgrammaticTrackingService;

        const initAdMobOMManager = () => {
            placement = TestFixtures.getPlacement();
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            clientInformation = TestFixtures.getClientInfo(platform);
            campaign = sandbox.createStubInstance(AdMobCampaign);
            thirdPartyEventManager = sandbox.createStubInstance(ThirdPartyEventManager);

            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            } else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            request = sinon.createStubInstance(RequestManager);
            const adViewBuilder = sandbox.createStubInstance(AdmobOpenMeasurementController);
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            return new AdmobOpenMeasurementController(platform, core, clientInformation, campaign, placement, deviceInfo, request, adViewBuilder, thirdPartyEventManager, programmaticTrackingService);
        };

        describe('DOM Hierarchy', () => {
            let omManager: AdmobOpenMeasurementController;

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
                    const verificationResource = {
                        resourceUrl: 'http://scoot.com',
                        vendorKey: 'scoot',
                        verificationParameters: 'scootage'
                    };
                    const verificationResource1 = {
                        resourceUrl: 'http://scoot1.com',
                        vendorKey: 'scoot1',
                        verificationParameters: 'scootage1'
                    };
                    omManager.injectVerificationResources([verificationResource, verificationResource1]);
                    sinon.assert.calledTwice(<sinon.SinonStub>omManager.setupOMInstance);
                    sinon.assert.calledWith(<sinon.SinonStub>thirdPartyEventManager.setTemplateValue, '%25OM_VENDORS%25', 'scoot|scoot1');
                    sinon.assert.calledOnce(<sinon.SinonStub>programmaticTrackingService.reportMetricEvent);
                    sinon.assert.calledWith(<sinon.SinonStub>programmaticTrackingService.reportMetricEvent, 'admob_om_injected');
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
            let omManager: AdmobOpenMeasurementController;

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

            it('sessionFinish should report to pts', () => {
                (<sinon.SinonStub>programmaticTrackingService.reportMetricEvent).reset();
                omManager.sessionFinish();
                sinon.assert.calledOnce(<sinon.SinonStub>programmaticTrackingService.reportMetricEvent);
                sinon.assert.calledWith(<sinon.SinonStub>programmaticTrackingService.reportMetricEvent, 'admob_om_session_finish');
            });

            it('sessionStart should report to pts', () => {
                (<sinon.SinonStub>programmaticTrackingService.reportMetricEvent).reset();

                const sessionEvent: ISessionEvent = {
                    adSessionId: '',
                    timestamp: 1,
                    type: '',
                    data: {}
                };

                omManager.sessionStart(sessionEvent);
                sinon.assert.calledOnce(<sinon.SinonStub>programmaticTrackingService.reportMetricEvent);
                sinon.assert.calledWith(<sinon.SinonStub>programmaticTrackingService.reportMetricEvent, 'admob_om_session_start');
            });
        });

        describe('impression event handling', () => {
            let omManager: AdmobOpenMeasurementController;

            beforeEach(() => {
                omManager = initAdMobOMManager();
                sinon.stub(deviceInfo, 'getScreenWidth').returns(1080);
                sinon.stub(deviceInfo, 'getScreenHeight').returns(1920);
                sandbox.stub(OpenMeasurementController.prototype, 'impression');
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('impression should build adview and om impression object', () => {
                const impressionDataAndroid = {'mediaType': 'video', 'viewport': {'width': 540, 'height': 960},
                'adView': {'percentageInView': 100, 'geometry': {'x': 0, 'y': 200, 'width': 300, 'height': 300}, 'onScreenGeometry': {'x': 0, 'y': 200, 'width': 300, 'height': 300, 'obstructions': []}, 'measuringElement': false, 'reasons': []}};
                const impressionDataIOS = {'mediaType': 'video', 'viewport': {'width': 1080, 'height': 1920},
                'adView': {'percentageInView': 100, 'geometry': {'x': 0, 'y': 200, 'width': 300, 'height': 300}, 'onScreenGeometry': {'x': 0, 'y': 200, 'width': 300, 'height': 300, 'obstructions': []}, 'measuringElement': false, 'reasons': []}};
                const testAdView: IAdView = {
                    percentageInView: 100,
                    geometry: {
                        x: 0,
                        y: 200,
                        width: 300,
                        height: 300
                    },
                    onScreenGeometry: {
                        x: 0,
                        y: 200,
                        width: 300,
                        height: 300,
                        obstructions: []
                    },
                    measuringElement: false,
                    reasons: []
                };

                const omAdViewBuilder = new OpenMeasurementAdViewBuilder(campaign, deviceInfo, platform);

                sandbox.stub(omAdViewBuilder, 'buildAdmobImpressionView').returns(testAdView);

                return omManager.admobImpression(omAdViewBuilder).then(() => {
                    sinon.assert.called(<sinon.SinonStub>OpenMeasurementController.prototype.impression);
                    if (platform === Platform.ANDROID) {
                        assert.deepEqual(JSON.stringify((<sinon.SinonStub>OpenMeasurementController.prototype.impression).getCall(0).args[0]), JSON.stringify(impressionDataAndroid));
                    } else {
                        assert.deepEqual(JSON.stringify((<sinon.SinonStub>OpenMeasurementController.prototype.impression).getCall(0).args[0]), JSON.stringify(impressionDataIOS));
                    }
                });
            });
        });
    });
});
