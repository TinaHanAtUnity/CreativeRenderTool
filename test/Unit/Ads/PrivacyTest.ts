import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { CurrentUnityConsentVersion, GamePrivacy, IPermissions, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { Platform } from 'Core/Constants/Platform';
import { TestFixtures } from 'TestHelpers/TestFixtures';

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
            { method: PrivacyMethod.LEGITIMATE_INTEREST, optOutEnabled: false, permissions: <IPermissions>{ ads: true, external: false }},
            { method: PrivacyMethod.LEGITIMATE_INTEREST, optOutEnabled: true, permissions: <IPermissions>{ ads: false, external: false }},
            { method: PrivacyMethod.DEVELOPER_CONSENT, optOutEnabled: false, permissions: <IPermissions>{ ads: true, external: false  }},
            { method: PrivacyMethod.DEVELOPER_CONSENT, optOutEnabled: true, permissions: <IPermissions>{ ads: false, external: false  }}
        ];
        tests.forEach(({method, optOutEnabled, permissions }) => {
            it(`should create user with ${method} and optOutEnabled:${optOutEnabled}`, () => {
                const userPrivacy = UserPrivacy.createFromLegacy(method, true, optOutEnabled);
                assert.isTrue(userPrivacy.isRecorded());
                assert.equal(userPrivacy.getMethod(), method);
                assert.include(<any>userPrivacy.getPermissions(), permissions);
            });
        });

        it('should create unrecorded user when optOutRecorded:false', () => {
            const userPrivacy = UserPrivacy.createFromLegacy(PrivacyMethod.DEVELOPER_CONSENT, false, false);
            assert.isFalse(userPrivacy.isRecorded());
        });

        const nonLegacyMethods = [PrivacyMethod.DEFAULT, PrivacyMethod.UNITY_CONSENT];
        nonLegacyMethods.forEach((method) => {
            it('should fail if PrivacyMethod is ' + method, () => {
                const unsupportedCreation = UserPrivacy.createFromLegacy.bind(UserPrivacy, method, true, true);
                assert.throws(unsupportedCreation);
            });
        });
    });
});

describe('incident-20190516-2', () => {
    let diagnosticTriggerStub: sinon.SinonStub;
    const platform = Platform.ANDROID;
    const backend = TestFixtures.getBackend(platform);
    const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
    const coreModule = TestFixtures.getCoreModule(nativeBridge);
    const core = coreModule.Api;
    const clientInfo = TestFixtures.getClientInfo(platform);
    const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
    const baseAdsConf = {
        assetCaching: 'maybe',
        placements: [],
        defaultPlacement: '',
        defaultBannerPlacement: '',
        gdprEnabled: true,
        gamePrivacy: {method: 'legitimate_interest'},
        ageGate: undefined
    };
    beforeEach(() => {
        diagnosticTriggerStub = sinon.stub(Diagnostics, 'trigger');
    });
    afterEach(() => {
        diagnosticTriggerStub.restore();
        // tslint:disable-next-line
        PrivacyParser['_updateUserPrivacyForIncident'] = false;
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
            PrivacyParser.parse(configJson, clientInfo, deviceInfo);
            assert.isFalse(PrivacyParser.isUpdateUserPrivacyForIncidentNeeded());
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
            PrivacyParser.parse(configJson, clientInfo, deviceInfo);
            assert.isTrue(PrivacyParser.isUpdateUserPrivacyForIncidentNeeded());
        });
    });

    [   {profiling: true},
        {ads: true, gameExp: true, external: true},
        {all: true}]
        .forEach((permissions) => {
        it('AdsConfigurationParser should NOT mark privacy as desynchronized if optOutEnabled is false and PrivacySDK.permission = ' + JSON.stringify(permissions), () => {
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
            PrivacyParser.parse(configJson, clientInfo, deviceInfo);
            assert.isFalse(PrivacyParser.isUpdateUserPrivacyForIncidentNeeded());
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
        PrivacyParser.parse(configJson, clientInfo, deviceInfo);
        assert.isFalse(PrivacyParser.isUpdateUserPrivacyForIncidentNeeded());
        sinon.assert.calledWith(diagnosticTriggerStub, 'ads_configuration_user_privacy_inconsistent', expectedDiagnosticsData);
        assert.isUndefined(configJson.userPrivacy);
    });
});
