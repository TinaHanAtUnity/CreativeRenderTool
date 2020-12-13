import * as sinon from 'sinon';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { Platform } from 'Core/Constants/Platform';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { RequestManager } from 'Core/Managers/RequestManager';
import { OMIDEventBridge } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { OMID3pEvents } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { assert } from 'chai';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    const sandbox = sinon.createSandbox();
    let omInstance;
    let backend;
    let nativeBridge;
    let core;
    let clientInformation;
    let campaign;
    let placement;
    let deviceInfo;
    let request;
    let iframe;
    let handler;
    let omidEventBridge;
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
            }
            else {
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
            Object.defineProperty(iframe, 'id', { value: 'iframeId' });
            handler = {
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
        const sendEvent = (e, data) => {
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
                    verify: (data) => sinon.assert.calledWith(handler.onEventProcessed, data.eventType, data.vendorKey)
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
            let pmStub;
            beforeEach(() => {
                pmStub = iframe.contentWindow.postMessage;
            });
            it('should not send events if no event has been stored in history', () => {
                omidEventBridge.onEventRegistered('omidVideo', 'test', '1', 'iframeId');
                sinon.assert.notCalled(pmStub);
            });
            it('should send omidGeometry change event when it has been stored in history', () => {
                omidEventBridge.triggerAdEvent('omidGeometryChange');
                omidEventBridge.onEventRegistered('omidGeometryChange', 'test', '1', 'iframeId');
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
                omidEventBridge.onEventRegistered('omidGeometryChange', 'test', '1', 'iframeId');
                sinon.assert.calledTwice(pmStub);
            });
            it('shoud not send events if iframe id is not right', () => {
                omidEventBridge.triggerAdEvent('omidGeometryChange');
                omidEventBridge.triggerAdEvent('omidGeometryChange');
                omidEventBridge.onEventRegistered('omidGeometryChange', 'test', '1', 'wrongIframeId');
                sinon.assert.notCalled(pmStub);
            });
            it('should send omidGeometryChange event n timez', () => {
                omidEventBridge.triggerAdEvent('omidGeometryChange');
                omidEventBridge.triggerAdEvent('omidGeometryChange');
                assert.equal((pmStub).getCalls().length, 0);
                omidEventBridge.onEventRegistered('omidGeometryChange', 'test', '1', 'iframeId');
                omidEventBridge.triggerAdEvent('omidGeometryChange');
                assert.equal((pmStub).getCalls().length, 3);
                omidEventBridge.onEventRegistered('omidGeometryChange', 'test', '2', 'iframeId');
                assert.equal((pmStub).getCalls().length, 6);
                omidEventBridge.triggerAdEvent('omidGeometryChange');
                assert.equal((pmStub).getCalls().length, 8);
            });
            it('should send omidVideo UUID event n timez after registration', () => {
                omidEventBridge.triggerVideoEvent('omidLoaded');
                omidEventBridge.triggerVideoEvent('omidStart');
                assert.equal((pmStub).getCalls().length, 0);
                omidEventBridge.onEventRegistered('omidVideo', 'testvendor', '1', 'iframeId');
                omidEventBridge.onEventRegistered('omidGeometryChange', 'testvendor', '2', 'iframeId');
                assert.equal((pmStub).getCalls().length, 2);
                assert.equal((pmStub).getCall(0).args[0].type, 'omidLoaded');
                assert.equal((pmStub).getCall(0).args[0].uuid, '1');
                assert.equal((pmStub).getCall(1).args[0].type, 'omidStart');
                assert.equal((pmStub).getCall(1).args[0].uuid, '1');
            });
            it('should send omidVideo UUID event n timez after registration', () => {
                omidEventBridge.onEventRegistered('omidVideo', 'test', '1', 'iframeId');
                assert.equal((pmStub).getCalls().length, 0);
                omidEventBridge.triggerVideoEvent('omidLoaded');
                omidEventBridge.triggerVideoEvent('omidStart');
                assert.equal((pmStub).getCalls().length, 2);
            });
            it('should send start event for both video and regular start events based on UUID of registration', () => {
                omidEventBridge.onEventRegistered('omidVideo', 'test', '23', 'iframeId');
                omidEventBridge.onEventRegistered('omidStart', 'test', '33', 'iframeId');
                sandbox.stub(omidEventBridge, 'postMessage');
                omidEventBridge.triggerVideoEvent('omidStart');
                omidEventBridge.triggerAdEvent('omidGeometryChange');
                assert.equal((JSON.stringify(omidEventBridge.postMessage.getCall(0).args[0])), JSON.stringify({ 'type': 'omidStart', 'timestamp': 111, 'uuid': '33' }));
                assert.equal((JSON.stringify(omidEventBridge.postMessage.getCall(1).args[0])), JSON.stringify({ 'type': 'omidStart', 'timestamp': 111, 'uuid': '23' }));
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT01JREV2ZW50QnJpZGdlVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvT3Blbk1lYXN1cmVtZW50L09NSURFdmVudEJyaWRnZVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFPeEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxlQUFlLEVBQStDLE1BQU0sMkNBQTJDLENBQUM7QUFDekgsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFHOUIsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDaEQsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3RDLElBQUksVUFBcUMsQ0FBQztJQUMxQyxJQUFJLE9BQWdCLENBQUM7SUFDckIsSUFBSSxZQUEwQixDQUFDO0lBQy9CLElBQUksSUFBYyxDQUFDO0lBQ25CLElBQUksaUJBQTZCLENBQUM7SUFDbEMsSUFBSSxRQUFzQixDQUFDO0lBQzNCLElBQUksU0FBb0IsQ0FBQztJQUN6QixJQUFJLFVBQXNCLENBQUM7SUFDM0IsSUFBSSxPQUF1QixDQUFDO0lBQzVCLElBQUksTUFBeUIsQ0FBQztJQUM5QixJQUFJLE9BQTBCLENBQUM7SUFDL0IsSUFBSSxlQUFnQyxDQUFDO0lBRXJDLFFBQVEsQ0FBQyxHQUFHLFFBQVEsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1FBRXpDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1QyxZQUFZLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0QsSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDN0MsaUJBQWlCLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6RCxRQUFRLEdBQUcsWUFBWSxDQUFDLDhCQUE4QixFQUFFLENBQUM7WUFDekQsU0FBUyxHQUFHLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN4QyxJQUFJLFFBQVEsS0FBSyxRQUFRLENBQUMsT0FBTyxFQUFFO2dCQUMvQixVQUFVLEdBQUcsWUFBWSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3hEO2lCQUFNO2dCQUNILFVBQVUsR0FBRyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDcEQ7WUFFRCxVQUFVLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFbkQsTUFBTSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRTtnQkFDM0MsS0FBSyxFQUFFO29CQUNILFdBQVcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO2lCQUMzQjthQUNKLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBRTNELE9BQU8sR0FBRztnQkFDTixnQkFBZ0IsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO2FBQ2hDLENBQUM7WUFFRixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdkMsZUFBZSxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNuRixlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ1gsZUFBZSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBUyxFQUFFLElBQVUsRUFBRSxFQUFFO1lBQ3hDLE9BQU8sR0FBRyxFQUFFO2dCQUNSLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDdkIsTUFBTSxDQUFDLFdBQVcsQ0FBQzt3QkFDZixJQUFJLEVBQUUsTUFBTTt3QkFDWixLQUFLLEVBQUUsQ0FBQzt3QkFDUixJQUFJLEVBQUUsSUFBSTtxQkFDYixFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNSLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDcEIsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUM7UUFDTixDQUFDLENBQUM7UUFFRixRQUFRLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1lBQ25DLE1BQU0sS0FBSyxHQUFHO2dCQUNWO29CQUNJLEtBQUssRUFBRSxZQUFZLENBQUMsa0JBQWtCO29CQUN0QyxJQUFJLEVBQUU7d0JBQ0YsU0FBUyxFQUFFLGNBQWM7d0JBQ3pCLFNBQVMsRUFBRSxpQkFBaUI7cUJBQy9CO29CQUNELE1BQU0sRUFBRSxDQUFDLElBQVUsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7aUJBQzVIO2FBQ0osQ0FBQztZQUNGLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN0QixRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxhQUFhLEVBQUUsR0FBRyxFQUFFO29CQUN0QyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzdDLEVBQUUsQ0FBQyxxQkFBcUIsSUFBSSxDQUFDLEtBQUssUUFBUSxFQUFFLEdBQUcsRUFBRTt3QkFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzNCLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2FBQ047UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7WUFDL0IsSUFBSSxNQUFzQixDQUFDO1lBRTNCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osTUFBTSxHQUFvQixNQUFNLENBQUMsYUFBYyxDQUFDLFdBQVksQ0FBQztZQUNqRSxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywrREFBK0QsRUFBRSxHQUFHLEVBQUU7Z0JBQ3JFLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDeEUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsMEVBQTBFLEVBQUUsR0FBRyxFQUFFO2dCQUNoRixlQUFlLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3JELGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUNqRixLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7b0JBQzVCLFdBQVcsRUFBRSxTQUFTO29CQUN0QixPQUFPLEVBQUUsU0FBUztvQkFDbEIsU0FBUyxFQUFFLEdBQUc7b0JBQ2QsSUFBSSxFQUFFLG9CQUFvQjtvQkFDMUIsSUFBSSxFQUFFLEdBQUc7aUJBQ1osQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMscUZBQXFGLEVBQUUsR0FBRyxFQUFFO2dCQUMzRixlQUFlLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3JELGVBQWUsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDckQsZUFBZSxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ2pGLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLGlEQUFpRCxFQUFFLEdBQUcsRUFBRTtnQkFDdkQsZUFBZSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUNyRCxlQUFlLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3JELGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUN0RixLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw4Q0FBOEMsRUFBRSxHQUFHLEVBQUU7Z0JBQ3BELGVBQWUsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDckQsZUFBZSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUVyRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUU1QyxlQUFlLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDakYsZUFBZSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUVyRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUU1QyxlQUFlLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDakYsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFNUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUNyRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDZEQUE2RCxFQUFFLEdBQUcsRUFBRTtnQkFDbkUsZUFBZSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNoRCxlQUFlLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRS9DLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRTVDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDOUUsZUFBZSxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBRXZGLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRTVDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDN0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQzVELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUV4RCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw2REFBNkQsRUFBRSxHQUFHLEVBQUU7Z0JBQ25FLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFFeEUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFNUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNoRCxlQUFlLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRS9DLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsK0ZBQStGLEVBQUUsR0FBRyxFQUFFO2dCQUNyRyxlQUFlLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3pFLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDekUsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBRTdDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDL0MsZUFBZSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUVyRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBa0IsZUFBZSxDQUFDLFdBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzFLLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFrQixlQUFlLENBQUMsV0FBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5SyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9