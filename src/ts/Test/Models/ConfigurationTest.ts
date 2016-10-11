import 'mocha';
import { assert } from 'chai';

import { Configuration, CacheMode } from 'Models/Configuration';

import ConfigurationJson from 'json/Configuration.json';

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
            assert.equal(configuration.getCountry(), 'fi');
        });

        it('should have forced cache mode', () => {
            assert.equal(configuration.getCacheMode(), CacheMode.FORCED);
        });

        describe('parsing two placements', () => {
            it('should get both placements', () => {
                assert.property(configuration.getPlacements(), '1');
                assert.property(configuration.getPlacements(), '2');
            });

            it('should pick default', () => {
                assert.equal(configuration.getDefaultPlacement().getId(), '2');
            });

            it('should return placement by id', () => {
                assert.equal(configuration.getPlacement('1').getName(), 'placementName1');
            });
        });

    });
});
