import { PrivacyMethod } from 'Privacy/Privacy';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { assert } from 'chai';
import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
describe('AdsConfigurationParserTest', () => {
    const platform = Platform.ANDROID;
    const backend = TestFixtures.getBackend(platform);
    const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
    const coreModule = TestFixtures.getCoreModule(nativeBridge);
    const core = coreModule.Api;
    const clientInfo = TestFixtures.getClientInfo(platform);
    const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
    context('Parsing json to configuration', () => {
        let adsConfig;
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
            it('should set hasArPlacement to false', () => {
                assert.equal(adsConfig.getHasArPlacement(), false);
            });
        });
    });
    context('PrivacySDK', () => {
        let configJson;
        beforeEach(() => {
            configJson = (JSON.parse(JSON.stringify(ConfigurationJson)));
        });
        context('with original GDPR opt-out fields', () => {
            let privacySDK;
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
                beforeEach(() => configJson.gamePrivacy.method = undefined);
                it('should set to DEFAULT if GDPR not enabled', () => {
                    configJson.gdprEnabled = false;
                    const privacy = PrivacyParser.parse(configJson, clientInfo, deviceInfo);
                    assert.equal(privacy.getGamePrivacy().getMethod(), PrivacyMethod.DEFAULT);
                });
                it('should set to LEGITIMATE_INTEREST if GDPR enabled', () => {
                    configJson.gdprEnabled = true;
                    const privacy = PrivacyParser.parse(configJson, clientInfo, deviceInfo);
                    assert.equal(privacy.getGamePrivacy().getMethod(), PrivacyMethod.LEGITIMATE_INTEREST);
                });
            });
            it('should set to UNITY_CONSENT', () => {
                configJson.gamePrivacy.method = 'unity_consent';
                const privacy = PrivacyParser.parse(configJson, clientInfo, deviceInfo);
                assert.equal(privacy.getGamePrivacy().getMethod(), PrivacyMethod.UNITY_CONSENT);
            });
            it('should mark as not recorded if userPrivacy is undefined', () => {
                configJson.userPrivacy = undefined;
                const privacy = PrivacyParser.parse(configJson, clientInfo, deviceInfo);
                assert.equal(privacy.getUserPrivacy().isRecorded(), false);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRzQ29uZmlndXJhdGlvblBhcnNlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL1BhcnNlcnMvQWRzQ29uZmlndXJhdGlvblBhcnNlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxpQkFBaUIsTUFBTSxtQ0FBbUMsQ0FBQztBQUNsRSxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxRQUFRLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO0lBQ3hDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7SUFDbEMsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsRCxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNyRSxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVELE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUM7SUFDNUIsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4RCxNQUFNLFVBQVUsR0FB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