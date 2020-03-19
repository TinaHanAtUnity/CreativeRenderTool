import { ListenerApi, ListenerMock } from 'Ads/Native/__mocks__/Listener';
import { SDKMetrics, MediationMetric } from 'Ads/Utilities/SDKMetrics';
import { LoadApi, LoadApiMock } from 'Core/Native/__mocks__/LoadApi';
import { MediationLoadTrackingManager, MediationExperimentType } from 'Ads/Managers/MediationLoadTrackingManager';

describe('MediationLoadTrackingManager', () => {
    let medLoadTrackingManager: MediationLoadTrackingManager;
    let loadApi: LoadApiMock;
    let listenerApi: ListenerMock;

    beforeEach(() => {
        loadApi = LoadApi();
        listenerApi = ListenerApi();
        medLoadTrackingManager = new MediationLoadTrackingManager(loadApi, listenerApi, 'fakeMed', false, MediationExperimentType.None, undefined);
    });

    describe('current experiment', () => {
        it('should return correct experiment', () => {
            expect(medLoadTrackingManager.getCurrentExperiment()).toEqual(MediationExperimentType.None);
        });
    });

    describe('when request load for a placement one time', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1 });
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', 'NOT_AVAILABLE', 'READY');
        });

        it('should send event', () => {
            expect(SDKMetrics.reportTimingEventWithTags).toBeCalledTimes(1);
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

        it('should report metric event with tags three times', () => {
            expect(SDKMetrics.reportMetricEventWithTags).toBeCalledTimes(3);
        });

        it('should not report timing events', () => {
            expect(SDKMetrics.reportTimingEventWithTags).not.toBeCalled();
        });
    });

    describe('with load calls before init', () => {
        beforeEach(() => {
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 6, 'placementId2':  1 });
            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId2': 1 });
        });

        it('should only log two new active load requests', () => {
            expect(SDKMetrics.reportMetricEventWithTags).toBeCalledTimes(2);
        });
    });

    describe('initial ad request', () => {
        describe('before init complete', () => {
            beforeEach(() => {
                loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 6 });
            });

            it('iar flag should be set', () => {
                expect(SDKMetrics.reportMetricEventWithTags).toBeCalledWith(MediationMetric.LoadRequest, expect.objectContaining({'iar': 'true'}));
            });

            it('exp flag should be set correctly', () => {
                expect(SDKMetrics.reportMetricEventWithTags).toBeCalledWith(MediationMetric.LoadRequest, expect.objectContaining({'exp': 'none'}));
            });
        });

        [
            { time: 250, expected: { 'iar': 'true' }},
            { time: 251, expected: { 'iar': 'false' }}
        ].forEach(({time, expected}) => {
            describe(`after init complete withing ${time}ms`, () => {
                let windowSpy: jest.SpyInstance;

                beforeEach(() => {
                    windowSpy = jest.spyOn(performance, 'now');
                    windowSpy.mockReturnValue(0);

                    medLoadTrackingManager.setInitComplete();

                    windowSpy.mockReturnValue(time);

                    loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 6 });
                });

                afterEach(() => {
                    windowSpy.mockRestore();
                });

                it('iar flag should be set correctly', () => {
                    expect(SDKMetrics.reportMetricEventWithTags).toBeCalledWith(MediationMetric.LoadRequest, expect.objectContaining(expected));
                });
            });
        });
    });

    describe('using load adapter behavior on fill within 30 seconds', () => {
        let windowSpy: jest.SpyInstance;

        beforeEach(() => {
            windowSpy = jest.spyOn(performance, 'now');
            windowSpy.mockReturnValue(0.01);

            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1 });

            windowSpy.mockReturnValue(1000);

            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', 'NOT_AVAILABLE', 'WAITING');
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', 'NOT_AVAILABLE', 'WAITING');
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', 'WAITING', 'READY');
        });

        afterEach(() => {
            windowSpy.mockRestore();
        });

        it('should report metric event with tags four times', () => {
            expect(SDKMetrics.reportMetricEventWithTags).toBeCalledTimes(1);
        });

        it('should not report timing events', () => {
            expect(SDKMetrics.reportTimingEventWithTags).toBeCalledTimes(1);
            expect(SDKMetrics.reportTimingEventWithTags).toBeCalledWith(expect.anything(), 999.99, expect.anything());
        });
    });

    describe('using load adapter behavior on nofill within 30 seconds', () => {
        let windowSpy: jest.SpyInstance;

        beforeEach(() => {
            windowSpy = jest.spyOn(performance, 'now');
            windowSpy.mockReturnValue(0.01);

            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1 });

            windowSpy.mockReturnValue(1000);

            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', 'NOT_AVAILABLE', 'WAITING');
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', 'NOT_AVAILABLE', 'WAITING');
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', 'WAITING', 'NO_FILL');
        });

        afterEach(() => {
            windowSpy.mockRestore();
        });

        it('should report metric event', () => {
            expect(SDKMetrics.reportMetricEventWithTags).toBeCalledTimes(1);
        });

        it('should report timing event', () => {
            expect(SDKMetrics.reportTimingEventWithTags).toBeCalledTimes(1);
            expect(SDKMetrics.reportTimingEventWithTags).toBeCalledWith(expect.anything(), 999.99, expect.anything());
        });
    });

    describe('using load adapter behavior on fill outside of 30 seconds', () => {
        let windowSpy: jest.SpyInstance;

        beforeEach(() => {
            windowSpy = jest.spyOn(performance, 'now');
            windowSpy.mockReturnValue(0.01);

            loadApi.onLoad.subscribe.mock.calls[0][0]({ 'placementId': 1 });

            windowSpy.mockReturnValue(31000);

            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', 'NOT_AVAILABLE', 'WAITING');
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', 'NOT_AVAILABLE', 'WAITING');
            listenerApi.onPlacementStateChangedEventSent.subscribe.mock.calls[0][0]('placementId', 'WAITING', 'FILL');
        });

        afterEach(() => {
            windowSpy.mockRestore();
        });

        it('should report metric event', () => {
            expect(SDKMetrics.reportMetricEventWithTags).toBeCalledTimes(2);
        });

        it('should report timing event', () => {
            expect(SDKMetrics.reportTimingEventWithTags).toBeCalledTimes(0);
        });
    });

    describe('should report mediation initialization', () => {
        let windowSpy: jest.SpyInstance;

        beforeEach(() => {
            windowSpy = jest.spyOn(performance, 'now');
            windowSpy.mockReturnValue(0.01);
            medLoadTrackingManager.setInitComplete();
        });

        afterEach(() => {
            windowSpy.mockRestore();
        });

        it('should report metric event with tags', () => {
            expect(SDKMetrics.reportTimingEventWithTags).toBeCalledTimes(1);
        });
    });
});
