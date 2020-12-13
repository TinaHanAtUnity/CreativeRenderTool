import * as sinon from 'sinon';
import { Platform } from 'Core/Constants/Platform';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { VastAdVerification } from 'VAST/Models/VastAdVerification';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';
import { AccessMode, AdSessionType, OM_JS_VERSION, OMID_P, PARTNER_NAME } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import SimpleVast from 'xml/SimpleVast.xml';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} OMManager`, () => {
        const sandbox = sinon.createSandbox();
        let placement;
        let clientInfo;
        let deviceInfo;
        let core;
        let backend;
        let nativeBridge;
        let thirdPartyEventManager;
        const initOMManager = (om) => {
            placement = TestFixtures.getPlacement();
            clientInfo = TestFixtures.getClientInfo(platform);
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            thirdPartyEventManager = sandbox.createStubInstance(ThirdPartyEventManager);
            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            }
            else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            const adViewBuilder = sandbox.createStubInstance(OpenMeasurementAdViewBuilder);
            return new VastOpenMeasurementController(platform, placement, om, adViewBuilder, clientInfo, deviceInfo);
        };
        describe('DOM Hierarchy', () => {
            let omManager;
            let openMeasurement;
            beforeEach(() => {
                openMeasurement = sandbox.createStubInstance(OpenMeasurement);
                omManager = initOMManager([openMeasurement, openMeasurement]);
            });
            afterEach(() => {
                sandbox.restore();
            });
            describe('addToViewHierarchy', () => {
                it('should add every om to the hierarchy', () => {
                    omManager.addToViewHierarchy();
                    sinon.assert.calledTwice(openMeasurement.addToViewHierarchy);
                });
            });
            describe('removeFromViewHieararchy', () => {
                it('should add every om to the hierarchy', () => {
                    omManager.removeFromViewHieararchy();
                    sinon.assert.calledTwice(openMeasurement.removeFromViewHieararchy);
                });
            });
            describe('injectVerifications', () => {
                it('should add every om to the hierarchy', () => {
                    omManager.injectVerifications();
                    sinon.assert.calledTwice(openMeasurement.injectAdVerifications);
                });
            });
        });
        describe('session start', () => {
            let omManager;
            let openMeasurement1;
            let openMeasurement2;
            const vastVerificationResource1 = new VastVerificationResource('https://s3-us-west-2.amazonaws.com/omsdk-files/compliance-js/omid-validation-verification-script-v1.js', 'omid', true, 'AdVerifications');
            const vastVerificationResource2 = new VastVerificationResource('https://something.test.js', 'unity', false, 'Verifications');
            const vastAdVerificton1 = new VastAdVerification('iabtechlab.com-omid', [vastVerificationResource1], 'AliceWonderland');
            const vastAdVerificton2 = new VastAdVerification('test.test', [vastVerificationResource2]);
            beforeEach(() => {
                const vastXml = SimpleVast;
                const vastParser = TestFixtures.getVastParserStrict();
                const parsedVast = vastParser.parseVast(vastXml);
                const params = TestFixtures.getVastCampaignParams(parsedVast, 3600, '12345');
                const campaign = new VastCampaign(params);
                openMeasurement1 = new OpenMeasurement(platform, core, clientInfo, campaign, placement, deviceInfo, thirdPartyEventManager, vastAdVerificton1.getVerificationVendor(), vastAdVerificton1);
                openMeasurement2 = new OpenMeasurement(platform, core, clientInfo, campaign, placement, deviceInfo, thirdPartyEventManager, vastAdVerificton2.getVerificationVendor(), vastAdVerificton2);
                sinon.stub(Date, 'now').returns(123);
                sinon.stub(openMeasurement1, 'getOMAdSessionId').returns('456');
                sinon.stub(openMeasurement2, 'getOMAdSessionId').returns('456');
                omManager = initOMManager([openMeasurement1, openMeasurement2]);
            });
            afterEach(() => {
                sandbox.restore();
            });
            it('should be called with correct data', () => {
                const contextData = {
                    apiVersion: OMID_P,
                    environment: 'app',
                    accessMode: AccessMode.LIMITED,
                    adSessionType: AdSessionType.NATIVE,
                    omidNativeInfo: {
                        partnerName: PARTNER_NAME,
                        partnerVersion: '2.0.0-alpha2'
                    },
                    omidJsInfo: {
                        omidImplementer: PARTNER_NAME,
                        serviceVersion: '1.2.10',
                        sessionClientVersion: '1.2.10',
                        partnerName: PARTNER_NAME,
                        partnerVersion: TestFixtures.getClientInfo().getSdkVersionName()
                    },
                    app: {
                        libraryVersion: OM_JS_VERSION,
                        appId: TestFixtures.getClientInfo().getApplicationName()
                    },
                    deviceInfo: {
                        deviceType: deviceInfo.getModel(),
                        os: platform === Platform.ANDROID ? 'Android' : 'iOS',
                        osVersion: deviceInfo.getOsVersion()
                    },
                    supports: ['vlid', 'clid']
                };
                const event1 = {
                    adSessionId: '456',
                    timestamp: 123,
                    type: 'sessionStart',
                    data: {
                        vendorkey: 'iabtechlab.com-omid',
                        verificationParameters: 'AliceWonderland',
                        context: contextData
                    }
                };
                const event2 = {
                    adSessionId: '456',
                    timestamp: 123,
                    type: 'sessionStart',
                    data: {
                        vendorkey: 'test.test',
                        context: contextData
                    }
                };
                sinon.stub(openMeasurement1, 'sessionStart');
                sinon.stub(openMeasurement2, 'sessionStart');
                omManager.sessionStart();
                sinon.assert.calledWith(openMeasurement1.sessionStart, event1);
                sinon.assert.calledWith(openMeasurement2.sessionStart, event2);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdE9wZW5NZWFzdXJlbWVudENvbnRyb2xsZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Fkcy9PcGVuTWVhc3VyZW1lbnQvVmFzdE9wZW5NZWFzdXJlbWVudENvbnRyb2xsZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUN4RyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDNUUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBTXRHLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ2hGLE9BQU8sRUFDSCxVQUFVLEVBQ1YsYUFBYSxFQUdiLGFBQWEsRUFDYixNQUFNLEVBQ04sWUFBWSxFQUNmLE1BQU0sb0RBQW9ELENBQUM7QUFDNUQsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUM7QUFDNUMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTdFLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0lBQ2hELFFBQVEsQ0FBQyxHQUFHLFFBQVEsWUFBWSxFQUFFLEdBQUcsRUFBRTtRQUNuQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMs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