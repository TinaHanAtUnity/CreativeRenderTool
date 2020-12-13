import * as sinon from 'sinon';
import { Platform } from 'Core/Constants/Platform';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { OpenMeasurementController } from 'Ads/Views/OpenMeasurement/OpenMeasurementController';
import { assert } from 'chai';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} AdmobOpenMeasurementContoller`, () => {
        const sandbox = sinon.createSandbox();
        let placement;
        let backend;
        let nativeBridge;
        let core;
        let clientInformation;
        let campaign;
        let deviceInfo;
        let request;
        let thirdPartyEventManager;
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
            }
            else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            request = sinon.createStubInstance(RequestManager);
            const adViewBuilder = sandbox.createStubInstance(AdmobOpenMeasurementController);
            sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
            sinon.stub(SDKMetrics, 'reportMetricEventWithTags').returns(Promise.resolve());
            return new AdmobOpenMeasurementController(platform, core, clientInformation, campaign, placement, deviceInfo, request, adViewBuilder, thirdPartyEventManager);
        };
        describe('DOM Hierarchy', () => {
            let omManager;
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
                it('should add multiple om instances to dom and inject', () => {
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
                    sinon.assert.calledTwice(omManager.setupOMInstance);
                    sinon.assert.calledWith(thirdPartyEventManager.setTemplateValue, '%25OM_VENDORS%25', 'scoot|scoot1');
                });
            });
            it('addToViewHierarchy', () => {
                omManager.addToViewHierarchy();
                sinon.assert.called(omManager.getAdmobBridge().connect);
            });
            it('removeFromViewHieararchy', () => {
                omManager.removeFromViewHieararchy();
                sinon.assert.called(omManager.getAdmobBridge().disconnect);
            });
        });
        describe('session event additional handling', () => {
            let omManager;
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
                sinon.assert.calledOnce(omManager.getAdmobBridge().sendSessionFinish);
            });
        });
        describe('impression event handling', () => {
            let omManager;
            let omAdViewBuilder;
            beforeEach(() => {
                omManager = initAdMobOMManager();
                const testAdView = {
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
                omAdViewBuilder = new OpenMeasurementAdViewBuilder(campaign);
                sandbox.stub(omAdViewBuilder, 'buildAdmobImpressionView').returns(testAdView);
                sandbox.stub(omManager, 'mountOMInstance');
                sandbox.stub(OpenMeasurementController.prototype, 'impression');
                sandbox.stub(omManager, 'geometryChange');
            });
            afterEach(() => {
                sandbox.restore();
            });
            it('should build adview and om impression object', () => {
                const impressionData = { 'mediaType': 'video', 'viewport': { 'width': screen.width, 'height': screen.height },
                    'adView': { 'percentageInView': 100, 'geometry': { 'x': 0, 'y': 200, 'width': 300, 'height': 300 }, 'onScreenGeometry': { 'x': 0, 'y': 200, 'width': 300, 'height': 300, 'obstructions': [] }, 'measuringElement': false, 'reasons': [] } };
                omManager.admobImpression(omAdViewBuilder);
                sinon.assert.called(OpenMeasurementController.prototype.impression);
                assert.deepEqual(JSON.stringify(OpenMeasurementController.prototype.impression.getCall(0).args[0]), JSON.stringify(impressionData));
            });
            it('should send admob om impression pts metric', () => {
                omManager.admobImpression(omAdViewBuilder);
                sinon.assert.called(SDKMetrics.reportMetricEvent);
            });
            it('should send admob om impression pts metric if one verification exists', () => {
                const reportSpy = SDKMetrics.reportMetricEvent;
                const verificationResource0 = {
                    resourceUrl: 'http://scoot.com',
                    vendorKey: 'scoot',
                    verificationParameters: 'scootage'
                };
                const openMeasurement0 = new OpenMeasurement(platform, core, clientInformation, campaign, placement, deviceInfo, thirdPartyEventManager, 'scoot');
                sandbox.stub(openMeasurement0, 'getVerificationResource').returns(verificationResource0);
                omManager.setupOMInstance(openMeasurement0, verificationResource0);
                omManager.admobImpression(omAdViewBuilder);
                sinon.assert.callCount(SDKMetrics.reportMetricEvent, 1);
                assert.equal(reportSpy.getCall(0).args[0], 'admob_om_impression');
            });
            it('should send admob om impression pts metric for multiple om instances', () => {
                const reportSpy = SDKMetrics.reportMetricEvent;
                const reportTagSpy = SDKMetrics.reportMetricEventWithTags;
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
                const openMeasurement0 = new OpenMeasurement(platform, core, clientInformation, campaign, placement, deviceInfo, thirdPartyEventManager, 'scootage');
                const openMeasurement1 = new OpenMeasurement(platform, core, clientInformation, campaign, placement, deviceInfo, thirdPartyEventManager, 'scootage1');
                sandbox.stub(openMeasurement0, 'getVerificationResource').returns(verificationResource0);
                sandbox.stub(openMeasurement1, 'getVerificationResource').returns(verificationResource1);
                omManager.setupOMInstance(openMeasurement0, verificationResource0);
                omManager.setupOMInstance(openMeasurement1, verificationResource1);
                omManager.admobImpression(omAdViewBuilder);
                sinon.assert.callCount(SDKMetrics.reportMetricEvent, 1);
                sinon.assert.callCount(SDKMetrics.reportMetricEventWithTags, 1);
                assert.equal(reportSpy.getCall(0).args[0], 'admob_om_impression');
                assert.equal(reportTagSpy.getCall(0).args[0], 'doubleclick_om_impressions');
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
                const openMeasurement0 = new OpenMeasurement(platform, core, clientInformation, campaign, placement, deviceInfo, thirdPartyEventManager, 'scootage');
                const openMeasurement1 = new OpenMeasurement(platform, core, clientInformation, campaign, placement, deviceInfo, thirdPartyEventManager, 'scootage1');
                sandbox.stub(openMeasurement0, 'getVerificationResource').returns(verificationResource0);
                sandbox.stub(openMeasurement1, 'getVerificationResource').returns(verificationResource1);
                omManager.setupOMInstance(openMeasurement0, verificationResource0);
                omManager.setupOMInstance(openMeasurement1, verificationResource1);
                omManager.admobImpression(omAdViewBuilder);
                sinon.assert.called(omManager.geometryChange);
                assert.deepEqual(JSON.stringify(omManager.geometryChange.getCall(0).args[0]), JSON.stringify({ 'width': screen.width, 'height': screen.height }));
                assert.deepEqual(JSON.stringify(omManager.geometryChange.getCall(0).args[1]), JSON.stringify({ 'percentageInView': 100, 'geometry': { 'x': 0, 'y': 200, 'width': 300, 'height': 300 }, 'onScreenGeometry': { 'x': 0, 'y': 200, 'width': 300, 'height': 300, 'obstructions': [] }, 'measuringElement': false, 'reasons': [] }));
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRtb2JPcGVuTWVhc3VyZW1lbnRDb250cm9sbGVyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvT3Blbk1lYXN1cmVtZW50L0FkbW9iT3Blbk1lYXN1cmVtZW50Q29udHJvbGxlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsOEJBQThCLEVBQUUsTUFBTSwwREFBMEQsQ0FBQztBQUMxRyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFJM0QsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBSTlELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHFEQUFxRCxDQUFDO0FBQ2hHLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDdEcsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUU1RSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUNoRCxRQUFRLENBQUMsR0FBRyxRQUFRLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtRQUN2RCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDdEMsSUFBSSxTQUFv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