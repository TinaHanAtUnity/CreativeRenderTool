import { AdUnitTracker } from 'Ads/Managers/AdUnitTracker';
import { LoadApi, LoadApiMock } from 'Core/Native/__mocks__/LoadApi';
import { TrackableRefreshManager } from 'Ads/Managers/TrackableRefreshManager';
import { RefreshManager } from 'Ads/Managers/__mocks__/RefreshManager';
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
            expect(pts.reportMetricEventWithTags).not.toBeCalled();
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
                expect(pts.reportMetricEventWithTags).toBeCalledTimes(times - 1);
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
            expect(pts.reportMetricEventWithTags).toBeCalledTimes(1);
        });
    });

    describe('setting new ad unit should reset state', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            trackableRefreshManager.onAdUnitChanged.trigger('placementId');
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
        });

        it('should not send metric events', () => {
            expect(pts.reportMetricEventWithTags).not.toBeCalled();
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
                expect(pts.reportMetricEventWithTags).not.toBeCalled();
            });
        });
    });

    [
        PlacementState.READY,
        PlacementState.WAITING
    ].forEach((nextState) => {
        describe(`setting following ${PlacementState[nextState]} state should not reset`, () => {
            beforeEach(() => {
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
                trackableRefreshManager.onPlacementStateChanged.trigger('placementId', nextState);
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1});
            });

            it('should send metric events', () => {
                expect(pts.reportMetricEventWithTags).toBeCalled();
            });
        });
    });
});
