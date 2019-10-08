import {
    ProgrammaticTrackingError,
    ProgrammaticTrackingService,
    IProgrammaticTrackingData,
    AdmobMetric,
    TimingMetric
} from 'Ads/Utilities/ProgrammaticTrackingService';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import 'mocha';
import * as sinon from 'sinon';

describe('ProgrammaticTrackingService', () => {

    let programmaticTrackingService: ProgrammaticTrackingService;
    let osVersionStub: sinon.SinonStub;
    let sdkVersionStub: sinon.SinonStub;
    let postStub: sinon.SinonStub;
    let platform: Platform;
    const osVersion = '11.2.1';
    const sdkVersion = '2300';

    beforeEach(() => {
        const request = sinon.createStubInstance(RequestManager);
        const clientInfo = sinon.createStubInstance(ClientInfo);
        const deviceInfo = sinon.createStubInstance(DeviceInfo);
        platform = Platform.ANDROID;
        programmaticTrackingService = new ProgrammaticTrackingService(platform, request, clientInfo, deviceInfo, 'us');
        osVersionStub = deviceInfo.getOsVersion;
        sdkVersionStub = clientInfo.getSdkVersionName;
        postStub = request.post;
        osVersionStub.returns(osVersion);
        sdkVersionStub.returns(sdkVersion);
        postStub.resolves({
            url: 'test',
            response: 'test',
            responseCode: 200,
            headers: []
        });
    });

    describe('reportErrorEvent', () => {
        const adType = 'test';
        const seatId = 1234;

        const tagBuilder = [
            `ads_sdk2_plt:${Platform[Platform.ANDROID]}`,
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
            it(`should send "${t.expected.metrics[0].name}" when "${t.input}" is passed in`, () => {
                const promise = programmaticTrackingService.reportErrorEvent(t.input, adType, seatId);
                sinon.assert.calledOnce(postStub);
                assert.equal(postStub.firstCall.args.length, 3);
                assert.equal(postStub.firstCall.args[0], 'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics');
                assert.equal(postStub.firstCall.args[1], JSON.stringify(t.expected));
                assert.deepEqual(postStub.firstCall.args[2], [['Content-Type', 'application/json']]);
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
                            'ads_sdk2_mevt:admob_used_cached_video'
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
                            'ads_sdk2_mevt:admob_used_streamed_video'
                        ]
                    }
                ]
            }
        }];
        tests.forEach((t) => {
            it(`should send "${t.expected.metrics[0].name}" when "${t.input}" is passed in`, () => {
                const promise = programmaticTrackingService.reportMetricEvent(t.input);
                sinon.assert.calledOnce(postStub);
                assert.equal(postStub.firstCall.args.length, 3);
                assert.equal(postStub.firstCall.args[0], 'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics');
                assert.equal(postStub.firstCall.args[1], JSON.stringify(t.expected));
                assert.deepEqual(postStub.firstCall.args[2], [['Content-Type', 'application/json']]);
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
                            'ads_sdk2_sdv:2300',
                            'ads_sdk2_iso:us',
                            `ads_sdk2_plt:ANDROID`
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
                            'ads_sdk2_mevt:webview_initialization_time' // Intentional to track which timing metrics are negative
                        ]
                    }
                ]
            }
        }];
        tests.forEach((t) => {
            it(`should send "${t.expected.metrics[0].name}" with "${t.metric}" and "${t.value}" is passed in`, () => {
                const promise = programmaticTrackingService.reportTimingEvent(t.metric, t.value);
                sinon.assert.calledOnce(postStub);
                assert.equal(postStub.firstCall.args.length, 3);
                assert.equal(postStub.firstCall.args[0], 'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1' + t.path);
                assert.equal(postStub.firstCall.args[1], JSON.stringify(t.expected));
                assert.deepEqual(postStub.firstCall.args[2], [['Content-Type', 'application/json']]);
                return promise;
            });
        });
    });

    describe('Batching Events', () => {

        it('should not fire events when no events are batched', () => {
            return programmaticTrackingService.sendBatchedEvents().then(() => {
                sinon.assert.notCalled(postStub);
            });
        });

        it('should not fire events when negative valued events are batched', () => {
            programmaticTrackingService.batchEvent(TimingMetric.AdsInitializeTime, -200);
            return programmaticTrackingService.sendBatchedEvents().then(() => {
                sinon.assert.notCalled(postStub);
            });
        });

        it('should fire events when events are batched', () => {
            const expected = {
                metrics: [
                    {
                        name: 'uads_core_initialize_time',
                        value: 999,
                        tags: [
                            'ads_sdk2_sdv:2300',
                            'ads_sdk2_iso:us',
                            `ads_sdk2_plt:ANDROID`
                        ]
                    }, {
                        name: 'webview_load_to_configuration_complete_time',
                        value: 100,
                        tags: [
                            'ads_sdk2_sdv:2300',
                            'ads_sdk2_iso:us',
                            `ads_sdk2_plt:ANDROID`
                        ]
                    }
                ]
            };
            programmaticTrackingService.batchEvent(TimingMetric.CoreInitializeTime, 999);
            programmaticTrackingService.batchEvent(TimingMetric.WebviewLoadToConfigurationCompleteTime, 100);
            return programmaticTrackingService.sendBatchedEvents().then(() => {
                sinon.assert.calledOnce(postStub);
                assert.equal(postStub.firstCall.args.length, 3);
                assert.equal(postStub.firstCall.args[0], 'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/timing');
                assert.deepEqual(postStub.firstCall.args[1], JSON.stringify(expected));
                assert.deepEqual(postStub.firstCall.args[2], [['Content-Type', 'application/json']]);
                // tslint:disable-next-line:no-string-literal
                assert.deepEqual(programmaticTrackingService['_batchedEvents'], []);
            });
        });

        it('should fire events when 10 events are reached', () => {
            for (let i = 0; i < 10; i++) {
                sinon.assert.notCalled(postStub);
                programmaticTrackingService.batchEvent(TimingMetric.TotalWebviewInitializationTime, 200);
            }
            sinon.assert.calledOnce(postStub);
        });
    });
});
