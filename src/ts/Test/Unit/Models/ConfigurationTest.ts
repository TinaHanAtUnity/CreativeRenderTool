import 'mocha';
import { assert } from 'chai';

import { Configuration, CacheMode } from 'Models/Configuration';

import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';

describe('configurationTest', () => {

    let configuration: Configuration;

    describe('Parsing json to configuration', () => {
        beforeEach(() => {
            configuration = new Configuration(JSON.parse(ConfigurationJson));
        });

        it('should have enabled parameter from configuration', () => {
            assert.isTrue(configuration.isEnabled());
        });

        it('should have country parameter from configuration', () => {
            assert.equal(configuration.getCountry(), 'FI');
        });

        it('should have forced cache mode', () => {
            assert.equal(configuration.getCacheMode(), CacheMode.FORCED);
        });

        it('should have server side test mode false when undefined in config', () => {
           assert.equal(configuration.getTestMode(), false);
        });

        it('should have server side test mode true when defined in config', () => {
            configuration.set('test', true);
            assert.equal(configuration.getTestMode(), true);
        });

        describe('parsing placements', () => {
            it('should get all placements', () => {
                assert.property(configuration.getPlacements(), 'premium');
                assert.property(configuration.getPlacements(), 'video');
                assert.property(configuration.getPlacements(), 'mraid');
                assert.property(configuration.getPlacements(), 'rewardedVideoZone');
            });

            it('should pick default', () => {
                assert.equal(configuration.getDefaultPlacement().getId(), 'video');
            });

            it('should return placement by id', () => {
                assert.equal(configuration.getPlacement('premium').getName(), 'Premium placement');
            });
        });

    });
});
