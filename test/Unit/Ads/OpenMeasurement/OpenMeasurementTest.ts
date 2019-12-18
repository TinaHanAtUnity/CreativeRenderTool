import * as sinon from 'sinon';
import { assert } from 'chai';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Backend } from 'Backend/Backend';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Placement } from 'Ads/Models/Placement';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { RequestManager } from 'Core/Managers/RequestManager';
import { VastAdVerification } from 'VAST/Models/VastAdVerification';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';
import OMID3p from 'html/omid/omid3p.html';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { ISessionEvent } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Campaign } from 'Ads/Models/Campaign';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} OpenMeasurementTest`, () => {
        const sandbox = sinon.createSandbox();
        let om: OpenMeasurement<Campaign>;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let clientInformation: ClientInfo;
        let campaign: VastCampaign;
        let placement: Placement;
        let deviceInfo: DeviceInfo;
        let request: RequestManager;
        let clock: sinon.SinonFakeTimers;

        const initWithVastVerifications = (verifications?: VastAdVerification[]) => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            clientInformation = TestFixtures.getClientInfo(platform);
            campaign = TestFixtures.getAdVerificationsVastCampaign();
            placement = TestFixtures.getPlacement();
            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            } else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            const pts = sinon.createStubInstance(ProgrammaticTrackingService);

            request = sinon.createStubInstance(RequestManager);
            if (verifications) {
                return new OpenMeasurement<VastCampaign>(platform, core, clientInformation, campaign, placement, deviceInfo, request, 'test', pts, verifications[0]);
            } else {
                const verification = campaign.getVast().getAdVerifications()[0];
                return new OpenMeasurement<VastCampaign>(platform, core, clientInformation, campaign, placement, deviceInfo, request, 'test', pts, verification);
            }
        };

        describe('For VAST creatives', () => {

            afterEach(() => {
                sandbox.restore();
            });

            describe('rendering', () => {
                beforeEach(() => {
                    om = initWithVastVerifications();
                });

                it('should populate the omid-iframe with omid3p container code', () => {
                    om.render();
                    assert.equal((<HTMLIFrameElement>om.container().querySelector('#omid-iframe' + om.getOMAdSessionId())).srcdoc, OMID3p.replace('{{ DEFAULT_KEY_ }}', 'default_key'));
                });

                it('should not call the remove child function if om does not exist in dom', () => {
                    om.render();
                    om.removeFromViewHieararchy();
                    sinon.stub(document.body, 'removeChild');
                    sinon.assert.notCalled(<sinon.SinonSpy>document.body.removeChild);
                });

                afterEach(() => {
                    om.removeMessageListener();
                });
            });

            describe('injecting dom resources', () => {
                describe('on success', () => {
                    const resource1 = new VastVerificationResource('http://url1.js', 'test1');
                    const resource2 = new VastVerificationResource('http://url2.js', 'test2');
                    const vastAdVerification1 = new VastAdVerification('vendorkey1', [resource1], '', '');
                    const vastAdVerification2 = new VastAdVerification('vendorkey2', [resource2], '', '');
                    const vastAdVerifications = [vastAdVerification1, vastAdVerification2];

                    beforeEach(() => {
                        om = initWithVastVerifications(vastAdVerifications);
                        om.render();
                        om.addMessageListener();
                        sinon.stub(om, 'populateVendorKey');
                        sinon.stub(om, 'injectAsString');
                        return om.injectAdVerifications();
                    });

                    afterEach(() => {
                        om.removeMessageListener();
                    });

                    // now we use iframes for multiple scripts
                    it('should populate script to dom with one passed resource', () => {
                        // need a more reliable way to check the dom
                        sinon.assert.calledOnce(<sinon.SinonStub>om.injectAsString);
                        sinon.assert.calledOnce(<sinon.SinonStub>om.populateVendorKey);
                    });
                });

                describe('on failure', () => {
                    describe('VERIFICATION_NOT_SUPPORTED', () => {
                        const resource1 = new VastVerificationResource('http://url1.html', 'test1');
                        const verificationResources = [resource1];
                        const vastAdVerification = new VastAdVerification('vendorkey1', verificationResources, '', 'https://ade.googlesyndication.com/errorcode=%5BREASON%5D');
                        const vastAdVerifications = [vastAdVerification];

                        beforeEach(() => {
                            om = initWithVastVerifications(vastAdVerifications);
                            om.render();
                            om.addMessageListener();
                            om.injectAdVerifications();
                        });

                        afterEach(() => {
                            om.removeMessageListener();
                        });

                        it('should error with VERIFICATION_NOT_SUPPORTED when resource is not a js file', () => {
                            sinon.assert.calledWith(<sinon.SinonSpy>request.get, 'https://ade.googlesyndication.com/errorcode=2');
                        });
                    });

                    describe('ERROR_RESOURCE_LOADING', () => {
                        const resource1 = new VastVerificationResource('htt://url1.js', 'test1');
                        const verificationResources = [resource1];
                        const vastAdVerification = new VastAdVerification('vendorkey1', verificationResources, '', 'https://ade.googlesyndication.com/errorcode=%5BREASON%5D');
                        const vastAdVerifications = [vastAdVerification];

                        beforeEach(() => {
                            om = initWithVastVerifications(vastAdVerifications);
                            om.render();
                            om.addMessageListener();
                            om.injectAdVerifications();
                        });

                        afterEach(() => {
                            om.removeMessageListener();
                        });

                        it('should error with ERROR_RESOURCE_LOADING when resource is invalid url', () => {
                            sinon.assert.calledWith(<sinon.SinonSpy>request.get, 'https://ade.googlesyndication.com/errorcode=3');
                        });
                    });
                });
            });

            describe('SessionEvents not on OMBridge', () => {
                describe('when calling session start directly', () => {
                    beforeEach(() => {
                        sandbox.stub(Date, 'now').returns(1);
                        sandbox.stub(om, 'getOMAdSessionId').returns('10');
                        sandbox.stub(om.getOmidBridge(), 'triggerSessionEvent');
                    });

                    it('should use session event admob path when data is passed', () => {
                        const sessionEvent: ISessionEvent = {
                            adSessionId: 'ID',
                            timestamp: 111,
                            type: 'sessionStart',
                            data: {}
                        };
                        om.sessionStart(sessionEvent);
                        sinon.assert.calledWith(<sinon.SinonStub>om.getOmidBridge().triggerSessionEvent, sessionEvent);
                        assert.deepEqual(JSON.stringify((<sinon.SinonStub>om.getOmidBridge().triggerSessionEvent).getCall(0).args[0]), JSON.stringify(sessionEvent));
                        assert.equal((<sinon.SinonStub>om.getOmidBridge().triggerSessionEvent).getCall(0).args[0].data.vendorkey, sessionEvent.data.vendorkey);
                    });

                    it('should construct vast event data when no data is passed', () => {
                        const constructedEventIOS = {'adSessionId': '10', 'timestamp': 1, 'type': 'sessionStart', 'data': {'context': {'apiVersion': 'Unity3d/1.2.10', 'environment': 'app', 'accessMode': 'limited', 'adSessionType': 'native', 'omidNativeInfo': {'partnerName': 'Unity3d', 'partnerVersion': '2.0.0-alpha2'}, 'omidJsInfo': {'omidImplementer': 'Unity3d', 'serviceVersion': '2.0.0-alpha2', 'sessionClientVersion': 'Unity3d/1.2.10', 'partnerName': 'Unity3d', 'partnerVersion': '2.0.0-alpha2'}, 'app': {'libraryVersion': '1.2.10', 'appId': 'com.unity3d.ads.example'}, 'deviceInfo': {'deviceType': 'TestModel', 'os': 'ios', 'osVersion': '1.0'}, 'supports': ['vlid', 'clid']}, 'vendorkey': 'test'}};
                        const constructedEventAndroid = {'adSessionId': '10', 'timestamp': 1, 'type': 'sessionStart', 'data': {'context': {'apiVersion': 'Unity3d/1.2.10', 'environment': 'app', 'accessMode': 'limited', 'adSessionType': 'native', 'omidNativeInfo': {'partnerName': 'Unity3d', 'partnerVersion': '2.0.0-alpha2'}, 'omidJsInfo': {'omidImplementer': 'Unity3d', 'serviceVersion': '2.0.0-alpha2', 'sessionClientVersion': 'Unity3d/1.2.10', 'partnerName': 'Unity3d', 'partnerVersion': '2.0.0-alpha2'}, 'app': {'libraryVersion': '1.2.10', 'appId': 'com.unity3d.ads.example'}, 'deviceInfo': {'deviceType': 'TestModel', 'os': 'android', 'osVersion': '1.0'}, 'supports': ['vlid', 'clid']}, 'vendorkey': 'test'}};

                        om.sessionStart(undefined);
                        sinon.assert.called(<sinon.SinonStub>om.getOmidBridge().triggerSessionEvent);
                        if (platform === Platform.IOS) {
                            assert.deepEqual(JSON.stringify((<sinon.SinonStub>om.getOmidBridge().triggerSessionEvent).getCall(0).args[0]), JSON.stringify(constructedEventIOS));
                        } else {
                            assert.deepEqual(JSON.stringify((<sinon.SinonStub>om.getOmidBridge().triggerSessionEvent).getCall(0).args[0]), JSON.stringify(constructedEventAndroid));
                        }
                    });
                });

                describe('onEventProcessed', () => {
                    context('sessionStart', () => {
                        beforeEach(() => {
                            om = initWithVastVerifications();
                            const omAdViewBuilder = sandbox.createStubInstance(OpenMeasurementAdViewBuilder);
                            om.setOMAdViewBuilder(omAdViewBuilder);

                            sinon.stub(deviceInfo, 'getScreenWidth').resolves(1280);
                            sinon.stub(deviceInfo, 'getScreenHeight').resolves(768);
                            sandbox.stub(om, 'loaded');
                            sandbox.stub(om, 'geometryChange');
                            sandbox.stub(om, 'impression');

                            clock = sinon.useFakeTimers();
                        });

                        it('should call session start ad events', () => {
                            return om.onEventProcessed('sessionStart').then(() => {
                                sinon.assert.called(<sinon.SinonSpy>om.loaded);
                                sinon.assert.called(<sinon.SinonSpy>om.impression);
                                sinon.assert.notCalled(<sinon.SinonSpy>om.geometryChange);
                            });
                        });

                        it('should call session begin ad events for IAS', () => {
                            return om.onEventProcessed('sessionStart', 'IAS').then(() => {
                                clock.tick(1000);
                                clock.restore();
                                sinon.assert.called(<sinon.SinonSpy>om.impression);
                                sinon.assert.called(<sinon.SinonSpy>om.loaded);
                                sinon.assert.calledWith(<sinon.SinonSpy>om.geometryChange);
                            });
                        });
                    });

                    context('sessionFinish', () => {
                        beforeEach(() => {
                            sinon.stub(om, 'removeFromViewHieararchy');
                            clock = sinon.useFakeTimers();
                        });
                        it('should remove OM from dom on sessionFinish', () => {

                            om.onEventProcessed('sessionFinish');
                            clock.tick(1000);
                            clock.restore();
                            sinon.assert.called(<sinon.SinonSpy>om.removeFromViewHieararchy);
                        });
                    });
                });
            });
        });
    });
});
