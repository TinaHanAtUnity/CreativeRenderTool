import { AdUnitTracker } from 'Ads/Managers/AdUnitTracker';
import { LoadApi, LoadApiMock } from 'Core/Native/__mocks__/LoadApi';
import { TrackableRefreshManager } from 'Ads/Managers/TrackableRefreshManager';
import { RefreshManager } from 'Ads/Managers/__mocks__/RefreshManager';
import { AdUnitTracking } from 'Ads/Utilities/ProgrammaticTrackingService';
import { MockPTS } from 'Ads/Utilities/__mocks__/ProgrammaticTrackingService';
import { ListenerApi, ListenerMock } from 'Ads/Native/__mocks__/Listener';

import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';

describe('AdUnitTracker', () => {
    let adUnitTracker: AdUnitTracker;
    let loadApi: LoadApiMock;
    let listenerApi: ListenerMock;
    let trackableRefreshManager: TrackableRefreshManager;

    beforeEach(() => {
        MockPTS();
        loadApi = LoadApi();
        listenerApi = ListenerApi();
        trackableRefreshManager = new TrackableRefreshManager();
        trackableRefreshManager.setRefreshManager(RefreshManager());
        adUnitTracker = new AdUnitTracker('admob', loadApi, listenerApi, trackableRefreshManager, pts);
    });

    describe('when request load for a placement one time', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
        });

        it('should not send any events', () => {
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledTimes(1);
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.InitialLoadRequest, [undefined]);
        });
    });

    [2, 5, 10].forEach((times) => {
        describe(`when request load for a placement more then ${times} time`, () => {
            beforeEach(() => {
                for (let i = 0; i < times; i++) {
                    loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
                }
            });

            it('should send metric events', () => {
                expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledTimes(times);
                expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenNthCalledWith(1, AdUnitTracking.InitialLoadRequest, [undefined]);
                for (let i = 2; i <= times; i++) {
                    expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenNthCalledWith(i, AdUnitTracking.DuplicateLoadForPlacement, [undefined]);
                }
            });
        });
    });

    describe('when request load for a filled placement', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', '', 'READY');
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
        });

        it('should send metric events', () => {
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledTimes(2);
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.InitialLoadRequest, [undefined]);
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.PossibleDuplicateLoadForPlacement, [undefined]);
        });
    });

    describe('setting new ad unit should reset state', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            trackableRefreshManager.onAdUnitChanged.trigger('placementId');
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
        });

        it('should not send metric events', () => {
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledTimes(3);
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenNthCalledWith(1, AdUnitTracking.InitialLoadRequest, [undefined]);
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenNthCalledWith(2, AdUnitTracking.AttemptToShowAd, [undefined]);
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenNthCalledWith(3, AdUnitTracking.InitialLoadRequest, [undefined]);
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).not.toBeCalledWith(AdUnitTracking.DuplicateLoadForPlacement, [undefined]);
        });
    });

    [
        'DISABLED',
        'NOT_AVAILABLE',
        'NO_FILL'
    ].forEach((nextState) => {
        describe(`setting following ${nextState} state should reset`, () => {
            beforeEach(() => {
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
                listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', '', nextState);
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            });

            it('should not send metric events', () => {
                expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledTimes(2);
                expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenNthCalledWith(1, AdUnitTracking.InitialLoadRequest, [undefined]);
                expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenNthCalledWith(2, AdUnitTracking.InitialLoadRequest, [undefined]);
                expect(ProgrammaticTrackingService.reportMetricEventWithTags).not.toBeCalledWith(AdUnitTracking.DuplicateLoadForPlacement, [undefined]);
            });
        });
    });

    [
        'WAITING'
    ].forEach((nextState) => {
        describe(`setting following ${nextState} state should not reset`, () => {
            beforeEach(() => {
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
                listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', '', nextState);
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            });

            it('should send metric events', () => {
                expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledTimes(2);
                expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.InitialLoadRequest, [undefined]);
                expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.DuplicateLoadForPlacement, [undefined]);
            });
        });
    });

    [
        'READY'
    ].forEach((nextState) => {
        describe(`setting following ${nextState} state should not reset`, () => {
            beforeEach(() => {
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
                listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', '', nextState);
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            });

            it('should send metric events', () => {
                expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledTimes(2);
                expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.InitialLoadRequest, [undefined]);
                expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.PossibleDuplicateLoadForPlacement, [undefined]);
            });
        });
    });

    describe('successfully invalidation', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', '', 'READY');
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', '', 'WAITING');
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', '', 'READY');
            trackableRefreshManager.onAdUnitChanged.trigger('placementId');
        });

        it('should send metric events', () => {
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledTimes(2);
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenNthCalledWith(1, AdUnitTracking.InitialLoadRequest, [undefined]);
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenNthCalledWith(2, AdUnitTracking.AttemptToShowAd, [undefined]);
        });
    });

    describe('failed invalidation', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', '', 'READY');
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', '', 'NO_FILL');
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
        });

        it('should send metric events', () => {
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toBeCalledTimes(3);
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenNthCalledWith(1, AdUnitTracking.InitialLoadRequest, [undefined]);
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenNthCalledWith(2, AdUnitTracking.FailedToInvalidate, [undefined]);
            expect(ProgrammaticTrackingService.reportMetricEventWithTags).toHaveBeenNthCalledWith(3, AdUnitTracking.InitialLoadRequest, [undefined]);
        });
    });
});
