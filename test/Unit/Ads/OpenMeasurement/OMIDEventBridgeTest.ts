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
import { OMIDEventBridge, IOMIDEventHandler } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { OMID3pEvents } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    const sandbox = sinon.createSandbox();
    let omInstance: OpenMeasurement;
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

            iframe = document.createElement('iframe');
            document.body.appendChild(iframe);

            handler =  {
                onEventProcessed: sinon.spy()
            };

            omidEventBridge = new OMIDEventBridge(core, handler, iframe, omInstance);
            omidEventBridge.connect();
        });

        afterEach(() => {
            document.body.removeChild(iframe);
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
                    it(`should handle the ${test.event} event`, () => test.verify(test.data));
                });
            }
        });
    });
});
