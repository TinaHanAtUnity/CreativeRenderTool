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

    describe('buildErrorData', () => {
        it('should send correct data for too_large_file', () => {
            osVersionStub.returns('11.2.1');
            sdkVersionStub.returns('2.3.0');
            const errorData = programmaticTrackingService.buildErrorData(ProgrammaticTrackingError.TooLargeFile, 'test', 1234);
            sinon.assert.calledOnce(osVersionStub);
            sinon.assert.calledOnce(sdkVersionStub);
            assert.deepEqual(errorData, {
                event: ProgrammaticTrackingError.TooLargeFile,
                platform: 'ANDROID',
                osVersion: '11.2.1',
                sdkVersion: '2.3.0',
                adType: 'test',
                seatId: 1234
            });
        });
    });

    describe('reportError', () => {
        it('should send correct data using request api', () => {
            osVersionStub.returns('11.2.1');
            sdkVersionStub.returns('2.3.0');
            const errorData = programmaticTrackingService.buildErrorData(ProgrammaticTrackingError.TooLargeFile, 'test', 1234);
            const promise = programmaticTrackingService.reportError(errorData);
            sinon.assert.calledOnce(postStub);
            assert.equal(postStub.firstCall.args.length, 3);
            assert.equal(postStub.firstCall.args[0], 'https://tracking.adsx.unityads.unity3d.com/tracking/sdk/error');
            assert.equal(postStub.firstCall.args[1], JSON.stringify(errorData));
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
                assert.equal(postStub.firstCall.args[0], 'https://tracking.adsx.unityads.unity3d.com/tracking/sdk/metric');
                assert.equal(postStub.firstCall.args[1], JSON.stringify(t.expected));
                assert.deepEqual(postStub.firstCall.args[2], [['Content-Type', 'application/json']]);
                return promise;
            });
        });
    });

});