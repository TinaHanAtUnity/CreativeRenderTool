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
import { AccessMode, IVerificationScriptResource, IImpressionValues, OMID3pEvents, IVastProperties, IViewPort, IAdView, ISessionEvent, SessionEvents, MediaType, VideoPosition, VideoEventAdaptorType, ObstructionReasons, IRectangle, IContext, AdSessionType, PARTNER_NAME, DEFAULT_VENDOR_KEY, OM_JS_VERSION, OMID_P, SDK_APIS} from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { Campaign } from 'Ads/Models/Campaign';
import SimpleVast from 'xml/SimpleVast.xml';
import { RequestManager } from 'Core/Managers/RequestManager';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { assert } from 'chai';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} OMManager`, () => {
        const sandbox = sinon.createSandbox();
        let placement: Placement;
        let clientInfo: ClientInfo;
        let deviceInfo: DeviceInfo;
        let core: ICoreApi;
        let backend: Backend;
        let nativeBridge: NativeBridge;

        const initOMManager = (om: OpenMeasurement[]) => {
            placement = TestFixtures.getPlacement();
            clientInfo = TestFixtures.getClientInfo(platform);
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);

            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            } else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            const adViewBuilder = sandbox.createStubInstance(OpenMeasurementAdViewBuilder);
            return new VastOpenMeasurementController(platform, placement, om, adViewBuilder, clientInfo, deviceInfo);
        };

        // describe('DOM Hierarchy', () => {
        //     let omManager: VastOpenMeasurementController;
        //     let openMeasurement: OpenMeasurement;

        //     beforeEach(() => {
        //         openMeasurement = sandbox.createStubInstance(OpenMeasurement);
        //         omManager = initOMManager([openMeasurement, openMeasurement]);
        //     });

        //     afterEach(() => {
        //         sandbox.restore();
        //     });

        //     describe('addToViewHierarchy', () => {
        //         it('should add every om to the hierarchy', () => {
        //             omManager.addToViewHierarchy();
        //             sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.addToViewHierarchy);
        //         });
        //     });
        //     describe('removeFromViewHieararchy', () => {
        //         it('should add every om to the hierarchy', () => {
        //             omManager.removeFromViewHieararchy();
        //             sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.removeFromViewHieararchy);
        //         });
        //     });
        //     describe('injectVerifications', () => {
        //         it('should add every om to the hierarchy', () => {
        //             omManager.injectVerifications();
        //             sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.injectAdVerifications);
        //         });
        //     });
        // });

        describe('session start', () => {
            let omManager: VastOpenMeasurementController;
            let openMeasurement1: OpenMeasurement;
            let openMeasurement2: OpenMeasurement;

            const vastVerificationResource1 = new VastVerificationResource ('https://s3-us-west-2.amazonaws.com/omsdk-files/compliance-js/omid-validation-verification-script-v1.js', 'omid', true, 'AdVerifications');
            const vastVerificationResource2 = new VastVerificationResource ('https://something.test.js', 'unity', false, 'Verifications');
            const vastAdVerificton1: VastAdVerification = new VastAdVerification('iabtechlab.com-omid', [vastVerificationResource1]);
            const vastAdVerificton2: VastAdVerification = new VastAdVerification('test.test', [vastVerificationResource2]);

            beforeEach(() => {
                // const vastVerificationResource1 = new VastVerificationResource ('https://s3-us-west-2.amazonaws.com/omsdk-files/compliance-js/omid-validation-verification-script-v1.js', 'omid', true, 'AdVerifications');
                // const vastVerificationResource2 = new VastVerificationResource ('https://something.test.js', 'unity', false, 'Verifications');
                // const vastAdVerificton1: VastAdVerification = new VastAdVerification('iabtechlab.com-omid', [vastVerificationResource1]);
                // const vastAdVerificton2: VastAdVerification = new VastAdVerification('test.test', [vastVerificationResource2]);
                // const vastXml = SimpleVast;
                // const vastParser = TestFixtures.getVastParserStrict();
                // const parsedVast = vastParser.parseVast(vastXml);
                // const params = TestFixtures.getVastCampaignParams(parsedVast, 3600, '12345');
                // const campaign = new VastCampaign(params);
                // const request = sinon.createStubInstance(RequestManager);
                // openMeasurement1 = new OpenMeasurement(platform, core, clientInfo, campaign, placement, deviceInfo, request, vastAdVerificton1.getVerificationVendor(), vastAdVerificton1);
                // openMeasurement2 = new OpenMeasurement(platform, core, clientInfo, campaign, placement, deviceInfo, request, vastAdVerificton2.getVerificationVendor(), vastAdVerificton2);
                // sinon.stub(Date, 'now').returns(123);
                // sinon.stub(openMeasurement1, 'getOMAdSessionId').returns('456');
                // sinon.stub(openMeasurement2, 'getOMAdSessionId').returns('456');
                // omManager = initOMManager([openMeasurement1, openMeasurement2]);
            });

            // afterEach(() => {
            //     sandbox.restore();
            // });

            it('should be called with correct data', () => {
                const vastXml = SimpleVast;
                const vastParser = TestFixtures.getVastParserStrict();
                const parsedVast = vastParser.parseVast(vastXml);
                const params = TestFixtures.getVastCampaignParams(parsedVast, 3600, '12345');
                const campaign = new VastCampaign(params);
                const request = sinon.createStubInstance(RequestManager);
                openMeasurement1 = new OpenMeasurement(platform, core, clientInfo, campaign, placement, deviceInfo, request, vastAdVerificton1.getVerificationVendor(), vastAdVerificton1);
                openMeasurement2 = new OpenMeasurement(platform, core, clientInfo, campaign, placement, deviceInfo, request, vastAdVerificton2.getVerificationVendor(), vastAdVerificton2);
                sinon.stub(Date, 'now').returns(123);
                sinon.stub(openMeasurement1, 'getOMAdSessionId').returns('456');
                sinon.stub(openMeasurement2, 'getOMAdSessionId').returns('456');
                omManager = initOMManager([openMeasurement1, openMeasurement2]);

                const contextData: IContext = {
                    apiVersion: OMID_P,                                   // Version code of official OMID JS Verification Client API
                    environment: 'app',                                   // OMID JS Verification Client API
                    accessMode: AccessMode.LIMITED,                       // Verification code is executed in a sandbox with only indirect information about ad
                    adSessionType: AdSessionType.NATIVE,                  // Needed to be native for IAS for some reason
                    omidNativeInfo: {
                        partnerName: PARTNER_NAME,
                        partnerVersion: '2.0.0-alpha2'
                    },
                    omidJsInfo: {
                        omidImplementer: PARTNER_NAME,
                        serviceVersion: TestFixtures.getClientInfo().getSdkVersionName(),
                        sessionClientVersion: OMID_P,
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
                        verificationParameters: null,
                        vendorkey: 'iabtechlab.com-omid',
                        context: contextData
                    }
                };
                const event2: ISessionEvent = {
                    adSessionId: '456',
                    timestamp: 123,
                    type: 'sessionStart',
                    data: {
                        verificationParameters: null,
                        vendorkey: 'test.test',
                        context: contextData
                    }
                };

                sinon.stub(openMeasurement1, 'sessionStart');
                sinon.stub(openMeasurement2, 'sessionStart');
                omManager.sessionStart();

                // assert.equal((<sinon.SinonStub>openMeasurement1.sessionStart).getCall(0).args[0].data.vendorkey, 'iabtechlab.com-omid');
                // assert.equal((<sinon.SinonStub>openMeasurement2.sessionStart).getCall(0).args[0].data.vendorkey, 'test.test');
                // sinon.stub(openMeasurement1, 'getVastVerification').returns(vastAdVerificton1);
                // sinon.stub(openMeasurement2, 'getVastVerification').returns(vastAdVerificton2);
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement2.sessionStart, event2);
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement1.sessionStart, event1);

                // return setTimeout(() => {
                    // console.log('booayashdlfasjdlfka yay ^_^');
                // }, 1);
                // sinon.assert.calledWith(<sinon.SinonStub>openMeasurement1.sessionStart, event1);

                // sinon.assert.calledWith(<sinon.SinonStub>openMeasurement2.sessionStart, event2);
                // sinon.assert.calledOnce(<sinon.SinonStub>openMeasurement1.sessionStart);
                // sinon.assert.calledOnce(<sinon.SinonStub>openMeasurement2.sessionStart);
            });
        });
    });
});
