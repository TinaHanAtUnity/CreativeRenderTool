import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { MixedPlacementUtility } from 'Ads/Utilities/MixedPlacementUtility';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ABGroupBuilder } from 'Core/Models/ABGroup';

import { CacheMode, CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';

import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('configurationParserTest', () => {

    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;

    describe('Parsing json to configuration', () => {
        beforeEach(() => {
            coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationJson));
            adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationJson));
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
            assert.equal(coreConfig.getAbGroup(), ABGroupBuilder.getAbGroup(99));
        });

        it('should have properties parameter from configuration', () => {
            assert.equal(coreConfig.getProperties(), 'abcdefgh12345678');
        });

        it('should have forced cache mode', () => {
            assert.equal(adsConfig.getCacheMode(), CacheMode.FORCED);
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

        it('should have gdprEnabled parameter from configuration', () => {
            assert.equal(adsConfig.isGDPREnabled(), false);
        });

        it('should have optOutRecorded parameter from configuration', () => {
            assert.equal(adsConfig.isOptOutRecorded(), false);
        });

        it('should have optOutEnabled parameter from configuration', () => {
            assert.equal(adsConfig.isOptOutEnabled(), false);
        });

        it('should have server side test mode false when undefined in config', () => {
            assert.equal(coreConfig.getTestMode(), false);
        });

        it('should have server side test mode true when defined in config', () => {
            coreConfig.set('test', true);
            assert.equal(coreConfig.getTestMode(), true);
        });

        describe('parsing placements', () => {
            it('should get all placements', () => {
                assert.property(adsConfig.getPlacements(), 'premium');
                assert.property(adsConfig.getPlacements(), 'video');
                assert.property(adsConfig.getPlacements(), 'mraid');
                assert.property(adsConfig.getPlacements(), 'rewardedVideoZone');
            });

            it('should pick default', () => {
                assert.equal(adsConfig.getDefaultPlacement().getId(), 'video');
            });

            it('should return placement by id', () => {
                assert.equal(adsConfig.getPlacement('premium').getName(), 'Premium placement');
            });
        });
    });

    describe('Parsing mixed placement json to configuration', () => {

        const sandbox = sinon.createSandbox();

        beforeEach(() => {
            sandbox.stub(MixedPlacementUtility, 'createMixedPlacements');
        });

        afterEach(() => {
            MixedPlacementUtility.originalPlacements = {};
            sandbox.restore();
        });

        it('should only call createMixedPlacements if created placement is mixed and gameid is in mixed placement experiment', () => {
            const clientInfoPromoGame = TestFixtures.getClientInfo(Platform.ANDROID, '1003628');
            adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements), clientInfoPromoGame);
            sandbox.assert.called(<sinon.SinonStub>MixedPlacementUtility.createMixedPlacements);
        });
    });
});
