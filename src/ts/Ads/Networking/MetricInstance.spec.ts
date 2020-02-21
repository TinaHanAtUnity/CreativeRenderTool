import { RequestManager, RequestManagerMock } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo, ClientInfoMock } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfo, DeviceInfoMock } from 'Core/Models/__mocks__/DeviceInfo';
import { IProgrammaticTrackingData, MetricInstance } from 'Ads/Networking/MetricInstance';
import { AdmobMetric, TimingEvent, InitializationMetric, MediationMetric, BannerMetric } from 'Ads/Utilities/SDKMetrics';
import { Platform } from 'Core/Constants/Platform';

[
    Platform.IOS,
    Platform.ANDROID
].forEach(platform => describe('MetricInstance', () => {

    let clientInfo: ClientInfoMock;
    let deviceInfo: DeviceInfoMock;
    let requestManager: RequestManagerMock;
    const osVersion = '11.2.1';
    const sdkVersion = '2300';
    const country = 'US';

    let metricInstance: MetricInstance;

    beforeEach(() => {
        requestManager = new RequestManager();
        clientInfo = new ClientInfo();
        deviceInfo = new DeviceInfo();
        clientInfo.getTestMode.mockReturnValue(false);
        deviceInfo.getOsVersion.mockReturnValue(osVersion);
        clientInfo.getSdkVersionName.mockReturnValue(sdkVersion);
        metricInstance = new MetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
    });

    describe('createAdsSdkTag', () => {
        const tests: {
            inputSuffix: string;
            inputValue: string;
            expected: string;
        }[] = [{
            inputSuffix: 'blt',
            inputValue: '3.0.0',
            expected: 'ads_sdk2_blt:3.0.0'
        }, {
            inputSuffix: '',
            inputValue: '',
            expected: 'ads_sdk2_:'
        }];

        tests.forEach((t) => {
            it(`should send "${t.expected}" with suffix "${t.inputSuffix}" and value "${t.inputValue}"`, () => {
                const tag = metricInstance.createAdsSdkTag(t.inputSuffix, t.inputValue);
                expect(tag).toEqual(t.expected);
            });
        });
    });

    describe('reportMetricEvent', () => {
        const tests: {
            input: AdmobMetric;
            expected: IProgrammaticTrackingData;
        }[] = [{
            input: AdmobMetric.AdmobUsedCachedVideo,
            expected: {
                metrics: [
                    {
                        name: 'admob_used_cached_video',
                        value: 1,
                        tags: [
                            `ads_sdk2_sdv:${sdkVersion}`,
                            'ads_sdk2_iso:us',
                            `ads_sdk2_plt:${Platform[platform]}`
                        ]
                    }
                ]
            }
        }, {
            input: AdmobMetric.AdmobUsedStreamedVideo,
            expected: {
                metrics: [
                    {
                        name: 'admob_used_streamed_video',
                        value: 1,
                        tags: [
                            `ads_sdk2_sdv:${sdkVersion}`,
                            'ads_sdk2_iso:us',
                            `ads_sdk2_plt:${Platform[platform]}`
                        ]
                    }
                ]
            }
        }];
        tests.forEach((t) => {

            it(`should call post once`, () => {
                metricInstance.reportMetricEvent(t.input);
                const promise = metricInstance.sendBatchedEvents();

                expect(requestManager.post).toHaveBeenCalledTimes(1);

                return promise;
            });

            it(`should send "${t.expected.metrics[0].name}" when "${t.input}" is passed in`, () => {
                metricInstance.reportMetricEvent(t.input);
                const promise = metricInstance.sendBatchedEvents();

                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics',
                    JSON.stringify(t.expected),
                    [['Content-Type', 'application/json']]
                );

                return promise;
            });
        });
    });

    describe('reportMetricEventWithTags', () => {

        const tests: {
            input: AdmobMetric;
            inputTags: string[];
            expected: IProgrammaticTrackingData;
        }[] = [{
            input: AdmobMetric.AdmobUsedCachedVideo,
            inputTags: ['ads_sdk2_blt:3.0.0'],
            expected: {
                metrics: [
                    {
                        name: 'admob_used_cached_video',
                        value: 1,
                        tags: [
                            `ads_sdk2_sdv:${sdkVersion}`,
                            'ads_sdk2_iso:us',
                            `ads_sdk2_plt:${Platform[platform]}`,
                            'ads_sdk2_blt:3.0.0'
                        ]
                    }
                ]
            }
        }, {
            input: AdmobMetric.AdmobUsedStreamedVideo,
            inputTags: ['ads_sdk2_test:testValue'],
            expected: {
                metrics: [
                    {
                        name: 'admob_used_streamed_video',
                        value: 1,
                        tags: [
                            `ads_sdk2_sdv:${sdkVersion}`,
                            'ads_sdk2_iso:us',
                            `ads_sdk2_plt:${Platform[platform]}`,
                            'ads_sdk2_test:testValue'
                        ]
                    }
                ]
            }
        }];
        tests.forEach((t) => {

            it(`should call post once`, () => {
                metricInstance.reportMetricEventWithTags(t.input, t.inputTags);
                const promise = metricInstance.sendBatchedEvents();

                expect(requestManager.post).toHaveBeenCalledTimes(1);

                return promise;
            });

            it(`should send "${t.expected.metrics[0].name}" when "${t.input}" is passed in`, () => {
                metricInstance.reportMetricEventWithTags(t.input, t.inputTags);
                const promise = metricInstance.sendBatchedEvents();

                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics',
                    JSON.stringify(t.expected),
                    [['Content-Type', 'application/json']]
                );

                return promise;
            });
        });
    });

    describe('reportTimingEvent', () => {

        const tests: {
            metric: TimingEvent;
            value: number;
            path: string;
            expected: IProgrammaticTrackingData;
        }[] = [{
            metric: InitializationMetric.WebviewInitialization,
            value: 18331,
            path: '/timing',
            expected: {
                metrics: [
                    {
                        name: 'webview_initialization_time',
                        value: 18331,
                        tags: [
                            `ads_sdk2_sdv:${sdkVersion}`,
                            'ads_sdk2_iso:us',
                            `ads_sdk2_plt:${Platform[platform]}`
                        ]
                    }
                ]
            }
        }, {
            metric: InitializationMetric.WebviewInitialization,
            value: -1,
            path: '/metrics',
            expected: {
                metrics: [
                    {
                        name: 'timing_value_negative',
                        value: 1,
                        tags: [
                            `ads_sdk2_sdv:${sdkVersion}`,
                            'ads_sdk2_iso:us',
                            `ads_sdk2_plt:${Platform[platform]}`,
                            'ads_sdk2_mevt:webview_initialization_time' // Intentional to track which timing metrics are negative
                        ]
                    }
                ]
            }
        }];
        tests.forEach((t) => {

            it(`should call post once`, () => {
                metricInstance.reportTimingEvent(t.metric, t.value);
                const promise = metricInstance.sendBatchedEvents();

                expect(requestManager.post).toHaveBeenCalledTimes(1);

                return promise;
            });

            it(`should send "${t.expected.metrics[0].name}" with "${t.metric}" and "${t.value}" is passed in`, () => {
                metricInstance.reportTimingEvent(t.metric, t.value);
                const promise = metricInstance.sendBatchedEvents();

                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1' + t.path,
                    JSON.stringify(t.expected),
                    [['Content-Type', 'application/json']]
                );

                return promise;
            });
        });

        describe('with untracked countries', () => {
            beforeEach(() => {
                metricInstance = new MetricInstance(platform, requestManager, clientInfo, deviceInfo, 'mz');
                metricInstance.reportTimingEvent(InitializationMetric.WebviewInitialization, 10);
                return metricInstance.sendBatchedEvents();
            });

            it('should call with the expected row country', () => {
                const expected = {
                    metrics: [
                        {
                            name: 'webview_initialization_time',
                            value: 10,
                            tags: [
                                `ads_sdk2_sdv:${sdkVersion}`,
                                'ads_sdk2_iso:row',
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }
                    ]
                };

                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing',
                    JSON.stringify(expected),
                    [['Content-Type', 'application/json']]
                );

            });
        });
    });

    describe('Batching Events', () => {

        it('should not fire events when no events are batched', () => {
            return metricInstance.sendBatchedEvents().then(() => {
                expect(requestManager.post).toBeCalledTimes(0);
            });
        });

        it('should fire to metric endpoint with negative timing events', () => {
            metricInstance.reportTimingEvent(InitializationMetric.WebviewInitialization, -200);
            return metricInstance.sendBatchedEvents().then(() => {
                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics',
                    expect.anything(),
                    [['Content-Type', 'application/json']]
                );
            });
        });

        describe('Batch two timing events', () => {

            beforeEach(() => {
                metricInstance.reportTimingEvent(InitializationMetric.WebviewInitialization, 999);
                metricInstance.reportTimingEvent(MediationMetric.LoadRequestNofill, 100);
            });

            it('should call post once', () => {
                const promise = metricInstance.sendBatchedEvents();
                expect(requestManager.post).toHaveBeenCalledTimes(1);
                return promise;
            });

            it('should fire events when events are batched', () => {
                const expected = {
                    metrics: [
                        {
                            name: 'webview_initialization_time',
                            value: 999,
                            tags: [
                                `ads_sdk2_sdv:${sdkVersion}`,
                                'ads_sdk2_iso:us',
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }, {
                            name: 'load_request_nofill_time',
                            value: 100,
                            tags: [
                                `ads_sdk2_sdv:${sdkVersion}`,
                                'ads_sdk2_iso:us',
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }
                    ]
                };
                const promise = metricInstance.sendBatchedEvents();
                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing',
                    JSON.stringify(expected),
                    [['Content-Type', 'application/json']]
                );

                return promise;
            });

            it('should clear batched timing events', () => {
                return metricInstance.sendBatchedEvents().then(() => {
                    //tslint:disable-next-line
                    expect(metricInstance['_batchedTimingEvents']).toEqual([]);
                });
            });
        });

        describe('Batch two metric events', () => {
            beforeEach(() => {
                metricInstance.reportMetricEvent(BannerMetric.BannerAdLoad);
                metricInstance.reportMetricEvent(BannerMetric.BannerAdImpression);
            });

            it('should call post once', () => {
                const promise = metricInstance.sendBatchedEvents();
                expect(requestManager.post).toHaveBeenCalledTimes(1);
                return promise;
            });

            it('should fire events when events are batched', () => {
                const expected = {
                    metrics: [
                        {
                            name: 'banner_ad_load',
                            value: 1,
                            tags: [
                                `ads_sdk2_sdv:${sdkVersion}`,
                                'ads_sdk2_iso:us',
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }, {
                            name: 'banner_ad_impression',
                            value: 1,
                            tags: [
                                `ads_sdk2_sdv:${sdkVersion}`,
                                'ads_sdk2_iso:us',
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }
                    ]
                };
                const promise = metricInstance.sendBatchedEvents();
                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics',
                    JSON.stringify(expected),
                    [['Content-Type', 'application/json']]
                );

                return promise;
            });

            it('should clear batched metric events', () => {
                return metricInstance.sendBatchedEvents().then(() => {
                    //tslint:disable-next-line
                    expect(metricInstance['_batchedMetricEvents']).toEqual([]);
                });
            });
        });

        describe('batch 30 events', () => {
            it('should not fire events when below 30', () => {
                for (let i = 0; i < 30; i++) {
                    expect(requestManager.post).toBeCalledTimes(0);
                    metricInstance.reportTimingEvent(InitializationMetric.WebviewInitialization, 200);
                }
            });

            it('should fire events when 30 events are reached', () => {
                for (let i = 0; i < 30; i++) {
                    metricInstance.reportTimingEvent(InitializationMetric.WebviewInitialization, 200);
                }
                expect(requestManager.post).toBeCalledTimes(1);
            });
        });

        describe('send event while batch is being sent', () => {

            beforeEach(async () => {
                let batch1Resolve = () => { /* */ };
                requestManager.post.mockImplementationOnce(() => new Promise((resolve) => { batch1Resolve = resolve; }));

                let batch2Resolve = () => { /* */ };
                requestManager.post.mockImplementationOnce(() => new Promise((resolve) => { batch2Resolve = resolve; }));

                metricInstance.reportTimingEvent(InitializationMetric.WebviewInitialization, 999);
                const batch1 = metricInstance.sendBatchedEvents();
                metricInstance.reportTimingEvent(MediationMetric.LoadRequestNofill, 100);

                batch1Resolve();

                await batch1;

                const batch2 = metricInstance.sendBatchedEvents();

                batch2Resolve();

                await batch2;
            });

            it('should call post twice', () => {
                expect(requestManager.post).toHaveBeenCalledTimes(2);
            });

            it('should fire events when events are batched', () => {
                const expectedBatch1 = {
                    metrics: [
                        {
                            name: 'webview_initialization_time',
                            value: 999,
                            tags: [
                                `ads_sdk2_sdv:${sdkVersion}`,
                                'ads_sdk2_iso:us',
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }
                    ]
                };

                const expectedBatch2 = {
                    metrics: [
                        {
                            name: 'load_request_nofill_time',
                            value: 100,
                            tags: [
                                `ads_sdk2_sdv:${sdkVersion}`,
                                'ads_sdk2_iso:us',
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }
                    ]
                };

                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing',
                    JSON.stringify(expectedBatch1),
                    [['Content-Type', 'application/json']]
                );

                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing',
                    JSON.stringify(expectedBatch2),
                    [['Content-Type', 'application/json']]
                );
            });
        });

        describe('send batch twice in a row', () => {

            beforeEach(() => {
                let batch1Resolve = () => { /* */ };
                requestManager.post.mockImplementationOnce(() => new Promise((resolve) => { batch1Resolve = resolve; }));

                let batch2Resolve = () => { /* */ };
                requestManager.post.mockImplementationOnce(() => new Promise((resolve) => { batch2Resolve = resolve; }));

                metricInstance.reportTimingEvent(InitializationMetric.WebviewInitialization, 999);
                const batch1 = metricInstance.sendBatchedEvents();
                metricInstance.reportTimingEvent(MediationMetric.LoadRequestNofill, 100);
                const batch2 = metricInstance.sendBatchedEvents();

                batch1Resolve();
                batch2Resolve();

                return Promise.all([batch1, batch2]);
            });

            it('should call post twice', () => {
                expect(requestManager.post).toHaveBeenCalledTimes(2);
            });

            it('should fire events when events are batched', () => {
                const expectedBatch1 = {
                    metrics: [
                        {
                            name: 'webview_initialization_time',
                            value: 999,
                            tags: [
                                `ads_sdk2_sdv:${sdkVersion}`,
                                'ads_sdk2_iso:us',
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }
                    ]
                };

                const expectedBatch2 = {
                    metrics: [
                        {
                            name: 'load_request_nofill_time',
                            value: 100,
                            tags: [
                                `ads_sdk2_sdv:${sdkVersion}`,
                                'ads_sdk2_iso:us',
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }
                    ]
                };

                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing',
                    JSON.stringify(expectedBatch1),
                    [['Content-Type', 'application/json']]
                );

                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing',
                    JSON.stringify(expectedBatch2),
                    [['Content-Type', 'application/json']]
                );
            });
        });
    });

    describe('When test mode is enabled', () => {
        beforeEach(() => {
            clientInfo.getTestMode.mockReturnValue(true);
            metricInstance = new MetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
            for (let i = 0; i < 30; i++) {
                metricInstance.reportMetricEvent(AdmobMetric.AdmobUsedStreamedVideo);
            }
        });

        it('should call the staging endpoint', () => {
            expect(requestManager.post).toBeCalledWith(
                'https://sdk-diagnostics.stg.mz.internal.unity3d.com/v1/metrics',
                expect.anything(),
                expect.anything()
            );
        });
    });
}));
