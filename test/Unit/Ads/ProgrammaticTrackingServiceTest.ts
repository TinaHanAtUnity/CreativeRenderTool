import {
    IProgrammaticTrackingMetricData,
    ProgrammaticTrackingError,
    ProgrammaticTrackingMetric,
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
            const error = ProgrammaticTrackingError.TooLargeFile;
            const adType = 'test';
            const seatId = 1234;
            const promise = programmaticTrackingService.reportError(error, adType, seatId);
            sinon.assert.calledOnce(postStub);
            assert.equal(postStub.firstCall.args.length, 3);
            assert.equal(postStub.firstCall.args[0], 'https://tracking.prd.mz.internal.unity3d.com/tracking/sdk/error');
            assert.equal(postStub.firstCall.args[1], JSON.stringify({
                event: error,
                platform: Platform[Platform.ANDROID],
                osVersion: osVersion,
                sdkVersion: sdkVersion,
                adType: adType,
                seatId: seatId
            }));
            assert.deepEqual(postStub.firstCall.args[2], [['Content-Type', 'application/json']]);
            return promise;
        });
    });

    describe('reportMetric', () => {
        const tests: {
            input: ProgrammaticTrackingMetric;
            expected: IProgrammaticTrackingMetricData;
        }[] = [{
            input: ProgrammaticTrackingMetric.AdmobUsedCachedVideo,
            expected: {
                event: ProgrammaticTrackingMetric.AdmobUsedCachedVideo
            }
        }, {
            input: ProgrammaticTrackingMetric.AdmobUsedStreamedVideo,
            expected: {
                event: ProgrammaticTrackingMetric.AdmobUsedStreamedVideo
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
