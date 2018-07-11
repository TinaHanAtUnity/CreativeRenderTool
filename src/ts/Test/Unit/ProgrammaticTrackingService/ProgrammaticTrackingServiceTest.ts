import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { ProgrammaticTrackingService, ProgrammaticTrackingError } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';
import { Request } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Platform } from 'Constants/Platform';

describe('ProgrammaticTrackingService', () => {

    let programmaticTrackingService: ProgrammaticTrackingService;
    let platformStub: sinon.SinonStub;
    let osVersionStub: sinon.SinonStub;
    let sdkVersionStub: sinon.SinonStub;
    let postStub: sinon.SinonStub;

    beforeEach(() => {
        const request = sinon.createStubInstance(Request);
        const clientInfo = sinon.createStubInstance(ClientInfo);
        const deviceInfo = sinon.createStubInstance(DeviceInfo);
        programmaticTrackingService = new ProgrammaticTrackingService(request, clientInfo, deviceInfo);
        platformStub = <sinon.SinonStub>clientInfo.getPlatform;
        osVersionStub = <sinon.SinonStub>deviceInfo.getOsVersion;
        sdkVersionStub = <sinon.SinonStub>clientInfo.getSdkVersionName;
        postStub = <sinon.SinonStub>request.post;
        postStub.resolves({
            url: 'test',
            response: 'test',
            responseCode: 200,
            headers: []
        });
    });

    describe('buildErrorData', () => {
        it('should send correct data for too_large_file', () => {
            platformStub.returns(Platform.TEST);
            osVersionStub.returns('11.2.1');
            sdkVersionStub.returns('2.3.0');
            const errorData = programmaticTrackingService.buildErrorData(ProgrammaticTrackingError.TooLargeFile, 'test', 1234);
            sinon.assert.calledOnce(platformStub);
            sinon.assert.calledOnce(osVersionStub);
            sinon.assert.calledOnce(sdkVersionStub);
            assert.deepEqual(errorData, {
                event: ProgrammaticTrackingError.TooLargeFile,
                platform: 'TEST',
                osVersion: '11.2.1',
                sdkVersion: '2.3.0',
                adType: 'test',
                seatId: 1234
            });
        });
    });

    describe('reportError', () => {
        it('should send correct data using request api', () => {
            platformStub.returns(Platform.TEST);
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

});
