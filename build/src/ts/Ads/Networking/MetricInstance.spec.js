import * as tslib_1 from "tslib";
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { MetricInstance, createMetricInstance, NullMetricInstance, ChinaMetricInstance } from 'Ads/Networking/MetricInstance';
import { AdmobMetric, InitializationMetric, MediationMetric, BannerMetric } from 'Ads/Utilities/SDKMetrics';
import { Platform } from 'Core/Constants/Platform';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
[
    Platform.IOS,
    Platform.ANDROID
].forEach(platform => describe('MetricInstance', () => {
    let clientInfo;
    let deviceInfo;
    let requestManager;
    const osVersion = '11.2.1';
    const sdkVersion = '2300';
    const country = 'US';
    let metricInstance;
    beforeEach(() => {
        requestManager = new RequestManager();
        clientInfo = new ClientInfo();
        deviceInfo = new DeviceInfo();
        clientInfo.getTestMode.mockReturnValue(false);
        deviceInfo.getOsVersion.mockReturnValue(osVersion);
        clientInfo.getSdkVersionName.mockReturnValue(sdkVersion);
        metricInstance = new MetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
    });
    describe('createMetricInstance', () => {
        it('should create a NullMetricInstance', () => {
            CustomFeatures.sampleAtGivenPercent = jest.fn().mockImplementation(() => false);
            deviceInfo.isChineseNetworkOperator.mockReturnValue(false);
            const localInstance = createMetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
            expect(localInstance).toBeInstanceOf(NullMetricInstance);
        });
        it('should create a MetricInstance', () => {
            CustomFeatures.sampleAtGivenPercent = jest.fn().mockImplementation(() => true);
            deviceInfo.isChineseNetworkOperator.mockReturnValue(false);
            const localInstance = createMetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
            expect(localInstance).toBeInstanceOf(MetricInstance);
        });
        it('should create a ChinaMetricInstance', () => {
            CustomFeatures.sampleAtGivenPercent = jest.fn().mockImplementation(() => true);
            deviceInfo.isChineseNetworkOperator.mockReturnValue(true);
            const localInstance = createMetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
            expect(localInstance).toBeInstanceOf(ChinaMetricInstance);
        });
    });
    describe('createAdsSdkTag', () => {
        const tests = [{
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
        const tests = [{
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
                expect(requestManager.post).toBeCalledWith('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics', JSON.stringify(t.expected), [['Content-Type', 'application/json']], {
                    retries: 2,
                    retryDelay: 0,
                    retryWithConnectionEvents: false,
                    followRedirects: false
                });
                return promise;
            });
        });
    });
    describe('reportMetricEventWithTags', () => {
        const tests = [{
                input: AdmobMetric.AdmobUsedCachedVideo,
                inputTags: { 'blt': '3.0.0' },
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
                inputTags: { 'test': 'testValue' },
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
                expect(requestManager.post).toBeCalledWith('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics', JSON.stringify(t.expected), [['Content-Type', 'application/json']], expect.anything());
                return promise;
            });
        });
    });
    describe('reportTimingEvent', () => {
        const tests = [{
                metric: InitializationMetric.WebviewInitialization,
                value: 18331,
                path: '/timing',
                expected: {
                    metrics: [
                        {
                            name: 'webview_init',
                            value: 18331,
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
                metricInstance.reportTimingEvent(t.metric, t.value);
                const promise = metricInstance.sendBatchedEvents();
                expect(requestManager.post).toHaveBeenCalledTimes(1);
                return promise;
            });
            it(`should send "${t.expected.metrics[0].name}" with "${t.metric}" and "${t.value}" is passed in`, () => {
                metricInstance.reportTimingEvent(t.metric, t.value);
                const promise = metricInstance.sendBatchedEvents();
                expect(requestManager.post).toBeCalledWith('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1' + t.path, JSON.stringify(t.expected), [['Content-Type', 'application/json']], {
                    retries: 2,
                    retryDelay: 0,
                    retryWithConnectionEvents: false,
                    followRedirects: false
                });
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
                            name: 'webview_init',
                            value: 10,
                            tags: [
                                `ads_sdk2_sdv:${sdkVersion}`,
                                'ads_sdk2_iso:row',
                                `ads_sdk2_plt:${Platform[platform]}`
                            ]
                        }
                    ]
                };
                expect(requestManager.post).toBeCalledWith('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing', JSON.stringify(expected), [['Content-Type', 'application/json']], expect.anything());
            });
        });
    });
    describe('Batching Events', () => {
        it('should not fire events when no events are batched', () => {
            return metricInstance.sendBatchedEvents().then(() => {
                expect(requestManager.post).toBeCalledTimes(0);
            });
        });
        it('should fire not to metric endpoint with negative timing events', () => {
            metricInstance.reportTimingEvent(InitializationMetric.WebviewInitialization, -200);
            return metricInstance.sendBatchedEvents().then(() => {
                expect(requestManager.post).not.toBeCalled();
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
                            name: 'webview_init',
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
                expect(requestManager.post).toBeCalledWith('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing', JSON.stringify(expected), [['Content-Type', 'application/json']], expect.anything());
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
                expect(requestManager.post).toBeCalledWith('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics', JSON.stringify(expected), [['Content-Type', 'application/json']], expect.anything());
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
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                let batch1Resolve = () => { };
                requestManager.post.mockImplementationOnce(() => new Promise((resolve) => { batch1Resolve = resolve; }));
                let batch2Resolve = () => { };
                requestManager.post.mockImplementationOnce(() => new Promise((resolve) => { batch2Resolve = resolve; }));
                metricInstance.reportTimingEvent(InitializationMetric.WebviewInitialization, 999);
                const batch1 = metricInstance.sendBatchedEvents();
                metricInstance.reportTimingEvent(MediationMetric.LoadRequestNofill, 100);
                batch1Resolve();
                yield batch1;
                const batch2 = metricInstance.sendBatchedEvents();
                batch2Resolve();
                yield batch2;
            }));
            it('should call post twice', () => {
                expect(requestManager.post).toHaveBeenCalledTimes(2);
            });
            it('should fire events when events are batched', () => {
                const expectedBatch1 = {
                    metrics: [
                        {
                            name: 'webview_init',
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
                expect(requestManager.post).toBeCalledWith('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing', JSON.stringify(expectedBatch1), [['Content-Type', 'application/json']], expect.anything());
                expect(requestManager.post).toBeCalledWith('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing', JSON.stringify(expectedBatch2), [['Content-Type', 'application/json']], expect.anything());
            });
        });
        describe('send batch twice in a row', () => {
            beforeEach(() => {
                let batch1Resolve = () => { };
                requestManager.post.mockImplementationOnce(() => new Promise((resolve) => { batch1Resolve = resolve; }));
                let batch2Resolve = () => { };
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
                            name: 'webview_init',
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
                expect(requestManager.post).toBeCalledWith('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing', JSON.stringify(expectedBatch1), [['Content-Type', 'application/json']], expect.anything());
                expect(requestManager.post).toBeCalledWith('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing', JSON.stringify(expectedBatch2), [['Content-Type', 'application/json']], expect.anything());
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
            expect(requestManager.post).toBeCalledWith('https://sdk-diagnostics.stg.mz.internal.unity3d.com/v1/metrics', expect.anything(), expect.anything(), expect.anything());
        });
    });
    describe('whet base url overridden', () => {
        beforeEach(() => {
            MetricInstance.setBaseUrl('https://localhost');
            metricInstance = new MetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
            metricInstance.reportMetricEvent(AdmobMetric.AdmobUsedStreamedVideo);
            metricInstance.sendBatchedEvents();
        });
        afterEach(() => {
            MetricInstance.setBaseUrl(undefined);
        });
        it('should call the provided endpoint', () => {
            expect(requestManager.post).toBeCalledWith('https://localhost/v1/metrics', expect.anything(), expect.anything(), expect.anything());
        });
    });
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0cmljSW5zdGFuY2Uuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTmV0d29ya2luZy9NZXRyaWNJbnN0YW5jZS5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFzQixNQUFNLHdDQUF3QyxDQUFDO0FBQzVGLE9BQU8sRUFBRSxVQUFVLEVBQWtCLE1BQU0sa0NBQWtDLENBQUM7QUFDOUUsT0FBTyxFQUFFLFVBQVUsRUFBa0IsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RSxPQUFPLEVBQTZCLGNBQWMsRUFBRSxvQkFBb0IsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3pKLE9BQU8sRUFBRSxXQUFXLEVBQWUsb0JBQW9CLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3pILE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFOUQ7SUFDSSxRQUFRLENBQUMsR0FBRztJQUNaLFFBQVEsQ0FBQyxPQUFPO0NBQ25CLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtJQUVsRCxJQUFJLFVBQTBCLENBQUM7SUFDL0IsSUFBSSxVQUEwQixDQUFDO0lBQy9CLElBQUksY0FBa0MsQ0FBQztJQUN2QyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDM0IsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDO0lBQzFCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQztJQUVyQixJQUFJLGNBQThCLENBQUM7SUFFbkMsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQ3RDLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQzlCLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQzlCLFVBQVUsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlDLFVBQVUsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25ELFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDekQsY0FBYyxHQUFHLElBQUksY0FBYyxDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRyxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7UUFDbEMsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLEdBQUcsRUFBRTtZQUMxQyxjQUFjLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hGLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0QsTUFBTSxhQUFhLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3RHLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM3RCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7WUFDdEMsY0FBYyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvRSxVQUFVLENBQUMsd0JBQXdCLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNELE1BQU0sYUFBYSxHQUFHLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN0RyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3pELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsRUFBRTtZQUMzQyxjQUFjLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9FLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUQsTUFBTSxhQUFhLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3RHLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtRQUM3QixNQUFNLEtBQUssR0FJTCxDQUFDO2dCQUNILFdBQVcsRUFBRSxLQUFLO2dCQUNsQixVQUFVLEVBQUUsT0FBTztnQkFDbkIsUUFBUSxFQUFFLG9CQUFvQjthQUNqQyxFQUFFO2dCQUNDLFdBQVcsRUFBRSxFQUFFO2dCQUNmLFVBQVUsRUFBRSxFQUFFO2dCQUNkLFFBQVEsRUFBRSxZQUFZO2FBQ3pCLENBQUMsQ0FBQztRQUVILEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNoQixFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLGtCQUFrQixDQUFDLENBQUMsV0FBVyxnQkFBZ0IsQ0FBQyxDQUFDLFVBQVUsR0FBRyxFQUFFLEdBQUcsRUFBRTtnQkFDOUYsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDeEUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtRQUMvQixNQUFNLEtBQUssR0FHTCxDQUFDO2dCQUNILEtBQUssRUFBRSxXQUFXLENBQUMsb0JBQW9CO2dCQUN2QyxRQUFRLEVBQUU7b0JBQ04sT0FBTyxFQUFFO3dCQUNMOzRCQUNJLElBQUksRUFBRSx5QkFBeUI7NEJBQy9CLEtBQUssRUFBRSxDQUFDOzRCQUNSLElBQUksRUFBRTtnQ0FDRixnQkFBZ0IsVUFBVSxFQUFFO2dDQUM1QixpQkFBaUI7Z0NBQ2pCLGdCQUFnQixRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7NkJBQ3ZDO3lCQUNKO3FCQUNKO2lCQUNKO2FBQ0osRUFBRTtnQkFDQyxLQUFLLEVBQUUsV0FBVyxDQUFDLHNCQUFzQjtnQkFDekMsUUFBUSxFQUFFO29CQUNOLE9BQU8sRUFBRTt3QkFDTDs0QkFDSSxJQUFJLEVBQUUsMkJBQTJCOzRCQUNqQyxLQUFLLEVBQUUsQ0FBQzs0QkFDUixJQUFJLEVBQUU7Z0NBQ0YsZ0JBQWdCLFVBQVUsRUFBRTtnQ0FDNUIsaUJBQWlCO2dDQUNqQixnQkFBZ0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFOzZCQUN2Qzt5QkFDSjtxQkFDSjtpQkFDSjthQUNKLENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUVoQixFQUFFLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO2dCQUM3QixjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxQyxNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFFbkQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFckQsT0FBTyxPQUFPLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsS0FBSyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7Z0JBQ2xGLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFDLE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUVuRCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FDdEMsZ0VBQWdFLEVBQ2hFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUMxQixDQUFDLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUMsRUFBRTtvQkFDcEMsT0FBTyxFQUFFLENBQUM7b0JBQ1YsVUFBVSxFQUFFLENBQUM7b0JBQ2IseUJBQXlCLEVBQUUsS0FBSztvQkFDaEMsZUFBZSxFQUFFLEtBQUs7aUJBQ3pCLENBQ0osQ0FBQztnQkFFRixPQUFPLE9BQU8sQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1FBRXZDLE1BQU0sS0FBSyxHQUlMLENBQUM7Z0JBQ0gsS0FBSyxFQUFFLFdBQVcsQ0FBQyxvQkFBb0I7Z0JBQ3ZDLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUU7Z0JBQzdCLFFBQVEsRUFBRTtvQkFDTixPQUFPLEVBQUU7d0JBQ0w7NEJBQ0ksSUFBSSxFQUFFLHlCQUF5Qjs0QkFDL0IsS0FBSyxFQUFFLENBQUM7NEJBQ1IsSUFBSSxFQUFFO2dDQUNGLGdCQUFnQixVQUFVLEVBQUU7Z0NBQzVCLGlCQUFpQjtnQ0FDakIsZ0JBQWdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQ0FDcEMsb0JBQW9COzZCQUN2Qjt5QkFDSjtxQkFDSjtpQkFDSjthQUNKLEVBQUU7Z0JBQ0MsS0FBSyxFQUFFLFdBQVcsQ0FBQyxzQkFBc0I7Z0JBQ3pDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUU7Z0JBQ2xDLFFBQVEsRUFBRTtvQkFDTixPQUFPLEVBQUU7d0JBQ0w7NEJBQ0ksSUFBSSxFQUFFLDJCQUEyQjs0QkFDakMsS0FBSyxFQUFFLENBQUM7NEJBQ1IsSUFBSSxFQUFFO2dDQUNGLGdCQUFnQixVQUFVLEVBQUU7Z0NBQzVCLGlCQUFpQjtnQ0FDakIsZ0JBQWdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQ0FDcEMseUJBQXlCOzZCQUM1Qjt5QkFDSjtxQkFDSjtpQkFDSjthQUNKLENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUVoQixFQUFFLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO2dCQUM3QixjQUFjLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUVuRCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVyRCxPQUFPLE9BQU8sQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxLQUFLLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtnQkFDbEYsY0FBYyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMvRCxNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFFbkQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQ3RDLGdFQUFnRSxFQUNoRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFDMUIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLEVBQ3RDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FDcEIsQ0FBQztnQkFFRixPQUFPLE9BQU8sQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO1FBRS9CLE1BQU0sS0FBSyxHQUtMLENBQUM7Z0JBQ0gsTUFBTSxFQUFFLG9CQUFvQixDQUFDLHFCQUFxQjtnQkFDbEQsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsUUFBUSxFQUFFO29CQUNOLE9BQU8sRUFBRTt3QkFDTDs0QkFDSSxJQUFJLEVBQUUsY0FBYzs0QkFDcEIsS0FBSyxFQUFFLEtBQUs7NEJBQ1osSUFBSSxFQUFFO2dDQUNGLGdCQUFnQixVQUFVLEVBQUU7Z0NBQzVCLGlCQUFpQjtnQ0FDakIsZ0JBQWdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTs2QkFDdkM7eUJBQ0o7cUJBQ0o7aUJBQ0o7YUFDSixDQUFDLENBQUM7UUFDSCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFFaEIsRUFBRSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtnQkFDN0IsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFFbkQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFckQsT0FBTyxPQUFPLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsTUFBTSxVQUFVLENBQUMsQ0FBQyxLQUFLLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtnQkFDcEcsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFFbkQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQ3RDLHdEQUF3RCxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQ2pFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUMxQixDQUFDLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUMsRUFBRTtvQkFDcEMsT0FBTyxFQUFFLENBQUM7b0JBQ1YsVUFBVSxFQUFFLENBQUM7b0JBQ2IseUJBQXlCLEVBQUUsS0FBSztvQkFDaEMsZUFBZSxFQUFFLEtBQUs7aUJBQ3pCLENBQ0osQ0FBQztnQkFFRixPQUFPLE9BQU8sQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtZQUN0QyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNaLGNBQWMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxRQUFRLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVGLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDakYsT0FBTyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM5QyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywyQ0FBMkMsRUFBRSxHQUFHLEVBQUU7Z0JBQ2pELE1BQU0sUUFBUSxHQUFHO29CQUNiLE9BQU8sRUFBRTt3QkFDTDs0QkFDSSxJQUFJLEVBQUUsY0FBYzs0QkFDcEIsS0FBSyxFQUFFLEVBQUU7NEJBQ1QsSUFBSSxFQUFFO2dDQUNGLGdCQUFnQixVQUFVLEVBQUU7Z0NBQzVCLGtCQUFrQjtnQ0FDbEIsZ0JBQWdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTs2QkFDdkM7eUJBQ0o7cUJBQ0o7aUJBQ0osQ0FBQztnQkFFRixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FDdEMsK0RBQStELEVBQy9ELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxFQUN0QyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQ3BCLENBQUM7WUFFTixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO1FBRTdCLEVBQUUsQ0FBQyxtREFBbUQsRUFBRSxHQUFHLEVBQUU7WUFDekQsT0FBTyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNoRCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGdFQUFnRSxFQUFFLEdBQUcsRUFBRTtZQUN0RSxjQUFjLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuRixPQUFPLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hELE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2pELENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1lBRXJDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osY0FBYyxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNsRixjQUFjLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzdFLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtnQkFDN0IsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ25ELE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELE9BQU8sT0FBTyxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDRDQUE0QyxFQUFFLEdBQUcsRUFBRTtnQkFDbEQsTUFBTSxRQUFRLEdBQUc7b0JBQ2IsT0FBTyxFQUFFO3dCQUNMOzRCQUNJLElBQUksRUFBRSxjQUFjOzRCQUNwQixLQUFLLEVBQUUsR0FBRzs0QkFDVixJQUFJLEVBQUU7Z0NBQ0YsZ0JBQWdCLFVBQVUsRUFBRTtnQ0FDNUIsaUJBQWlCO2dDQUNqQixnQkFBZ0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFOzZCQUN2Qzt5QkFDSixFQUFFOzRCQUNDLElBQUksRUFBRSwwQkFBMEI7NEJBQ2hDLEtBQUssRUFBRSxHQUFHOzRCQUNWLElBQUksRUFBRTtnQ0FDRixnQkFBZ0IsVUFBVSxFQUFFO2dDQUM1QixpQkFBaUI7Z0NBQ2pCLGdCQUFnQixRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7NkJBQ3ZDO3lCQUNKO3FCQUNKO2lCQUNKLENBQUM7Z0JBQ0YsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ25ELE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUN0QywrREFBK0QsRUFDL0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFDeEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLEVBQ3RDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FDcEIsQ0FBQztnQkFFRixPQUFPLE9BQU8sQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxvQ0FBb0MsRUFBRSxHQUFHLEVBQUU7Z0JBQzFDLE9BQU8sY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDaEQsMEJBQTBCO29CQUMxQixNQUFNLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQy9ELENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7WUFDckMsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWixjQUFjLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUM1RCxjQUFjLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDdEUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO2dCQUM3QixNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDbkQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckQsT0FBTyxPQUFPLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsNENBQTRDLEVBQUUsR0FBRyxFQUFFO2dCQUNsRCxNQUFNLFFBQVEsR0FBRztvQkFDYixPQUFPLEVBQUU7d0JBQ0w7NEJBQ0ksSUFBSSxFQUFFLGdCQUFnQjs0QkFDdEIsS0FBSyxFQUFFLENBQUM7NEJBQ1IsSUFBSSxFQUFFO2dDQUNGLGdCQUFnQixVQUFVLEVBQUU7Z0NBQzVCLGlCQUFpQjtnQ0FDakIsZ0JBQWdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTs2QkFDdkM7eUJBQ0osRUFBRTs0QkFDQyxJQUFJLEVBQUUsc0JBQXNCOzRCQUM1QixLQUFLLEVBQUUsQ0FBQzs0QkFDUixJQUFJLEVBQUU7Z0NBQ0YsZ0JBQWdCLFVBQVUsRUFBRTtnQ0FDNUIsaUJBQWlCO2dDQUNqQixnQkFBZ0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFOzZCQUN2Qzt5QkFDSjtxQkFDSjtpQkFDSixDQUFDO2dCQUNGLE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUNuRCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FDdEMsZ0VBQWdFLEVBQ2hFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxFQUN0QyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQ3BCLENBQUM7Z0JBRUYsT0FBTyxPQUFPLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsb0NBQW9DLEVBQUUsR0FBRyxFQUFFO2dCQUMxQyxPQUFPLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ2hELDBCQUEwQjtvQkFDMUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO1lBQzdCLEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7Z0JBQzVDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3pCLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQ3JGO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsK0NBQStDLEVBQUUsR0FBRyxFQUFFO2dCQUNyRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN6QixjQUFjLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQ3JGO2dCQUNELE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25ELENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsc0NBQXNDLEVBQUUsR0FBRyxFQUFFO1lBRWxELFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLElBQUksYUFBYSxHQUFHLEdBQUcsRUFBRSxHQUFTLENBQUMsQ0FBQztnQkFDcEMsY0FBYyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsYUFBYSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXpHLElBQUksYUFBYSxHQUFHLEdBQUcsRUFBRSxHQUFTLENBQUMsQ0FBQztnQkFDcEMsY0FBYyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsYUFBYSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXpHLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDbEYsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ2xELGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRXpFLGFBQWEsRUFBRSxDQUFDO2dCQUVoQixNQUFNLE1BQU0sQ0FBQztnQkFFYixNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFFbEQsYUFBYSxFQUFFLENBQUM7Z0JBRWhCLE1BQU0sTUFBTSxDQUFDO1lBQ2pCLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO2dCQUM5QixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pELENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDRDQUE0QyxFQUFFLEdBQUcsRUFBRTtnQkFDbEQsTUFBTSxjQUFjLEdBQUc7b0JBQ25CLE9BQU8sRUFBRTt3QkFDTDs0QkFDSSxJQUFJLEVBQUUsY0FBYzs0QkFDcEIsS0FBSyxFQUFFLEdBQUc7NEJBQ1YsSUFBSSxFQUFFO2dDQUNGLGdCQUFnQixVQUFVLEVBQUU7Z0NBQzVCLGlCQUFpQjtnQ0FDakIsZ0JBQWdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTs2QkFDdkM7eUJBQ0o7cUJBQ0o7aUJBQ0osQ0FBQztnQkFFRixNQUFNLGNBQWMsR0FBRztvQkFDbkIsT0FBTyxFQUFFO3dCQUNMOzRCQUNJLElBQUksRUFBRSwwQkFBMEI7NEJBQ2hDLEtBQUssRUFBRSxHQUFHOzRCQUNWLElBQUksRUFBRTtnQ0FDRixnQkFBZ0IsVUFBVSxFQUFFO2dDQUM1QixpQkFBaUI7Z0NBQ2pCLGdCQUFnQixRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7NkJBQ3ZDO3lCQUNKO3FCQUNKO2lCQUNKLENBQUM7Z0JBRUYsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQ3RDLCtEQUErRCxFQUMvRCxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxFQUM5QixDQUFDLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUMsRUFDdEMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUNwQixDQUFDO2dCQUVGLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUN0QywrREFBK0QsRUFDL0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsRUFDOUIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLEVBQ3RDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FDcEIsQ0FBQztZQUNOLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1lBRXZDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osSUFBSSxhQUFhLEdBQUcsR0FBRyxFQUFFLEdBQVMsQ0FBQyxDQUFDO2dCQUNwQyxjQUFjLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxhQUFhLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFekcsSUFBSSxhQUFhLEdBQUcsR0FBRyxFQUFFLEdBQVMsQ0FBQyxDQUFDO2dCQUNwQyxjQUFjLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxhQUFhLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFekcsY0FBYyxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNsRixNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDbEQsY0FBYyxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDekUsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBRWxELGFBQWEsRUFBRSxDQUFDO2dCQUNoQixhQUFhLEVBQUUsQ0FBQztnQkFFaEIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO2dCQUM5QixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pELENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDRDQUE0QyxFQUFFLEdBQUcsRUFBRTtnQkFDbEQsTUFBTSxjQUFjLEdBQUc7b0JBQ25CLE9BQU8sRUFBRTt3QkFDTDs0QkFDSSxJQUFJLEVBQUUsY0FBYzs0QkFDcEIsS0FBSyxFQUFFLEdBQUc7NEJBQ1YsSUFBSSxFQUFFO2dDQUNGLGdCQUFnQixVQUFVLEVBQUU7Z0NBQzVCLGlCQUFpQjtnQ0FDakIsZ0JBQWdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTs2QkFDdkM7eUJBQ0o7cUJBQ0o7aUJBQ0osQ0FBQztnQkFFRixNQUFNLGNBQWMsR0FBRztvQkFDbkIsT0FBTyxFQUFFO3dCQUNMOzRCQUNJLElBQUksRUFBRSwwQkFBMEI7NEJBQ2hDLEtBQUssRUFBRSxHQUFHOzRCQUNWLElBQUksRUFBRTtnQ0FDRixnQkFBZ0IsVUFBVSxFQUFFO2dDQUM1QixpQkFBaUI7Z0NBQ2pCLGdCQUFnQixRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7NkJBQ3ZDO3lCQUNKO3FCQUNKO2lCQUNKLENBQUM7Z0JBRUYsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQ3RDLCtEQUErRCxFQUMvRCxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxFQUM5QixDQUFDLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUMsRUFDdEMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUNwQixDQUFDO2dCQUVGLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUN0QywrREFBK0QsRUFDL0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsRUFDOUIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLEVBQ3RDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FDcEIsQ0FBQztZQUNOLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7UUFDdkMsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLFVBQVUsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdDLGNBQWMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxRQUFRLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDekIsY0FBYyxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2FBQ3hFO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxFQUFFO1lBQ3hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUN0QyxnRUFBZ0UsRUFDaEUsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUNqQixNQUFNLENBQUMsUUFBUSxFQUFFLEVBQ2pCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FDcEIsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO1FBQ3RDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixjQUFjLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDL0MsY0FBYyxHQUFHLElBQUksY0FBYyxDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvRixjQUFjLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDckUsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ1gsY0FBYyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxtQ0FBbUMsRUFBRSxHQUFHLEVBQUU7WUFDekMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQ3RDLDhCQUE4QixFQUM5QixNQUFNLENBQUMsUUFBUSxFQUFFLEVBQ2pCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFDakIsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUNwQixDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMifQ==