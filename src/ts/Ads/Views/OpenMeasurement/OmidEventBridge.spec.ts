import { OMIDEventBridge, IOMIDEventHandler } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { Core } from 'Core/__mocks__/Core';
import { AdMobCampaign } from 'AdMob/Models/__mocks__/AdMobCampaign';
import { ProgrammaticTrackingService, ProgrammaticTrackingServiceMock } from 'Ads/Utilities/__mocks__/ProgrammaticTrackingService';
import { OpenMeasurementMockVast, OpenMeasurementVast } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurement';

describe('OmidEventBridge', () => {

    let omidEventBridge: OMIDEventBridge;
    let handler: IOMIDEventHandler;

    let omInstance: OpenMeasurementMockVast;
    let pts: ProgrammaticTrackingServiceMock;

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

        pts = new ProgrammaticTrackingService();
        omInstance = new OpenMeasurementVast();
        jest.spyOn(Date, 'now').mockImplementation(() => 1000);

        omidEventBridge = new OMIDEventBridge(core.Api, handler, iframe, omInstance, campaign, pts);
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
