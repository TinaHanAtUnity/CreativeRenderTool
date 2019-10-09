import {
    ProgrammaticTrackingError,
    ProgrammaticTrackingService,
    IProgrammaticTrackingData,
    AdmobMetric,
    TimingMetric,
    LoadMetric
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
    let gameIdStub: sinon.SinonStub;
    let postStub: sinon.SinonStub;
    let platform: Platform;

    beforeEach(() => {
        const request = sinon.createStubInstance(RequestManager);
        const clientInfo = sinon.createStubInstance(ClientInfo);
        const deviceInfo = sinon.createStubInstance(DeviceInfo);
        platform = Platform.ANDROID;
        programmaticTrackingService = new ProgrammaticTrackingService(platform, request, clientInfo, deviceInfo);
        osVersionStub = deviceInfo.getOsVersion;
        sdkVersionStub = clientInfo.getSdkVersionName;
        gameIdStub = clientInfo.getGameId;
        postStub = request.post;
        postStub.resolves({
            url: 'test',
            response: 'test',
            responseCode: 200,
            headers: []
        });
    });

    describe('reportErrorEvent', () => {

        const osVersion = '11.2.1';
        const sdkVersion = '2.3.0';
        const adType = 'test';
        const seatId = 1234;

        beforeEach(() => {
            osVersionStub.returns(osVersion);
            sdkVersionStub.returns(sdkVersion);
        });

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
            it(`should send "${t.expected.metrics![0].name}" when "${t.input}" is passed in`, () => {
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

        beforeEach(() => {
            gameIdStub.returns('1111');
        });

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
            it(`should send "${t.expected.metrics![0].name}" when "${t.input}" is passed in`, () => {
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

    describe('reportMetricEvent with Zynga WWF Games', () => {

        beforeEach(() => {
            gameIdStub.returns('2895988');
        });

        const tests: {
            input: LoadMetric;
            expected: IProgrammaticTrackingData;
        }[] = [{
            input: LoadMetric.LoadEnabledFill,
            expected: {
                metrics: [
                    {
                        name: 'load_enabled_fill',
                        value: 1,
                        tags: [
                            'ads_sdk2_mevt:load_enabled_fill',
                            'ads_sdk2_gid:2895988'
                        ]
                    }
                ]
            }
        }, {
            input: LoadMetric.LoadEnabledShow,
            expected: {
                metrics: [
                    {
                        name: 'load_enabled_show',
                        value: 1,
                        tags: [
                            'ads_sdk2_mevt:load_enabled_show',
                            'ads_sdk2_gid:2895988'
                        ]
                    }
                ]
            }
        }];
        tests.forEach((t) => {
            it(`should send "${t.expected.metrics![0].name}" when "${t.input}" is passed in`, () => {
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

        const sdkVersion = '2300';

        beforeEach(() => {
            sdkVersionStub.returns(sdkVersion);
            gameIdStub.returns('1111');
        });

        const tests: {
            metric: TimingMetric;
            value: number;
            country: string;
            path: string;
            expected: IProgrammaticTrackingData;
        }[] = [{
            metric: TimingMetric.WebviewInitializationTime,
            value: 18331,
            country: 'us',
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
            metric: TimingMetric.WebviewInitializationTime,
            value: -1,
            country: 'hk',
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
            it(`should send "${t.expected.metrics![0].name}" with "${t.metric}", "${t.value}", and "${t.country}" is passed in`, () => {
                const promise = programmaticTrackingService.reportTimingEvent(t.metric, t.value, t.country);
                sinon.assert.calledOnce(postStub);
                assert.equal(postStub.firstCall.args.length, 3);
                assert.equal(postStub.firstCall.args[0], 'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1' + t.path);
                assert.equal(postStub.firstCall.args[1], JSON.stringify(t.expected));
                assert.deepEqual(postStub.firstCall.args[2], [['Content-Type', 'application/json']]);
                return promise;
            });
        });
    });
});
