import {
    ProgrammaticTrackingErrorName,
    ProgrammaticTrackingMetricName,
    ProgrammaticTrackingService,
    IProgrammaticTrackingData
} from 'Ads/Utilities/ProgrammaticTrackingService';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import 'mocha';
import * as sinon from 'sinon';

describe('Ads/Utilities', () => {

    let programmaticTrackingService: ProgrammaticTrackingService;
    let osVersionStub: sinon.SinonStub;
    let sdkVersionStub: sinon.SinonStub;
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
        postStub = request.post;
        postStub.resolves({
            url: 'test',
            response: 'test',
            responseCode: 200,
            headers: []
        });
    });

    describe('reportError', () => {

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
            input: ProgrammaticTrackingErrorName;
            expected: IProgrammaticTrackingData;
        }[] = [{
            input: ProgrammaticTrackingErrorName.TooLargeFile,
            expected: {
                metrics: [
                    {
                        tags: [
                            'ads_sdk2_eevt:too_large_file',
                            ...tagBuilder
                        ]
                    }
                ]
            }
        },
        {
            input: ProgrammaticTrackingErrorName.BannerRequestError,
            expected: {
                metrics: [
                    {
                        tags: [
                            'ads_sdk2_eevt:banner_request_error',
                            ...tagBuilder
                        ]
                    }
                ]
            }
        }];
        tests.forEach((t) => {
            it(`should send "${t.expected}" when "${t.input}" is passed in`, () => {
                const promise = programmaticTrackingService.reportError(t.input, adType, seatId);
                sinon.assert.calledOnce(postStub);
                assert.equal(postStub.firstCall.args.length, 3);
                assert.equal(postStub.firstCall.args[0], 'https://tracking.prd.mz.internal.unity3d.com/tracking/sdk/metric');
                assert.equal(postStub.firstCall.args[1], JSON.stringify(t.expected));
                assert.deepEqual(postStub.firstCall.args[2], [['Content-Type', 'application/json']]);
                return promise;
            });
        });
    });

    describe('reportMetric', () => {
        const tests: {
            input: ProgrammaticTrackingMetricName;
            expected: IProgrammaticTrackingData;
        }[] = [{
            input: ProgrammaticTrackingMetricName.AdmobUsedCachedVideo,
            expected: {
                metrics: [
                    {
                        tags: [
                            'ads_sdk2_mevt:admob_used_cached_video'
                        ]
                    }
                ]
            }
        }, {
            input: ProgrammaticTrackingMetricName.AdmobUsedStreamedVideo,
            expected: {
                metrics: [
                    {
                        tags: [
                            'ads_sdk2_mevt:admob_used_streamed_video'
                        ]
                    }
                ]
            }
        }];
        tests.forEach((t) => {
            it(`should send "${t.expected}" when "${t.input}" is passed in`, () => {
                const promise = programmaticTrackingService.reportMetric(t.input);
                sinon.assert.calledOnce(postStub);
                assert.equal(postStub.firstCall.args.length, 3);
                assert.equal(postStub.firstCall.args[0], 'https://tracking.prd.mz.internal.unity3d.com/tracking/sdk/metric');
                assert.equal(postStub.firstCall.args[1], JSON.stringify(t.expected));
                assert.deepEqual(postStub.firstCall.args[2], [['Content-Type', 'application/json']]);
                return promise;
            });
        });
    });

});
