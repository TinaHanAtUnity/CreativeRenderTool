import {
    IProgrammaticTrackingMetricData,
    ProgrammaticTrackingErrorName,
    ProgrammaticTrackingMetricName,
    ProgrammaticTrackingService
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

    beforeEach(() => {
        const request = sinon.createStubInstance(RequestManager);
        const clientInfo = sinon.createStubInstance(ClientInfo);
        const deviceInfo = sinon.createStubInstance(DeviceInfo);
        programmaticTrackingService = new ProgrammaticTrackingService(Platform.ANDROID, request, clientInfo, deviceInfo);
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
        it('should send correct data using request api', () => {
            const osVersion = '11.2.1';
            const sdkVersion = '2.3.0';
            osVersionStub.returns(osVersion);
            sdkVersionStub.returns(sdkVersion);
            const error = ProgrammaticTrackingErrorName.TooLargeFile;
            const adType = 'test';
            const seatId = 1234;
            const promise = programmaticTrackingService.reportError(error, adType, seatId);
            sinon.assert.calledOnce(postStub);
            assert.equal(postStub.firstCall.args.length, 3);
            assert.equal(postStub.firstCall.args[0], 'https://tracking.prd.mz.internal.unity3d.com/tracking/sdk/metric');
            assert.equal(postStub.firstCall.args[1], JSON.stringify({
                event: undefined,
                metrics: [
                    {
                        tags: [
                            'ads_sdk2_eevt:too_large_file',
                            'ads_sdk2_plt:ANDROID',
                            'ads_sdk2_osv:11.2.1',
                            'ads_sdk2_sdv:2.3.0',
                            'ads_sdk2_adt:test',
                            'ads_sdk2_sid:1234'
                        ]
                    }
                ]
            }));
            assert.deepEqual(postStub.firstCall.args[2], [['Content-Type', 'application/json']]);
            return promise;
        });
    });

    describe('reportMetric', () => {
        const tests: {
            input: ProgrammaticTrackingMetricName;
            expected: IProgrammaticTrackingMetricData;
        }[] = [{
            input: ProgrammaticTrackingMetricName.AdmobUsedCachedVideo,
            expected: {
                event: undefined,
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
                event: undefined,
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
