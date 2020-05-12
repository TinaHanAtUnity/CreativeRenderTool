import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { CurrentUnityConsentVersion, GamePrivacy, IPrivacyPermissions, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { Platform } from 'Core/Constants/Platform';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';

describe('GamePrivacyTests', () => {
    it('should be disabled if PrivacyMethod.DEFAULT', () => {
        const gamePrivacy = new GamePrivacy({ method: PrivacyMethod.DEFAULT });
        assert.equal(gamePrivacy.getVersion(), 0);
    });

    it('should be enabled if PrivacyMethod.UNITY_CONSENT', () => {
        const gamePrivacy = new GamePrivacy({ method: PrivacyMethod.UNITY_CONSENT });
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
            { method: PrivacyMethod.LEGITIMATE_INTEREST, optOutEnabled: false, permissions: <IPrivacyPermissions>{ ads: true, external: false } },
            { method: PrivacyMethod.LEGITIMATE_INTEREST, optOutEnabled: true, permissions: <IPrivacyPermissions>{ ads: false, external: false } },
            { method: PrivacyMethod.DEVELOPER_CONSENT, optOutEnabled: false, permissions: <IPrivacyPermissions>{ ads: true, external: false } },
            { method: PrivacyMethod.DEVELOPER_CONSENT, optOutEnabled: true, permissions: <IPrivacyPermissions>{ ads: false, external: false } }
        ];
        tests.forEach(({ method, optOutEnabled, permissions }) => {
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
