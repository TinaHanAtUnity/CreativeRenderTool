import { assert } from 'chai';
import 'mocha';
import { IRequestPrivacy, RequestPrivacyFactory } from 'Ads/Models/RequestPrivacy';
import { CurrentUnityConsentVersion, GamePrivacy, IPrivacyPermissions, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';

import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import * as sinon from 'sinon';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { PrivacySDK } from 'Privacy/PrivacySDK';

describe('RequestPrivacyFactoryTests', () => {
    let userPrivacy: UserPrivacy;
    let gamePrivacy: GamePrivacy;
    let privacySDK: PrivacySDK;
    const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
    const deviceInfo = sinon.createStubInstance(AndroidDeviceInfo);
    (<sinon.SinonStub>deviceInfo.getLimitAdTracking).returns(false);

    const consentMethods = [PrivacyMethod.UNITY_CONSENT, PrivacyMethod.DEVELOPER_CONSENT];
    const privacyMethods = Object.values(PrivacyMethod);

    context('when userPrivacy has not been recorded', () => {
        let result: IRequestPrivacy;
        privacyMethods.forEach((method) => {
            context('gamePrivacy.method = ' + method, () => {
                beforeEach(() => {
                    userPrivacy = UserPrivacy.createUnrecorded();
                    gamePrivacy = new GamePrivacy({ method: method });
                    privacySDK = new PrivacySDK(gamePrivacy, userPrivacy, true, 0, LegalFramework.GDPR, false);
                });

                context('and limitAdTracking = true', () => {
                    it ('sets appropriate method and all-false permissions', () => {
                        result = RequestPrivacyFactory.create(privacySDK, true);
                        assert.equal(result.method, method);
                        assert.equal(result.firstRequest, true);
                        assert.deepEqual(result.permissions, UserPrivacy.PERM_ALL_FALSE);
                    });
                });

                context('and limitAdTracking = false', () => {
                    it ('sets appropriate method and all-false permissions', () => {
                        result = RequestPrivacyFactory.create(privacySDK, false);
                        let expectedPermissions = UserPrivacy.PERM_ALL_FALSE;
                        switch (method) {
                            case PrivacyMethod.DEFAULT: expectedPermissions = UserPrivacy.PERM_ALL_TRUE;
                                break;
                            case PrivacyMethod.UNITY_CONSENT: expectedPermissions = UserPrivacy.PERM_ALL_FALSE;
                                break;
                            case PrivacyMethod.DEVELOPER_CONSENT: expectedPermissions = UserPrivacy.PERM_ALL_FALSE;
                                break;
                            case PrivacyMethod.LEGITIMATE_INTEREST: expectedPermissions = UserPrivacy.PERM_ALL_FALSE;
                                break;
                            default: assert.isOk(false, 'PrivacyMethod ' + method + ' is not handled by unit tests, please update tests');
                        }
                        assert.equal(result.method, method);
                        assert.equal(result.firstRequest, true);
                        assert.deepEqual(result.permissions, expectedPermissions);
                    });
                });
            });
        });
    });

    consentMethods.forEach((method) => {
        context('for a game using ' + method, () => {
            context('when a recorded user privacy exists', () => {
                let result: IRequestPrivacy | undefined;
                const userPermissions = { gameExp: false, ads: true, external: true };

                beforeEach(() => {
                    userPrivacy = new UserPrivacy({ method: method, version: 20190101, permissions: userPermissions });
                    gamePrivacy = new GamePrivacy({ method: method });
                    privacySDK = new PrivacySDK(gamePrivacy, userPrivacy, true, 0, LegalFramework.GDPR, false);
                });

                context('and limitAdTracking is false', () => {
                    beforeEach(() => {
                        result = RequestPrivacyFactory.create(privacySDK, false);
                    });
                    it('should set firstRequest as false', () => assert.equal(result!.firstRequest, false));
                    it('should set privacy method to ' + method, () => assert.equal(result!.method, method));
                    it('should set recorded permissions', () => assert.deepEqual(result!.permissions, userPermissions));
                });

                context('and limitAdTracking is true', () => {
                    beforeEach(() => {
                        result = RequestPrivacyFactory.create(privacySDK, true);
                    });
                    it('should set firstRequest as false', () => assert.equal(result!.firstRequest, false));
                    it('should set privacy method to ' + method, () => assert.equal(result!.method, method));
                    it('should set recorded permissions', () => assert.deepEqual(result!.permissions, UserPrivacy.PERM_ALL_FALSE));
                });

            });

            context('if game privacy method has changed since last privacy store', () => {
                let result: IRequestPrivacy | undefined;
                const anyPermissions = <IPrivacyPermissions>{};
                beforeEach(() => {
                    userPrivacy = new UserPrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST, version: 0, permissions: anyPermissions });
                    gamePrivacy = new GamePrivacy({ method: method });
                    privacySDK = new PrivacySDK(gamePrivacy, userPrivacy, true, 0, LegalFramework.GDPR, false);
                    result = RequestPrivacyFactory.create(privacySDK, false);
                });
                it('should not affect set privacy method', () => assert.notEqual(result!.method, method));
            });
        });
    });

    context('when all permission is set', () => {
        let result: IRequestPrivacy | undefined;
        const expectedPermissions = UserPrivacy.PERM_ALL_TRUE;
        beforeEach(() => {
            userPrivacy = new UserPrivacy({ method: PrivacyMethod.UNITY_CONSENT, version: 0, permissions: expectedPermissions });
            gamePrivacy = new GamePrivacy({ method: PrivacyMethod.UNITY_CONSENT });
            privacySDK = new PrivacySDK(gamePrivacy, userPrivacy, true, 0, LegalFramework.GDPR, false);
            result = RequestPrivacyFactory.create(privacySDK, false);
        });
        it('should strip away all:true and replace with granular permissions',
            () => assert.deepEqual(result!.permissions, expectedPermissions));
    });

    context('if game privacy method is PrivacyMethod.LEGITIMATE_INTEREST', () => {
        let result: IRequestPrivacy;
        const anyPermissions = UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST;
        beforeEach(() => {
            userPrivacy = new UserPrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST, version: 0, permissions: anyPermissions });
            gamePrivacy = new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST });
            privacySDK = new PrivacySDK(gamePrivacy, userPrivacy, true, 0, LegalFramework.GDPR, false);
            result = RequestPrivacyFactory.create(privacySDK, false);
        });
        it('should return legitimate_interest privacy object', () => {
            assert.equal(result.method, PrivacyMethod.LEGITIMATE_INTEREST);
            assert.equal(result.firstRequest, false);
            assert.deepEqual(result.permissions, anyPermissions);
        });
    });

    context('when userPrivacy is modified', () => {
        const privacyParts = {
            gdprEnabled: true,
            optOutRecorded: false,
            optOutEnabled: false,
            gamePrivacy: { method: PrivacyMethod.UNITY_CONSENT },
            legalFramework: LegalFramework.GDPR
        };
        const newUserPrivacy = {
            method: PrivacyMethod.UNITY_CONSENT,
            permissions: {
                ads: true,
                external: true,
                gameExp: true },
            version: CurrentUnityConsentVersion };
        beforeEach(() => {
            privacySDK = PrivacyParser.parse(<IRawAdsConfiguration>privacyParts, clientInfo, deviceInfo);
        });

        it('requestPrivacy should be unaltered by privacy changes', () => {
            const requestPrivacy = RequestPrivacyFactory.create(privacySDK, false);
            assert.equal(requestPrivacy.method, PrivacyMethod.UNITY_CONSENT);
            assert.equal(requestPrivacy.firstRequest, true);
            assert.deepEqual(requestPrivacy.permissions, UserPrivacy.PERM_ALL_FALSE);
            privacySDK.getUserPrivacy().update(newUserPrivacy);
            assert.equal(requestPrivacy.method, PrivacyMethod.UNITY_CONSENT);
            assert.equal(requestPrivacy.firstRequest, true);
            assert.deepEqual(requestPrivacy.permissions, UserPrivacy.PERM_ALL_FALSE);
        });

        it('legacyRequestPrivacy should be unaltered by privacy changes', () => {
            const legacyRequestPrivacy = RequestPrivacyFactory.createLegacy(privacySDK);
            assert.equal(legacyRequestPrivacy.optOutRecorded, false);
            assert.equal(legacyRequestPrivacy.optOutEnabled, false);
            assert.equal(legacyRequestPrivacy.gdprEnabled, true);
            privacySDK.getUserPrivacy().update(newUserPrivacy);
            assert.equal(legacyRequestPrivacy.optOutRecorded, false);
            assert.equal(legacyRequestPrivacy.optOutEnabled, false);
            assert.equal(legacyRequestPrivacy.gdprEnabled, true);
        });
    });
});
