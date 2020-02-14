import { ListenerApi, ListenerMock } from 'Ads/Native/__mocks__/Listener';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { LoadApi, LoadApiMock } from 'Core/Native/__mocks__/LoadApi';
import { MediationLoadTrackingManager } from 'Ads/Managers/MediationLoadTrackingManager';
import { PlacementState } from 'Ads/Models/Placement';

describe('MediationLoadTrackingManager', () => {
    let medLoadTrackingManager: MediationLoadTrackingManager;
    let loadApi: LoadApiMock;
    let listenerApi: ListenerMock;

    beforeEach(() => {
        loadApi = LoadApi();
        listenerApi = ListenerApi();
        medLoadTrackingManager = new MediationLoadTrackingManager(loadApi, listenerApi, 'fakeMed', false);
    });

    describe('when request load for a placement one time', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1 });
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', 'NOT_AVAILABLE', 'READY');
        });

        it('should send event', () => {
            expect(ProgrammaticTrackingService.reportTimingEventWithTags).toBeCalledTimes(1);
        });
    });
});
