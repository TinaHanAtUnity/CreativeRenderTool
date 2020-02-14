import { ListenerApi, ListenerMock } from 'Ads/Native/__mocks__/Listener';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { LoadApi, LoadApiMock } from 'Core/Native/__mocks__/LoadApi';
import { MediationLoadTrackingManager } from 'Ads/Managers/MediationLoadTrackingManager';

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

    describe('should send timeout', () => {
        let windowSpy: jest.SpyInstance;

        beforeEach(() => {
            windowSpy = jest.spyOn(performance, 'now');
            windowSpy.mockReturnValue(0.01);

            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1 });
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId2': 1 });

            windowSpy.mockReturnValue(31000.01);

            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', 'NOT_AVAILABLE', 'READY');
        });

        afterEach(() => {
            windowSpy.mockRestore();
        });

        it('should send event', () => {
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledTimes(2);
            expect(ProgrammaticTrackingService.reportTimingEventWithTags).toBeCalledTimes(0);
        });
    });
});
