import { RequestManager, RequestManagerMock } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo, ClientInfoMock } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfo, DeviceInfoMock } from 'Core/Models/__mocks__/DeviceInfo';

import { IProgrammaticTrackingData, MetricInstance } from 'Ads/Networking/MetricInstance';
import { AdmobMetric, ProgrammaticTrackingError, TimingMetric, BannerMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
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
    const country = 'us';

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

    describe('reportErrorEvent', () => {
        const adType = 'test';
        const seatId = 1234;

        const tagBuilder = [
            `ads_sdk2_plt:${Platform[platform]}`,
            `ads_sdk2_osv:${osVersion}`,
            `ads_sdk2_sdv:${sdkVersion}`,
            `ads_sdk2_adt:${adType}`,
            `ads_sdk2_sid:${seatId}`
        ];

        const tests: {
            input: ProgrammaticTrackingError;
            expected: IProgrammaticTrackingData;
        }[] = [{
            input: ProgrammaticTrackingError.TooLargeFile,
            expected: {
                metrics: [
                    {
                        name: 'too_large_file',
                        value: 1,
                        tags: [
                            'ads_sdk2_eevt:too_large_file',
                            ...tagBuilder
                        ]
                    }
                ]
            }
        },
        {
            input: ProgrammaticTrackingError.BannerRequestError,
            expected: {
                metrics: [
                    {
                        name: 'banner_request_error',
                        value: 1,
                        tags: [
                            'ads_sdk2_eevt:banner_request_error',
                            ...tagBuilder
                        ]
                    }
                ]
            }
        }];
        tests.forEach((t) => {

            it(`should call post once`, () => {
                metricInstance.reportErrorEvent(t.input, adType, seatId);
                const promise = metricInstance.sendBatchedEvents();
                expect(requestManager.post).toHaveBeenCalledTimes(1);

                return promise;
            });

            it(`should send "${t.expected.metrics[0].name}" when "${t.input}" is passed in`, () => {
                metricInstance.reportErrorEvent(t.input, adType, seatId);
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
                            'ads_sdk2_mevt:admob_used_cached_video',
                            `ads_sdk2_sdv:${sdkVersion}`,
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
                            'ads_sdk2_mevt:admob_used_streamed_video',
                            `ads_sdk2_sdv:${sdkVersion}`,
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
                            'ads_sdk2_mevt:admob_used_cached_video',
                            `ads_sdk2_sdv:${sdkVersion}`,
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
                            'ads_sdk2_mevt:admob_used_streamed_video',
                            `ads_sdk2_sdv:${sdkVersion}`,
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
            metric: TimingMetric;
            value: number;
            path: string;
            expected: IProgrammaticTrackingData;
        }[] = [{
            metric: TimingMetric.TotalWebviewInitializationTime,
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
            metric: TimingMetric.TotalWebviewInitializationTime,
            value: -1,
            path: '/metrics',
            expected: {
                metrics: [
                    {
                        name: 'timing_value_negative',
                        value: 1,
                        tags: [
                            'ads_sdk2_mevt:webview_initialization_time', // Intentional to track which timing metrics are negative
                            `ads_sdk2_sdv:${sdkVersion}`,
                            `ads_sdk2_plt:${Platform[platform]}`
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
    });

    describe('Batching Events', () => {

        it('should not fire events when no events are batched', () => {
            return metricInstance.sendBatchedEvents().then(() => {
                expect(requestManager.post).toBeCalledTimes(0);
            });
        });

        it('should not fire events when negative valued events are batched', () => {
            metricInstance.reportTimingEvent(TimingMetric.AdsInitializeTime, -200);
            return metricInstance.sendBatchedTimingEvents().then(() => {
                expect(requestManager.post).toBeCalledTimes(0);
            });
        });

        describe('Batch two timing events', () => {

            beforeEach(() => {
                metricInstance.reportTimingEvent(TimingMetric.CoreInitializeTime, 999);
                metricInstance.reportTimingEvent(TimingMetric.WebviewLoadToConfigurationCompleteTime, 100);
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
                            name: 'uads_core_initialize_time',
                            value: 999,
                            tags: [
                                `ads_sdk2_sdv:${sdkVersion}`,
                                'ads_sdk2_iso:us',
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }, {
                            name: 'webview_load_to_configuration_complete_time',
                            value: 100,
                            tags: [
                                `ads_sdk2_sdv:${sdkVersion}`,
                                'ads_sdk2_iso:us',
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }
                    ]
                };
                const promise = metricInstance.sendBatchedTimingEvents();
                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing',
                    JSON.stringify(expected),
                    [['Content-Type', 'application/json']]
                    );

                return promise;
            });

            it('should clear batchedTimingEvents', () => {
                return metricInstance.sendBatchedTimingEvents().then(() => {
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
                const promise = metricInstance.sendBatchedMetricEvents();
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
                                'ads_sdk2_mevt:banner_ad_load',
                                `ads_sdk2_sdv:${sdkVersion}`,
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }, {
                            name: 'banner_ad_impression',
                            value: 1,
                            tags: [
                                'ads_sdk2_mevt:banner_ad_impression',
                                `ads_sdk2_sdv:${sdkVersion}`,
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }
                    ]
                };
                const promise = metricInstance.sendBatchedMetricEvents();
                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics',
                    JSON.stringify(expected),
                    [['Content-Type', 'application/json']]
                    );

                return promise;
            });

            it('should clear batchedMetricEvents', () => {
                return metricInstance.sendBatchedMetricEvents().then(() => {
                    //tslint:disable-next-line
                    expect(metricInstance['_batchedMetricEvents']).toEqual([]);
                });
            });
        });

        describe('batch 10 events', () => {
            it('should not fire events when below 10', () => {
                for (let i = 0; i < 10; i++) {
                    expect(requestManager.post).toBeCalledTimes(0);
                    metricInstance.reportTimingEvent(TimingMetric.TotalWebviewInitializationTime, 200);
                }
            });

            it('should fire events when 10 events are reached', () => {
                for (let i = 0; i < 10; i++) {
                    metricInstance.reportTimingEvent(TimingMetric.TotalWebviewInitializationTime, 200);
                }
                expect(requestManager.post).toBeCalledTimes(1);
            });
        });
    });

    describe('When test mode is enabled', () => {
        beforeEach(() => {
            clientInfo.getTestMode.mockReturnValue(true);
            metricInstance = new MetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
            for (let x=0;x<11;x++) {
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
