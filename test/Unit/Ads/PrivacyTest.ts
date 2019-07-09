import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { CurrentUnityConsentVersion, GamePrivacy, PrivacyMethod } from 'Ads/Models/Privacy';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

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
    let diagnosticTriggerStub: sinon.SinonStub;
    const baseAdsConf = {
        assetCaching: 'maybe',
        placements: [],
        defaultPlacement: '',
        defaultBannerPlacement: '',
        gdprEnabled: true,
        gamePrivacy: {method: 'legitimate_interest'}
    };
    beforeEach(() => {
        diagnosticTriggerStub = sinon.stub(Diagnostics, 'trigger');
    });
    afterEach(() => {
        diagnosticTriggerStub.restore();
    });
    [   {profiling: false},
        {profiling: true},
        {ads: false, gameExp: false, external: false},
        {ads: true, gameExp: true, external: true},
        {all: true}]
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
        {ads: true, gameExp: true, external: true},
        {all: true}]
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

    it('AdsConfigurationParser should NOT mark privacy as desynchronized and should send a diagnostics message if UserPrivacy is inconsistent', () => {
        const configJson = {
            optOutRecorded: true,
            optOutEnabled: false,
            userPrivacy: {
                permissions: {profiling: true, ads: true},
                method: 'legitimate_interest',
                version: CurrentUnityConsentVersion
            },
            ...baseAdsConf
        };
        const expectedDiagnosticsData = {
            gamePrivacy: JSON.stringify(configJson.gamePrivacy),
            userPrivacy: JSON.stringify(configJson.userPrivacy)
        };
        const desynced = AdsConfigurationParser.isUserPrivacyAndOptOutDesynchronized(configJson);
        assert.isFalse(desynced);
        sinon.assert.calledWith(diagnosticTriggerStub, 'ads_configuration_user_privacy_inconsistent', expectedDiagnosticsData);
        assert.isUndefined(configJson.userPrivacy);
    });
});
