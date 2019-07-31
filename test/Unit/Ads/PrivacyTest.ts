import 'mocha';
import {assert} from 'chai';
import * as sinon from 'sinon';

import {CurrentUnityConsentVersion, GamePrivacy, IPermissions, PrivacyMethod, UserPrivacy} from 'Ads/Models/Privacy';
import {AdsConfigurationParser} from 'Ads/Parsers/AdsConfigurationParser';
import {Diagnostics} from 'Core/Utilities/Diagnostics';

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

context('UserPrivacyTests', () => {
    it('should create unrecorded user privacy', () => {
        const userPrivacy = UserPrivacy.createUnrecorded();
        assert.isFalse(userPrivacy.isRecorded());
        assert.equal(userPrivacy.getVersion(), 0);
    });

    context('creating UserPrivacy from legacy opt-out fields', () => {
        const tests = [
            { method: PrivacyMethod.LEGITIMATE_INTEREST, optOutEnabled: false, permissions: <IPermissions>{ ads: true }},
            { method: PrivacyMethod.LEGITIMATE_INTEREST, optOutEnabled: true, permissions: <IPermissions>{ ads: false }}
        ];
        tests.forEach(({method, optOutEnabled, permissions }) => {
            it(`should create user with ${method} and optOutEnabled:${optOutEnabled}`, () => {
                const userPrivacy = UserPrivacy.createFromLegacy(method, optOutEnabled);
                assert.isTrue(userPrivacy.isRecorded());
                assert.equal(userPrivacy.getMethod(), method);
                assert.include(<any>userPrivacy.getPermissions(), permissions);
            });
        });

        it('should create unrecorded user for DEVELOPER_CONSENT', () => {
            // see UserPrivacy.createFromLegacy for reasoning.
            const userPrivacy = UserPrivacy.createFromLegacy(PrivacyMethod.DEVELOPER_CONSENT, false);
            assert.isFalse(userPrivacy.isRecorded());
            assert.equal(userPrivacy.getVersion(), 0);
        });

        const nonLegacyMethods = [PrivacyMethod.DEFAULT, PrivacyMethod.UNITY_CONSENT];
        nonLegacyMethods.forEach((method) => {
            it('should fail if PrivacyMethod is ' + method, () => {
                const unsupportedCreation = UserPrivacy.createFromLegacy.bind(UserPrivacy, method, false);
                assert.throws(unsupportedCreation);
            });
        });
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
