import * as sinon from 'sinon';
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
import { OMIDEventBridge, IOMIDEventHandler, EventQueuePostbackEvents } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { OMID3pEvents } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { assert } from 'chai';
import { Campaign } from 'Ads/Models/Campaign';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    const sandbox = sinon.createSandbox();
    let omInstance: OpenMeasurement<Campaign>;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let clientInformation: ClientInfo;
    let campaign: VastCampaign;
    let placement: Placement;
    let deviceInfo: DeviceInfo;
    let request: RequestManager;
    let iframe: HTMLIFrameElement;
    let handler: IOMIDEventHandler;
    let omidEventBridge: OMIDEventBridge;

    describe(`${platform} OMIDEventBridge`, () => {

        beforeEach(() => {
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

            omInstance = sinon.createStubInstance(OpenMeasurement);
            request = sinon.createStubInstance(RequestManager);

            iframe = sinon.createStubInstance(HTMLIFrameElement);
            Object.defineProperty(iframe, 'contentWindow', {
                value: {
                    postMessage: sinon.spy()
                }
            });

            handler =  {
                onEventProcessed: sinon.spy()
            };

            sandbox.stub(Date, 'now').returns(111);
            omidEventBridge = new OMIDEventBridge(core, handler, iframe, omInstance, campaign);
            omidEventBridge.connect();
        });

        afterEach(() => {
            omidEventBridge.disconnect();
            sandbox.restore();
        });

        const sendEvent = (e: string, data?: any) => {
            return () => {
                return new Promise((res) => {
                    window.postMessage({
                        type: 'omid',
                        event: e,
                        data: data
                    }, '*');
                    setTimeout(res);
                });
            };
        };

        describe('receiving OMID events', () => {
            const tests = [
                {
                    event: OMID3pEvents.ON_EVENT_PROCESSED,
                    data: {
                        eventType: 'sessionStart',
                        vendorKey: 'test-vendor-key'
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onEventProcessed, data.eventType, data.vendorKey)
                }
            ];
            for (const test of tests) {
                describe(`${test.event} OMID event`, () => {
                    beforeEach(sendEvent(test.event, test.data));
                    it(`should handle the ${test.event} event`, () => {
                        test.verify(test.data);
                    });
                });
            }
        });

        describe('onEventRegistered', () => {
            let pmStub: sinon.SinonSpy;

            beforeEach(() => {
                pmStub = (<sinon.SinonSpy>iframe.contentWindow!.postMessage);
            });

            it('should not send events if no event has been stored in history', () => {
                omidEventBridge.onEventRegistered('omidVideo', 'test', '1');
                sinon.assert.notCalled(pmStub);
            });

            it('should send omidGeometry change event when it has been stored in history', () => {
                omidEventBridge.triggerAdEvent('omidGeometryChange');
                omidEventBridge.onEventRegistered('omidGeometryChange', 'test', '1');
                sinon.assert.calledWith(pmStub, {
                    adSessionId: undefined,
                    payload: undefined,
                    timestamp: 111,
                    type: 'omidGeometryChange',
                    uuid: '1'
                });
            });

            it('should send omidGeometryChange event twice when it has been stored in history twice', () => {
                omidEventBridge.triggerAdEvent('omidGeometryChange');
                omidEventBridge.triggerAdEvent('omidGeometryChange');
                omidEventBridge.onEventRegistered('omidGeometryChange', 'test', '1');
                sinon.assert.calledTwice(pmStub);
            });

            it('should send omidGeometryChange event n timez', () => {
                omidEventBridge.triggerAdEvent('omidGeometryChange');
                omidEventBridge.triggerAdEvent('omidGeometryChange');

                assert.equal((pmStub).getCalls().length, 0);

                omidEventBridge.onEventRegistered('omidGeometryChange', 'test', '1');
                omidEventBridge.triggerAdEvent('omidGeometryChange');

                assert.equal((pmStub).getCalls().length, 3);

                omidEventBridge.onEventRegistered('omidGeometryChange', 'test', '2');
                assert.equal((pmStub).getCalls().length, 6);

                omidEventBridge.triggerAdEvent('omidGeometryChange');
                assert.equal((pmStub).getCalls().length, 8);
            });

            it('should send omidVideo UUID event n timez after registration', () => {
                omidEventBridge.triggerVideoEvent('omidLoaded');
                omidEventBridge.triggerVideoEvent('omidStart');

                assert.equal((pmStub).getCalls().length, 0);

                omidEventBridge.onEventRegistered('omidVideo', 'testvendor', '1');
                omidEventBridge.onEventRegistered('omidGeometryChange', 'testvendor', '2');

                assert.equal((pmStub).getCalls().length, 2);

                assert.equal((pmStub).getCall(0).args[0].type, 'omidLoaded');
                assert.equal((pmStub).getCall(0).args[0].uuid, '1');
                assert.equal((pmStub).getCall(1).args[0].type, 'omidStart');
                assert.equal((pmStub).getCall(1).args[0].uuid, '1');

            });

            it('should send omidVideo UUID event n timez after registration', () => {
                omidEventBridge.onEventRegistered('omidVideo', 'test', '1');

                assert.equal((pmStub).getCalls().length, 0);

                omidEventBridge.triggerVideoEvent('omidLoaded');
                omidEventBridge.triggerVideoEvent('omidStart');

                assert.equal((pmStub).getCalls().length, 2);
            });

            it('should send start event for both video and regular start events based on UUID of registration', () => {
                omidEventBridge.onEventRegistered('omidVideo', 'test', '23');
                omidEventBridge.onEventRegistered('omidStart', 'test', '33');
                sandbox.stub(omidEventBridge, 'postMessage');

                omidEventBridge.triggerVideoEvent('omidStart');
                omidEventBridge.triggerAdEvent('omidGeometryChange');

                assert.equal((JSON.stringify((<sinon.SinonSpy>omidEventBridge.postMessage).getCall(0).args[0])), JSON.stringify({'type': 'omidStart', 'timestamp': 111, 'uuid': '33'}));
                assert.equal((JSON.stringify((<sinon.SinonSpy>omidEventBridge.postMessage).getCall(1).args[0])), JSON.stringify({'type': 'omidStart', 'timestamp': 111, 'uuid': '23'}));
            });
        });
    });
});
