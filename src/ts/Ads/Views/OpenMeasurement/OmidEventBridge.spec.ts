import { OMIDEventBridge, IOMIDEventHandler } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { Core } from 'Core/__mocks__/Core';
import { AdMobCampaign } from 'AdMob/Models/__mocks__/AdMobCampaign';
import { OpenMeasurementMock, OpenMeasurement } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurement';

describe('OmidEventBridge', () => {

    let omidEventBridge: OMIDEventBridge;
    let handler: IOMIDEventHandler;

    let omInstance: OpenMeasurementMock;

    const iframe: HTMLIFrameElement = document.createElement('iframe');
    Object.defineProperty(iframe, 'contentWindow', {
        value: {
            postMessage: jest.fn()
        }
    });

    beforeEach(() => {
        handler = {
            onEventProcessed: jest.fn()
        };

        const core = new Core();
        const campaign = new AdMobCampaign();

        omInstance = new OpenMeasurement();
        jest.spyOn(Date, 'now').mockImplementation(() => 1000);

        omidEventBridge = new OMIDEventBridge(core.Api, handler, iframe, omInstance, campaign);
    });

    describe('when triggering admob impression event', () => {
        it('should send postmessage event', () => {
            omidEventBridge.onEventRegistered('omidImpression', 'test', '1');
            omidEventBridge.triggerVideoEvent('omidImpression');

            // tslint:disable-next-line
            expect(iframe.contentWindow!.postMessage).toHaveBeenCalledWith({'adSessionId': '', 'payload': undefined, 'timestamp': 1000, 'type': 'omidImpression', 'uuid': '1'}, '*');
        });
    });
});
