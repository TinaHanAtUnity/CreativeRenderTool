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
        configPromise = Promise.resolve(['{ "enabled": true, "country": "fi", "placements": [ { "id": "1", "name": "placementName1", "default": false }, { "id": "2", "name": "placementName2", "default": true } ] }']);

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

        describe('parsing two placements', () => {
            it('should get both placements', () => {
                assert.property(configManager.getPlacements(), '1');
                assert.property(configManager.getPlacements(), '2');
            });

            it('should pick default', () => {
                assert.equal(configManager.getDefaultPlacement().getId(), '2');
            });

            it('should return placement by id', () => {
                assert.equal(configManager.getPlacement('1').getName(), 'placementName1');
            });
        });

    });

});