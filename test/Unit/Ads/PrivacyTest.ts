import 'mocha';
import { assert } from 'chai';

import { CurrentUnityConsentVersion, GamePrivacy, PrivacyMethod } from 'Ads/Models/Privacy';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';

describe('GamePrivacyTests', () => {
    it('should be disabled if PrivacyMethod.DEFAULT', () => {
        const gamePrivacy = new GamePrivacy({ method: PrivacyMethod.DEFAULT});
        assert.isFalse(gamePrivacy.isEnabled());
        assert.equal(gamePrivacy.getVersion(), 0);
    });

    it('should be disabled if unknown method', () => {
        const gamePrivacy = new GamePrivacy({ method: 'unknown' });
        assert.isFalse(gamePrivacy.isEnabled());
    });

    it('should be enabled if PrivacyMethod.UNITY_CONSENT', () => {
        const gamePrivacy = new GamePrivacy({ method: PrivacyMethod.UNITY_CONSENT});
        assert.isTrue(gamePrivacy.isEnabled());
        assert.equal(gamePrivacy.getMethod(), PrivacyMethod.UNITY_CONSENT);
        assert.equal(gamePrivacy.getVersion(), 20181106);
    });
});

describe('incident-20190516-2', () => {
    const baseAdsConf = {
        assetCaching: 'maybe',
        placements: [],
        defaultPlacement: '',
        defaultBannerPlacement: '',
        gdprEnabled: true,
        gamePrivacy: {method: 'legitimate_interest'}
    };
    [   {profiling: false},
        {profiling: true},
        {ads: false, gameExp: false, external: false},
        {ads: true, gameExp: true, external: true}]
        .forEach((permissions) => {
        it('AdsConfigurationParser should NOT mark privacy as desynchronized if optOutEnabled is true and UserPrivacy.permissions = ' + JSON.stringify(permissions), () => {
            const configJson = {
                optOutRecorded: true,
                optOutEnabled: true,
                userPrivacy: {
                    permissions: permissions,
                    method: 'legitimate_interest',
                    version: CurrentUnityConsentVersion
                },
                ...baseAdsConf
            };
            const desynced = AdsConfigurationParser.isUserPrivacyAndOptOutDesynchronized(configJson);
            assert.isFalse(desynced);
        });
    });

    [   {profiling: false},
        {ads: false, gameExp: false, external: false}]
        .forEach((permissions) => {
        it('AdsConfigurationParser should mark privacy as desynchronized if optOutEnabled is false and Privacy.permission = ' + JSON.stringify(permissions), () => {
            const configJson = {
                optOutRecorded: true,
                optOutEnabled: false,
                userPrivacy: {
                    permissions: permissions,
                    method: 'legitimate_interest',
                    version: CurrentUnityConsentVersion
                },
                ...baseAdsConf
            };
            const desynced = AdsConfigurationParser.isUserPrivacyAndOptOutDesynchronized(configJson);
            assert.isTrue(desynced);
        });
    });

    [   {profiling: true},
        {ads: true, gameExp: true, external: true}]
        .forEach((permissions) => {
        it('AdsConfigurationParser should NOT mark privacy as desynchronized if optOutEnabled is false and Privacy.permission = ' + JSON.stringify(permissions), () => {
            const configJson = {
                optOutRecorded: true,
                optOutEnabled: false,
                userPrivacy: {
                    permissions: permissions,
                    method: 'legitimate_interest',
                    version: CurrentUnityConsentVersion
                },
                ...baseAdsConf
            };
            const desynced = AdsConfigurationParser.isUserPrivacyAndOptOutDesynchronized(configJson);
            assert.isFalse(desynced);
        });
    });
});
