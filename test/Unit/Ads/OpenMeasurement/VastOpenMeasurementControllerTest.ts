import * as sinon from 'sinon';
import { Platform } from 'Core/Constants/Platform';
import { Placement } from 'Ads/Models/Placement';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ICoreApi } from 'Core/ICore';
import { Backend } from 'Backend/Backend';
import { VastAdVerification } from 'VAST/Models/VastAdVerification';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';
import { AccessMode, ISessionEvent, IContext, AdSessionType, PARTNER_NAME, OM_JS_VERSION, OMID_P } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import SimpleVast from 'xml/SimpleVast.xml';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} OMManager`, () => {
        const sandbox = sinon.createSandbox();
        let placement: Placement;
        let clientInfo: ClientInfo;
        let deviceInfo: DeviceInfo;
        let core: ICoreApi;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let thirdPartyEventManager: ThirdPartyEventManager;

        const initOMManager = (om: OpenMeasurement<VastCampaign>[]) => {
            placement = TestFixtures.getPlacement();
            clientInfo = TestFixtures.getClientInfo(platform);
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            thirdPartyEventManager = sandbox.createStubInstance(ThirdPartyEventManager);

            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            } else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            const adViewBuilder = sandbox.createStubInstance(OpenMeasurementAdViewBuilder);
            return new VastOpenMeasurementController(platform, placement, om, adViewBuilder, clientInfo, deviceInfo);
        };

        describe('DOM Hierarchy', () => {
            let omManager: VastOpenMeasurementController;
            let openMeasurement: OpenMeasurement<VastCampaign>;

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
                    sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.addToViewHierarchy);
                });
            });
            describe('removeFromViewHieararchy', () => {
                it('should add every om to the hierarchy', () => {
                    omManager.removeFromViewHieararchy();
                    sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.removeFromViewHieararchy);
                });
            });
            describe('injectVerifications', () => {
                it('should add every om to the hierarchy', () => {
                    omManager.injectVerifications();
                    sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.injectAdVerifications);
                });
            });
        });

        describe('session start', () => {
            let omManager: VastOpenMeasurementController;
            let openMeasurement1: OpenMeasurement<VastCampaign>;
            let openMeasurement2: OpenMeasurement<VastCampaign>;

            const vastVerificationResource1 = new VastVerificationResource ('https://s3-us-west-2.amazonaws.com/omsdk-files/compliance-js/omid-validation-verification-script-v1.js', 'omid', true, 'AdVerifications');
            const vastVerificationResource2 = new VastVerificationResource ('https://something.test.js', 'unity', false, 'Verifications');
            const vastAdVerificton1: VastAdVerification = new VastAdVerification('iabtechlab.com-omid', [vastVerificationResource1], 'AliceWonderland');
            const vastAdVerificton2: VastAdVerification = new VastAdVerification('test.test', [vastVerificationResource2]);

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

                const contextData: IContext = {
                    apiVersion: OMID_P, // Version code of official OMID JS Verification Client API
                    environment: 'app', // OMID JS Verification Client API
                    accessMode: AccessMode.LIMITED, // Verification code is executed in a sandbox with only indirect information about ad
                    adSessionType: AdSessionType.NATIVE, // Needed to be native for IAS for some reason
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
                        deviceType: deviceInfo.getModel(), //this._deviceInfo.getModel(),
                        os: Platform[platform].toLocaleLowerCase(), //platform.toLowerCase(),
                        osVersion: deviceInfo.getOsVersion()
                    },
                    supports: ['vlid', 'clid']
                };
                const event1: ISessionEvent = {
                    adSessionId: '456',
                    timestamp: 123,
                    type: 'sessionStart',
                    data: {
                        vendorkey: 'iabtechlab.com-omid',
                        verificationParameters: 'AliceWonderland',
                        context: contextData
                    }
                };
                const event2: ISessionEvent = {
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

                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement1.sessionStart, event1);
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement2.sessionStart, event2);
            });
        });
    });
});
