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
import { SDKMetrics, AdmobMetric } from 'Ads/Utilities/SDKMetrics';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';

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
            sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
            sinon.stub(SDKMetrics, 'reportMetricEventWithTags').returns(Promise.resolve());
            sinon.stub(SDKMetrics, 'createAdsSdkTag').returns('');

            return new AdmobOpenMeasurementController(platform, core, clientInformation, campaign, placement, deviceInfo, request, adViewBuilder, thirdPartyEventManager);
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
                    sinon.assert.calledOnce(<sinon.SinonStub>SDKMetrics.reportMetricEvent);
                    sinon.assert.calledWith(<sinon.SinonStub>SDKMetrics.reportMetricEvent, 'admob_om_injected');
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
                sandbox.stub(omManager, 'mountOMInstance');
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('sessionFinish should should pass to admob session interface bridge', () => {
                omManager.sessionFinish();
                sinon.assert.calledOnce(<sinon.SinonStub>omManager.getAdmobBridge().sendSessionFinish);
            });

            it('sessionFinish should report to pts', () => {
                (<sinon.SinonStub>SDKMetrics.reportMetricEvent).reset();
                omManager.sessionFinish();
                sinon.assert.calledOnce(<sinon.SinonStub>SDKMetrics.reportMetricEvent);
                sinon.assert.calledWith(<sinon.SinonStub>SDKMetrics.reportMetricEvent, 'admob_om_session_finish');
            });

            it('sessionStart should report to pts', () => {
                (<sinon.SinonStub>SDKMetrics.reportMetricEvent).reset();

                const sessionEvent: ISessionEvent = {
                    adSessionId: '',
                    timestamp: 1,
                    type: '',
                    data: {}
                };

                omManager.sessionStart(sessionEvent);
                sinon.assert.calledOnce(<sinon.SinonStub>SDKMetrics.reportMetricEvent);
                sinon.assert.calledWith(<sinon.SinonStub>SDKMetrics.reportMetricEvent, 'admob_om_session_start');
            });
        });

        describe('impression event handling', () => {
            let omManager: AdmobOpenMeasurementController;
            let omAdViewBuilder: OpenMeasurementAdViewBuilder;

            beforeEach(() => {
                omManager = initAdMobOMManager();

                sinon.stub(deviceInfo, 'getScreenWidth').returns(1080);
                sinon.stub(deviceInfo, 'getScreenHeight').returns(1920);

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
                omAdViewBuilder = new OpenMeasurementAdViewBuilder(campaign, deviceInfo, platform);

                sandbox.stub(omAdViewBuilder, 'buildAdmobImpressionView').returns(testAdView);
                sandbox.stub(omManager, 'mountOMInstance');

                sandbox.stub(OpenMeasurementController.prototype, 'impression');
                sandbox.stub(omManager, 'geometryChange');
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should build adview and om impression object', () => {
                const impressionDataAndroid = {'mediaType': 'video', 'viewport': {'width': 540, 'height': 960},
                'adView': {'percentageInView': 100, 'geometry': {'x': 0, 'y': 200, 'width': 300, 'height': 300}, 'onScreenGeometry': {'x': 0, 'y': 200, 'width': 300, 'height': 300, 'obstructions': []}, 'measuringElement': false, 'reasons': []}};
                const impressionDataIOS = {'mediaType': 'video', 'viewport': {'width': 1080, 'height': 1920},
                'adView': {'percentageInView': 100, 'geometry': {'x': 0, 'y': 200, 'width': 300, 'height': 300}, 'onScreenGeometry': {'x': 0, 'y': 200, 'width': 300, 'height': 300, 'obstructions': []}, 'measuringElement': false, 'reasons': []}};

                return omManager.admobImpression(omAdViewBuilder).then(() => {
                    sinon.assert.called(<sinon.SinonStub>OpenMeasurementController.prototype.impression);
                    if (platform === Platform.ANDROID) {
                        assert.deepEqual(JSON.stringify((<sinon.SinonStub>OpenMeasurementController.prototype.impression).getCall(0).args[0]), JSON.stringify(impressionDataAndroid));
                    } else {
                        assert.deepEqual(JSON.stringify((<sinon.SinonStub>OpenMeasurementController.prototype.impression).getCall(0).args[0]), JSON.stringify(impressionDataIOS));
                    }
                });
            });

            it('should send admob om impression pts metric', () => {

                return omManager.admobImpression(omAdViewBuilder).then(() => {
                    sinon.assert.called(<sinon.SinonStub>SDKMetrics.reportMetricEvent);
                });
            });

            it('should send admob om impression pts metric if one verification exists', () => {

                const reportSpy = <sinon.SinonStub>SDKMetrics.reportMetricEvent;

                const verificationResource0 = {
                    resourceUrl: 'http://scoot.com',
                    vendorKey: 'scoot',
                    verificationParameters: 'scootage'
                };

                const openMeasurement0 = new OpenMeasurement<AdMobCampaign>(platform, core, clientInformation, campaign, placement, deviceInfo, request, 'scoot');
                sandbox.stub(openMeasurement0, 'getVerificationResource').returns(verificationResource0);

                omManager.setupOMInstance(openMeasurement0, verificationResource0);

                return omManager.admobImpression(omAdViewBuilder).then(() => {
                    sinon.assert.callCount(<sinon.SinonStub>SDKMetrics.reportMetricEvent, 1);
                    assert.equal(reportSpy.getCall(0).args[0], 'admob_om_impression');
                });
            });

            it('should send admob om impression pts metric for multiple om instances', () => {

                const reportSpy = <sinon.SinonStub>SDKMetrics.reportMetricEvent;
                const reportTagSpy = <sinon.SinonStub>SDKMetrics.reportMetricEventWithTags;

                const verificationResource0 = {
                    resourceUrl: 'http://scoot.com',
                    vendorKey: 'scoot',
                    verificationParameters: 'scootage'
                };
                const verificationResource1 = {
                    resourceUrl: 'http://scoot1.com',
                    vendorKey: 'doubleclickbygoogle.com.booyah',
                    verificationParameters: 'scootage1'
                };

                const openMeasurement0 =  new OpenMeasurement<AdMobCampaign>(platform, core, clientInformation, campaign, placement, deviceInfo, request, 'scootage');
                const openMeasurement1 =  new OpenMeasurement<AdMobCampaign>(platform, core, clientInformation, campaign, placement, deviceInfo, request, 'scootage1');
                sandbox.stub(openMeasurement0, 'getVerificationResource').returns(verificationResource0);
                sandbox.stub(openMeasurement1, 'getVerificationResource').returns(verificationResource1);

                omManager.setupOMInstance(openMeasurement0, verificationResource0);
                omManager.setupOMInstance(openMeasurement1, verificationResource1);

                return omManager.admobImpression(omAdViewBuilder).then(() => {
                    sinon.assert.callCount(<sinon.SinonStub>SDKMetrics.reportMetricEvent, 1);
                    sinon.assert.callCount(<sinon.SinonStub>SDKMetrics.reportMetricEventWithTags, 1);
                    assert.equal(reportSpy.getCall(0).args[0], 'admob_om_impression');
                    assert.equal(reportTagSpy.getCall(0).args[0], 'doubleclick_om_impressions');
                });
            });

            it('should call geometry change with impression adview and viewport', () => {
                const verificationResource0 = {
                    resourceUrl: 'http://scoot.com',
                    vendorKey: 'scoot',
                    verificationParameters: 'scootage'
                };
                const verificationResource1 = {
                    resourceUrl: 'http://scoot1.com',
                    vendorKey: 'scoot1',
                    verificationParameters: 'scootage1'
                };

                const openMeasurement0 = new OpenMeasurement<AdMobCampaign>(platform, core, clientInformation, campaign, placement, deviceInfo, request, 'scootage');
                const openMeasurement1 = new OpenMeasurement<AdMobCampaign>(platform, core, clientInformation, campaign, placement, deviceInfo, request, 'scootage1');
                sandbox.stub(openMeasurement0, 'getVerificationResource').returns(verificationResource0);
                sandbox.stub(openMeasurement1, 'getVerificationResource').returns(verificationResource1);

                omManager.setupOMInstance(openMeasurement0, verificationResource0);
                omManager.setupOMInstance(openMeasurement1, verificationResource1);

                return omManager.admobImpression(omAdViewBuilder).then(() => {
                    sinon.assert.called(<sinon.SinonStub>omManager.geometryChange);
                    if (platform === Platform.ANDROID) {
                        assert.deepEqual(JSON.stringify((<sinon.SinonStub>omManager.geometryChange).getCall(0).args[0]), JSON.stringify({'width': 540, 'height': 960}));
                        assert.deepEqual(JSON.stringify((<sinon.SinonStub>omManager.geometryChange).getCall(0).args[1]), JSON.stringify({'percentageInView': 100, 'geometry': {'x': 0, 'y': 200, 'width': 300, 'height': 300}, 'onScreenGeometry': {'x': 0, 'y': 200, 'width': 300, 'height': 300, 'obstructions': []}, 'measuringElement': false, 'reasons': []}));
                    } else {
                        assert.deepEqual(JSON.stringify((<sinon.SinonStub>omManager.geometryChange).getCall(0).args[0]), JSON.stringify({'width': 1080, 'height': 1920}));
                        assert.deepEqual(JSON.stringify((<sinon.SinonStub>omManager.geometryChange).getCall(0).args[1]), JSON.stringify({'percentageInView': 100, 'geometry': {'x': 0, 'y': 200, 'width': 300, 'height': 300}, 'onScreenGeometry': {'x': 0, 'y': 200, 'width': 300, 'height': 300, 'obstructions': []}, 'measuringElement': false, 'reasons': []}));
                    }
                });
            });
        });
    });
});
