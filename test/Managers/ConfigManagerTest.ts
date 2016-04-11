/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { ConfigManager } from '../../src/ts/Managers/ConfigManager';

describe('ConfigManagerTest', () => {

    let requestMock, clientInfoMock;
    let configManager: ConfigManager;
    let configPromise;

    beforeEach(() => {
        configPromise = Promise.resolve(['{ "enabled": true, "country": "fi", "placements": [ { "id": "1", "name": "placementName1", "default": false }, { "id": "2", "name": "placementName2", "default": true } ] }']);

        requestMock = {
            get: sinon.mock().returns(configPromise)
        };

        clientInfoMock = {
            getGameId: sinon.mock().returns(123),
            isDebuggable: sinon.mock().returns(false),
        };

        configManager = new ConfigManager(requestMock, clientInfoMock);
    });

    describe('after calling fetch', () => {

        beforeEach(() => {
            configManager.fetch();
        });

        it('should have configuration', () => {
            return configPromise.then((configuration) => {
                assert.isNotNull(configuration);
            });
        });

    });

});