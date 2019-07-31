import { assert } from 'chai';

import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';

import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import 'mocha';

describe('CoreConfigurationParserTest', () => {

    let coreConfig: CoreConfiguration;

    describe('Parsing json to configuration', () => {
        beforeEach(() => {
            coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationJson));
        });

        it('should have enabled parameter from configuration', () => {
            assert.isTrue(coreConfig.isEnabled());
        });

        it('should have country parameter from configuration', () => {
            assert.equal(coreConfig.getCountry(), 'FI');
        });

        it('should have coppaCompliant parameter from configuration', () => {
            assert.equal(coreConfig.isCoppaCompliant(), false);
        });

        it('should have abGroup parameter from configuration', () => {
            assert.equal(coreConfig.getAbGroup(), 99);
        });

        it('should have properties parameter from configuration', () => {
            assert.equal(coreConfig.getProperties(), 'abcdefgh12345678');
        });

        it('should have projectId parameter from configuration', () => {
            assert.equal(coreConfig.getUnityProjectId(), 'abcd-1234');
        });

        it('should have token parameter from configuration', () => {
            assert.equal(coreConfig.getToken(), 'abcd.1234.5678');
        });

        it('should have organizationId parameter from configuration', () => {
            assert.equal(coreConfig.getOrganizationId(), '5552368');
        });

        it('should have server side test mode false when undefined in config', () => {
            assert.equal(coreConfig.getTestMode(), false);
        });

        it('should have server side test mode true when defined in config', () => {
            coreConfig.set('test', true);
            assert.equal(coreConfig.getTestMode(), true);
        });
    });
});
