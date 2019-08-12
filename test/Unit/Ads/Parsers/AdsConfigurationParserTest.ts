import { AdsConfiguration, IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { PrivacyMethod } from 'Ads/Models/Privacy';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { assert } from 'chai';
import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import {CacheMode} from 'Core/Models/CoreConfiguration';

describe('AdsConfigurationParserTest', () => {
    context('Parsing json to configuration', () => {
        let adsConfig: AdsConfiguration;
        beforeEach(() => adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationJson)));

        it('should have forced cache mode', () => {
            assert.equal(adsConfig.getCacheMode(), CacheMode.FORCED);
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

    context('Privacy', () => {
        let configJson: IRawAdsConfiguration;
        beforeEach(() => {
            configJson = JSON.parse(ConfigurationJson);
        });

        context('with original GDPR opt-out fields', () => {
            let adsConfig: AdsConfiguration;
            beforeEach(() => adsConfig = AdsConfigurationParser.parse(configJson));
            it('should have gdprEnabled parameter from configuration', () => {
                assert.equal(adsConfig.isGDPREnabled(), false);
            });

            it('should have optOutRecorded parameter from configuration', () => {
                assert.equal(adsConfig.isOptOutRecorded(), false);
            });

            it('should have optOutEnabled parameter from configuration', () => {
                assert.equal(adsConfig.isOptOutEnabled(), false);
            });
        });

        context('with privacy fields', () => {
            describe('when game privacy method is undefined', () => {
                beforeEach(() => configJson.gamePrivacy!.method = undefined);

                it('should set to DEFAULT if GDPR not enabled', () => {
                    configJson.gdprEnabled = false;
                    const config = AdsConfigurationParser.parse(configJson);
                    assert.equal(config.getGamePrivacy().getMethod(), PrivacyMethod.DEFAULT);
                    assert.equal(config.getGamePrivacy().isEnabled(), false);
                });

                it('should set to LEGITIMATE_INTEREST if GDPR enabled', () => {
                    configJson.gdprEnabled = true;
                    const config = AdsConfigurationParser.parse(configJson);
                    assert.equal(config.getGamePrivacy().getMethod(), PrivacyMethod.LEGITIMATE_INTEREST);
                    assert.equal(config.getGamePrivacy().isEnabled(), false);
                });
            });

            it('should set to UNITY_CONSENT', () => {
                configJson.gamePrivacy!.method = 'unity_consent';
                const config = AdsConfigurationParser.parse(configJson);
                assert.equal(config.getGamePrivacy().getMethod(), PrivacyMethod.UNITY_CONSENT);
                assert.equal(config.getGamePrivacy().isEnabled(), true);
            });

            it('should mark as not recorded if userPrivacy is undefined', () => {
                configJson.userPrivacy = undefined;
                const config = AdsConfigurationParser.parse(configJson);
                assert.equal(config.getUserPrivacy().isRecorded(), false);
            });
        });
    });
});
