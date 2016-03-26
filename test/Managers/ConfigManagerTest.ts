/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import {ConfigManager} from '../../src/ts/Managers/ConfigManager';

describe('ConfigManagerTest', () => {

    let requestMock, clientInfoMock, deviceInfoMock;
    let configManager: ConfigManager;
    let configPromise;

    beforeEach(() => {
        configPromise = Promise.resolve(['{ "enabled": true, "country": "fi" }']);

        requestMock = {
            get: sinon.mock().returns(configPromise)
        };

        clientInfoMock = {
            getGameId: sinon.mock().returns(123),
            isDebuggable: sinon.mock().returns(false),
        };

        deviceInfoMock = {

        };

        configManager = new ConfigManager(requestMock, clientInfoMock, deviceInfoMock);
    });

    describe('after calling fetch', () => {

        beforeEach(() => {
            configManager.fetch();
        });

        it('should have enabled parameter from configuration', () => {
            return configPromise.then(() => {
                assert.isTrue(configManager.isEnabled());
            });
        });

        it('should have country parameter from configuration', () => {
            return configPromise.then(() => {
                assert.equal(configManager.getCountry(), 'fi');
            });
        });

    });

});