import * as sinon from 'sinon';
import { assert } from 'chai';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { Platform } from 'Core/Constants/Platform';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastAdVerification } from 'VAST/Models/VastAdVerification';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';
import OMID3p from 'html/omid/omid3p.html';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} OpenMeasurementTest`, () => {
        const sandbox = sinon.createSandbox();
        let om;
        let backend;
        let nativeBridge;
        let core;
        let clientInformation;
        let campaign;
        let placement;
        let deviceInfo;
        let clock;
        let thirdPartyEventManager;
        const initWithVastVerifications = (verifications) => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            clientInformation = TestFixtures.getClientInfo(platform);
            campaign = TestFixtures.getAdVerificationsVastCampaign();
            placement = TestFixtures.getPlacement();
            thirdPartyEventManager = sandbox.createStubInstance(ThirdPartyEventManager);
            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            }
            else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
            if (verifications) {
                return new OpenMeasurement(platform, core, clientInformation, campaign, placement, deviceInfo, thirdPartyEventManager, 'test', verifications[0]);
            }
            else {
                const verification = campaign.getVast().getAdVerifications()[0];
                return new OpenMeasurement(platform, core, clientInformation, campaign, placement, deviceInfo, thirdPartyEventManager, 'test', verification);
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
                    const iframe = om.container().querySelector('#omid-iframe' + om.getOMAdSessionId());
                    assert.equal(iframe.srcdoc, OMID3p.replace('{{ DEFAULT_KEY_ }}', 'default_key').replace('{{ IFRAME_ID_ }}', iframe.id));
                });
                it('should not call the remove child function if om does not exist in dom', () => {
                    om.render();
                    om.removeFromViewHieararchy();
                    sinon.stub(document.body, 'removeChild');
                    sinon.assert.notCalled(document.body.removeChild);
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
                        sinon.assert.calledOnce(om.injectAsString);
                        sinon.assert.calledOnce(om.populateVendorKey);
                    });
                });
                describe('on failure', () => {
                    describe('VERIFICATION_RESOURCE_REJECTED', () => {
                        const resource1 = new VastVerificationResource('http://url1.js', 'test1');
                        const verificationResources = [resource1];
                        const vastAdVerification = new VastAdVerification('vendorkey1', verificationResources, '', 'https://ade.googlesyndication.com/errorcode=%5BREASON%5D');
                        const vastAdVerifications = [vastAdVerification];
                        beforeEach(() => {
                            sandbox.stub(CustomFeatures, 'isUnsupportedOMVendor').returns(true);
                            sandbox.stub(Date.prototype, 'toISOString').returns('2020-02-06T23:45:18.458Z');
                            om = initWithVastVerifications(vastAdVerifications);
                            om.render();
                            om.addMessageListener();
                            om.injectAdVerifications();
                        });
                        afterEach(() => {
                            om.removeMessageListener();
                        });
                        it('should error with VERIFICATION_RESOURCE_REJECTED when resource is not a js file and replace OMIDPARTNER,OMIDPARTNER,OMIDPARTNER macros', () => {
                            sinon.assert.calledWith(thirdPartyEventManager.sendWithGet, 'adVerificationErrorEvent', '12345', 'https://ade.googlesyndication.com/errorcode=%5BREASON%5D', undefined, undefined, { '%5BREASON%5D': '1' });
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
                            sinon.assert.calledWith(thirdPartyEventManager.sendWithGet, 'adVerificationErrorEvent', '12345', 'https://ade.googlesyndication.com/errorcode=%5BREASON%5D', undefined, undefined, { '%5BREASON%5D': '3' });
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
                        const sessionEvent = {
                            adSessionId: 'ID',
                            timestamp: 111,
                            type: 'sessionStart',
                            data: {}
                        };
                        om.sessionStart(sessionEvent);
                        sinon.assert.calledWith(om.getOmidBridge().triggerSessionEvent, sessionEvent);
                        assert.deepEqual(JSON.stringify(om.getOmidBridge().triggerSessionEvent.getCall(0).args[0]), JSON.stringify(sessionEvent));
                        assert.equal(om.getOmidBridge().triggerSessionEvent.getCall(0).args[0].data.vendorkey, sessionEvent.data.vendorkey);
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
                            sandbox.stub(om, 'geometryChange');
                            sandbox.stub(om, 'impression');
                            clock = sinon.useFakeTimers();
                        });
                        it('should call session start ad events', () => {
                            return om.onEventProcessed('sessionStart').then(() => {
                                sinon.assert.called(om.impression);
                                sinon.assert.notCalled(om.geometryChange);
                            });
                        });
                        const customGeometryVendors = ['IAS', 'integralads.com-omid'];
                        customGeometryVendors.forEach((vendor) => {
                            it('should call session begin ad events for IAS', () => {
                                return om.onEventProcessed('sessionStart', vendor).then(() => {
                                    clock.tick(1000);
                                    clock.restore();
                                    sinon.assert.called(om.impression);
                                    sinon.assert.called(om.geometryChange);
                                });
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
                            sinon.assert.called(om.removeFromViewHieararchy);
                        });
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3Blbk1lYXN1cmVtZW50VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvT3Blbk1lYXN1cmVtZW50L09wZW5NZWFzdXJlbWVudFRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDNUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQU94RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNoRixPQUFPLE1BQU0sTUFBTSx1QkFBdUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUV0RyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFdEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTdFLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0lBQ2hELFFBQVEsQ0FBQyxHQUFHLFFBQVEsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO1FBQzdDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN0QyxJQUFJLEVBQTZCLENBQUM7UUFDbEMsSUFBSSxPQUFnQixDQUFDO1FBQ3JCLElBQUks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