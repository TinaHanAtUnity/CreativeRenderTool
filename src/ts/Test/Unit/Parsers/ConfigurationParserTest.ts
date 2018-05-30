import 'mocha';
import { assert } from 'chai';

import { Configuration, CacheMode } from 'Models/Configuration';
import { ConfigurationParser } from 'Parsers/ConfigurationParser';

import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import { getAbGroup } from 'Models/ABGroup';

describe('configurationParserTest', () => {

    let configuration: Configuration;

    describe('Parsing json to configuration', () => {
        beforeEach(() => {
            configuration = ConfigurationParser.parse(JSON.parse(ConfigurationJson));
        });

        it('should have enabled parameter from configuration', () => {
            assert.isTrue(configuration.isEnabled());
        });

        it('should have country parameter from configuration', () => {
            assert.equal(configuration.getCountry(), 'FI');
        });

        it('should have coppaCompliant parameter from configuration', () => {
            assert.equal(configuration.isCoppaCompliant(), false);
        });

        it('should have abGroup parameter from configuration', () => {
            assert.equal(configuration.getAbGroup(), getAbGroup(99));
        });

        it('should have gamerId parameter from configuration', () => {
            assert.equal(configuration.getGamerId(), '57a35671bb58271e002d93c9');
        });

        it('should have properties parameter from configuration', () => {
            assert.equal(configuration.getProperties(), 'abcdefgh12345678');
        });

        it('should have forced cache mode', () => {
            assert.equal(configuration.getCacheMode(), CacheMode.FORCED);
        });

        it('should have projectId parameter from configuration', () => {
            assert.equal(configuration.getUnityProjectId(), 'abcd-1234');
        });

        it('should have token parameter from configuration', () => {
            assert.equal(configuration.getToken(), 'abcd.1234.5678');
        });

        it('should have organizationId parameter from configuration', () => {
            assert.equal(configuration.getOrganizationId(), '5552368');
        });

        it('should have gdprEnabled parameter from configuration', () => {
            assert.equal(configuration.isGDPREnabled(), false);
        });

        it('should have optOutRecorded parameter from configuration', () => {
            assert.equal(configuration.isOptOutRecorded(), false);
        });

        it('should have optOutEnabled parameter from configuration', () => {
            assert.equal(configuration.isOptOutEnabled(), false);
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
