import { Platform } from 'Core/Constants/Platform';
import { RequestManagerMock, RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import {
    ProgrammaticTrackingService,
    ProgrammaticTrackingError,
    IProgrammaticTrackingData,
    AdmobMetric,
    TimingMetric
} from 'Ads/Utilities/ProgrammaticTrackingService';
import { ClientInfoMock, ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfoMock, DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { Core } from 'Core/__mocks__/Core';
import { ICore } from 'Core/ICore';
import { CoreConfiguration, CoreConfigurationMock } from 'Core/Models/__mocks__/CoreConfiguration.ts';

[
    Platform.IOS,
    Platform.ANDROID
].forEach(platform => describe('ProgrammaticTrackingService', () => {

    let programmaticTrackingService: ProgrammaticTrackingService;
    let clientInfo: ClientInfoMock;
    let deviceInfo: DeviceInfoMock;
    let requestManager: RequestManagerMock;
    let core: ICore;
    let coreconfig: CoreConfigurationMock;
    const osVersion = '11.2.1';
    const sdkVersion = '2300';

    beforeEach(() => {
        requestManager = new RequestManager();
        clientInfo = new ClientInfo();
        deviceInfo = new DeviceInfo();
        core = new Core();
        programmaticTrackingService = new ProgrammaticTrackingService(platform, requestManager, clientInfo, deviceInfo, 'us', core);
        deviceInfo.getOsVersion.mockReturnValue(osVersion);
        clientInfo.getSdkVersionName.mockReturnValue(sdkVersion);
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
                const tag = programmaticTrackingService.createAdsSdkTag(t.inputSuffix, t.inputValue);
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
                const promise = programmaticTrackingService.reportErrorEvent(t.input, adType, seatId);

                expect(requestManager.post).toHaveBeenCalledTimes(1);

                return promise;
            });

            it(`should send "${t.expected.metrics[0].name}" when "${t.input}" is passed in`, () => {
                const promise = programmaticTrackingService.reportErrorEvent(t.input, adType, seatId);

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
                const promise = programmaticTrackingService.reportMetricEvent(t.input);

                expect(requestManager.post).toHaveBeenCalledTimes(1);

                return promise;
            });

            it(`should send "${t.expected.metrics[0].name}" when "${t.input}" is passed in`, () => {
                const promise = programmaticTrackingService.reportMetricEvent(t.input);

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
                const promise = programmaticTrackingService.reportMetricEventWithTags(t.input, t.inputTags);

                expect(requestManager.post).toHaveBeenCalledTimes(1);

                return promise;
            });

            it(`should send "${t.expected.metrics[0].name}" when "${t.input}" is passed in`, () => {
                const promise = programmaticTrackingService.reportMetricEventWithTags(t.input, t.inputTags);

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
                const promise = programmaticTrackingService.reportTimingEvent(t.metric, t.value);

                expect(requestManager.post).toHaveBeenCalledTimes(1);

                return promise;
            });

            it(`should send "${t.expected.metrics[0].name}" with "${t.metric}" and "${t.value}" is passed in`, () => {
                const promise = programmaticTrackingService.reportTimingEvent(t.metric, t.value);

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
            return programmaticTrackingService.sendBatchedEvents().then(() => {
                expect(requestManager.post).toBeCalledTimes(0);
            });
        });

        it('should not fire events when negative valued events are batched', () => {
            programmaticTrackingService.batchEvent(TimingMetric.AdsInitializeTime, -200);
            return programmaticTrackingService.sendBatchedEvents().then(() => {
                expect(requestManager.post).toBeCalledTimes(0);
            });
        });

        describe('Batch two events', () => {

            beforeEach(() => {
                programmaticTrackingService.batchEvent(TimingMetric.CoreInitializeTime, 999);
                programmaticTrackingService.batchEvent(TimingMetric.WebviewLoadToConfigurationCompleteTime, 100);
            });

            it('should call post once', () => {
                const promise = programmaticTrackingService.sendBatchedEvents();
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
                const promise = programmaticTrackingService.sendBatchedEvents();
                expect(requestManager.post).toBeCalledWith(
                    'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing',
                    JSON.stringify(expected),
                    [['Content-Type', 'application/json']]
                    );

                return promise;
            });

            it('should clear batchedEvents', () => {
                return programmaticTrackingService.sendBatchedEvents().then(() => {
                    expect(programmaticTrackingService['_batchedEvents']).toEqual([]);
                });
            });
        });

        describe('batch 10 events', () => {
            it('should not fire events when below 10', () => {
                for (let i = 0; i < 10; i++) {
                    expect(requestManager.post).toBeCalledTimes(0);
                    programmaticTrackingService.batchEvent(TimingMetric.TotalWebviewInitializationTime, 200);
                }
            });

            it('should fire events when 10 events are reached', () => {
                for (let i = 0; i < 10; i++) {
                    programmaticTrackingService.batchEvent(TimingMetric.TotalWebviewInitializationTime, 200);
                }
                expect(requestManager.post).toBeCalledTimes(1);
            });
        });
    });

    describe('reportMetricEvent with Chinese network operator', () => {

        beforeEach(() => {
            coreconfig = new CoreConfiguration();
            core.isUsingChineseNetworkOperator = true;
            coreconfig.getAbGroup.mockReturnValue(5);
            core.Config = coreconfig;
            programmaticTrackingService = new ProgrammaticTrackingService(platform, requestManager, clientInfo, deviceInfo, 'us', core);
        });

        it('should fire with china endpoint', () => {
            const promise = programmaticTrackingService.reportMetricEvent(AdmobMetric.AdmobOMRegisteredImpression);

            expect(requestManager.post).toBeCalledWith(
                'https://sdk-diagnostics.prd.mz.internal.unity.cn/v1/metrics',
                expect.anything(),
                expect.anything()
            );

            return promise;

        });
    });

}));
