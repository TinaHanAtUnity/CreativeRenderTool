import { AdUnitTracker } from 'Ads/Managers/AdUnitTracker';
import { LoadApi, LoadApiMock } from 'Core/Native/__mocks__/LoadApi';
import { TrackableRefreshManager } from 'Ads/Managers/TrackableRefreshManager';
import { RefreshManager } from 'Ads/Managers/__mocks__/RefreshManager';
import { AdUnitTracking } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ProgrammaticTrackingService, ProgrammaticTrackingServiceMock } from 'Ads/Utilities/__mocks__/ProgrammaticTrackingService';
import { PlacementState } from 'Ads/Models/Placement';

describe('AdUnitTracker', () => {
    let adUnitTracker: AdUnitTracker;
    let loadApi: LoadApiMock;
    let pts: ProgrammaticTrackingServiceMock;
    let trackableRefreshManager: TrackableRefreshManager;

    beforeEach(() => {
        pts = new ProgrammaticTrackingService();
        loadApi = LoadApi();
        trackableRefreshManager = new TrackableRefreshManager();
        trackableRefreshManager.setRefreshManager(RefreshManager());
        adUnitTracker = new AdUnitTracker('0', 'admob', loadApi, trackableRefreshManager, pts);
    });

    describe('when request load for a placement one time', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
        });

        it('should not send any events', () => {
            expect(pts.reportMetricEventWithTags).toBeCalledTimes(1);
            expect(pts.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.InitialLoadRequest, [undefined]);
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
                expect(pts.reportMetricEventWithTags).toBeCalledTimes(times);
                expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(1, AdUnitTracking.InitialLoadRequest, [undefined]);
                for (let i = 2; i <= times; i++) {
                    expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(i, AdUnitTracking.DuplicateLoadForPlacement, [undefined]);
                }
            });
        });
    });

    describe('when request load for a filled placement', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            trackableRefreshManager.setPlacementState('placementId', PlacementState.READY);
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
        });

        it('should send metric events', () => {
            expect(pts.reportMetricEventWithTags).toBeCalledTimes(2);
            expect(pts.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.InitialLoadRequest, [undefined]);
            expect(pts.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.PossibleDuplicateLoadForPlacement, [undefined]);
        });
    });

    describe('setting new ad unit should reset state', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            trackableRefreshManager.onAdUnitChanged.trigger('placementId');
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
        });

        it('should not send metric events', () => {
            expect(pts.reportMetricEventWithTags).toBeCalledTimes(3);
            expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(1, AdUnitTracking.InitialLoadRequest, [undefined]);
            expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(2, AdUnitTracking.AttemptToShowAd, [undefined]);
            expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(3, AdUnitTracking.InitialLoadRequest, [undefined]);
            expect(pts.reportMetricEventWithTags).not.toBeCalledWith(AdUnitTracking.DuplicateLoadForPlacement, [undefined]);
        });
    });

    [
        PlacementState.DISABLED,
        PlacementState.NOT_AVAILABLE,
        PlacementState.NO_FILL
    ].forEach((nextState) => {
        describe(`setting following ${PlacementState[nextState]} state should reset`, () => {
            beforeEach(() => {
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
                trackableRefreshManager.onPlacementStateChanged.trigger('placementId', nextState);
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            });

            it('should not send metric events', () => {
                expect(pts.reportMetricEventWithTags).toBeCalledTimes(2);
                expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(1, AdUnitTracking.InitialLoadRequest, [undefined]);
                expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(2, AdUnitTracking.InitialLoadRequest, [undefined]);
                expect(pts.reportMetricEventWithTags).not.toBeCalledWith(AdUnitTracking.DuplicateLoadForPlacement, [undefined]);
            });
        });
    });

    [
        PlacementState.WAITING
    ].forEach((nextState) => {
        describe(`setting following ${PlacementState[nextState]} state should not reset`, () => {
            beforeEach(() => {
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
                trackableRefreshManager.onPlacementStateChanged.trigger('placementId', nextState);
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            });

            it('should send metric events', () => {
                expect(pts.reportMetricEventWithTags).toBeCalledTimes(2);
                expect(pts.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.InitialLoadRequest, [undefined]);
                expect(pts.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.DuplicateLoadForPlacement, [undefined]);
            });
        });
    });

    [
        PlacementState.READY
    ].forEach((nextState) => {
        describe(`setting following ${PlacementState[nextState]} state should not reset`, () => {
            beforeEach(() => {
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
                trackableRefreshManager.onPlacementStateChanged.trigger('placementId', nextState);
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            });

            it('should send metric events', () => {
                expect(pts.reportMetricEventWithTags).toBeCalledTimes(2);
                expect(pts.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.InitialLoadRequest, [undefined]);
                expect(pts.reportMetricEventWithTags).toBeCalledWith(AdUnitTracking.PossibleDuplicateLoadForPlacement, [undefined]);
            });
        });
    });

    describe('successfully invalidation', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            trackableRefreshManager.setPlacementState('placementId', PlacementState.READY);
            trackableRefreshManager.setPlacementState('placementId', PlacementState.WAITING);
            trackableRefreshManager.setPlacementState('placementId', PlacementState.READY);
            trackableRefreshManager.onAdUnitChanged.trigger('placementId');
        });

        it('should send metric events', () => {
            expect(pts.reportMetricEventWithTags).toBeCalledTimes(4);
            expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(1, AdUnitTracking.InitialLoadRequest, [undefined]);
            expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(2, AdUnitTracking.AttemptToInvalidate, [undefined]);
            expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(3, AdUnitTracking.SuccessfulInvalidate, [undefined]);
            expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(4, AdUnitTracking.AttemptToShowAd, [undefined]);
        });
    });

    describe('failed invalidation', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            trackableRefreshManager.setPlacementState('placementId', PlacementState.READY);
            trackableRefreshManager.setPlacementState('placementId', PlacementState.WAITING);
            trackableRefreshManager.setPlacementState('placementId', PlacementState.NO_FILL);
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
        });

        it('should send metric events', () => {
            expect(pts.reportMetricEventWithTags).toBeCalledTimes(3);
            expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(1, AdUnitTracking.InitialLoadRequest, [undefined]);
            expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(2, AdUnitTracking.AttemptToInvalidate, [undefined]);
            expect(pts.reportMetricEventWithTags).toHaveBeenNthCalledWith(3, AdUnitTracking.InitialLoadRequest, [undefined]);
        });
    });
});
