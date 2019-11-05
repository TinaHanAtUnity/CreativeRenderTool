import {AdsConfiguration, IRawAdsConfiguration} from 'Ads/Models/AdsConfiguration';
import {PrivacyMethod} from 'Privacy/Privacy';
import {AdsConfigurationParser} from 'Ads/Parsers/AdsConfigurationParser';
import {assert} from 'chai';
import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { PrivacySDK } from 'Privacy/PrivacySDK';

describe('AdsConfigurationParserTest', () => {
    const platform = Platform.ANDROID;
    const backend = TestFixtures.getBackend(platform);
    const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
    const coreModule = TestFixtures.getCoreModule(nativeBridge);
    const core = coreModule.Api;
    const clientInfo = TestFixtures.getClientInfo(platform);
    const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
    context('Parsing json to configuration', () => {
        let adsConfig: AdsConfiguration;
        beforeEach(() => adsConfig = AdsConfigurationParser.parse(ConfigurationJson));

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

    context('PrivacySDK', () => {
        let configJson: IRawAdsConfiguration;
        beforeEach(() => {
            configJson = ConfigurationJson;
        });

        context('with original GDPR opt-out fields', () => {
            let privacySDK: PrivacySDK;
            beforeEach(() => privacySDK = PrivacyParser.parse(configJson, clientInfo, deviceInfo));
            it('should have gdprEnabled parameter from configuration', () => {
                assert.equal(privacySDK.isGDPREnabled(), false);
            });

            it('should have optOutRecorded parameter from configuration', () => {
                assert.equal(privacySDK.isOptOutRecorded(), false);
            });

            it('should have optOutEnabled parameter from configuration', () => {
                assert.equal(privacySDK.isOptOutEnabled(), false);
            });
        });

        context('with privacy fields', () => {
            describe('when game privacy method is undefined', () => {
                beforeEach(() => configJson.gamePrivacy!.method = undefined);

                it('should set to DEFAULT if GDPR not enabled', () => {
                    configJson.gdprEnabled = false;
                    const privacy = PrivacyParser.parse(configJson, clientInfo, deviceInfo);
                    assert.equal(privacy.getGamePrivacy().getMethod(), PrivacyMethod.DEFAULT);
                    assert.equal(privacy.getGamePrivacy().isEnabled(), false);
                });

                it('should set to LEGITIMATE_INTEREST if GDPR enabled', () => {
                    configJson.gdprEnabled = true;
                    const privacy = PrivacyParser.parse(configJson, clientInfo, deviceInfo);
                    assert.equal(privacy.getGamePrivacy().getMethod(), PrivacyMethod.LEGITIMATE_INTEREST);
                    assert.equal(privacy.getGamePrivacy().isEnabled(), true);
                });
            });

            it('should set to UNITY_CONSENT', () => {
                configJson.gamePrivacy!.method = 'unity_consent';
                const privacy = PrivacyParser.parse(configJson, clientInfo, deviceInfo);
                assert.equal(privacy.getGamePrivacy().getMethod(), PrivacyMethod.UNITY_CONSENT);
                assert.equal(privacy.getGamePrivacy().isEnabled(), true);
            });

            it('should mark as not recorded if userPrivacy is undefined', () => {
                configJson.userPrivacy = undefined;
                const privacy = PrivacyParser.parse(configJson, clientInfo, deviceInfo);
                assert.equal(privacy.getUserPrivacy().isRecorded(), false);
            });
        });
    });
});
