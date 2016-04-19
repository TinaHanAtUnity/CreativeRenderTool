/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { ConfigManager } from '../../src/ts/Managers/ConfigManager';
import { NativeResponse } from '../../src/ts/Utilities/Request';

describe('ConfigManagerTest', () => {

    let requestMock, clientInfoMock, deviceInfoMock;
    let configPromise;

    beforeEach(() => {
        clientInfoMock = {
            getGameId: sinon.mock().returns(123),
            isDebuggable: sinon.mock().returns(false),
        };
        deviceInfoMock = {
            isRooted: sinon.mock().returns(false)
        };
    });

    describe('with correctly formed configuration json', () => {

        beforeEach(() => {
            let nativeResponse = new NativeResponse();
            nativeResponse.response = '{ "enabled": true, "country": "fi", "placements": [ { "id": "1", "name": "placementName1", "default": false }, { "id": "2", "name": "placementName2", "default": true } ] }';
            configPromise = Promise.resolve(nativeResponse);

            requestMock = {
                get: sinon.mock().returns(configPromise)
            };
        });

        it('calling fetch should return configuration', () => {
            ConfigManager.fetch(requestMock, clientInfoMock, deviceInfoMock);

            return configPromise.then((configuration) => {
                assert.isNotNull(configuration);
            });
        });
    });


    describe('with badly formed configuration json', () => {

        beforeEach(() => {
            let nativeResponse = new NativeResponse();
            nativeResponse.response = '{bad json here,';
            configPromise = Promise.resolve(nativeResponse);

            requestMock = {
                get: sinon.mock().returns(configPromise)
            };
        });

        it('calling fetch should return error', (done) => {
            let config = ConfigManager.fetch(requestMock, clientInfoMock, deviceInfoMock);
            config.then(() => {
                assert.fail('should not resolve');
                done();
            }, (e) => {
                assert.instanceOf(e, Error);
                done();
            });
        });
    });
});
