import { assert } from 'chai';
import 'mocha';
import { RequestPrivacyFactory } from 'Ads/Models/RequestPrivacy';
import { CurrentUnityConsentVersion, GamePrivacy, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import * as sinon from 'sinon';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { PrivacySDK } from 'Privacy/PrivacySDK';
describe('RequestPrivacyFactoryTests', () => {
    let userPrivacy;
    let gamePrivacy;
    let privacySDK;
    const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
    const deviceInfo = sinon.createStubInstance(AndroidDeviceInfo);
    deviceInfo.getLimitAdTracking.returns(false);
    const consentMethods = [PrivacyMethod.UNITY_CONSENT, PrivacyMethod.DEVELOPER_CONSENT];
    const privacyMethods = Object.values(PrivacyMethod);
    context('when userPrivacy has not been recorded', () => {
        let result;
        privacyMethods.forEach((method) => {
            context('gamePrivacy.method = ' + method, () => {
                beforeEach(() => {
                    userPrivacy = UserPrivacy.createUnrecorded();
                    gamePrivacy = new GamePrivacy({ method: method });
                    privacySDK = new PrivacySDK(gamePrivacy, userPrivacy, true, 0, LegalFramework.GDPR, false);
                });
                context('and limitAdTracking = true', () => {
                    it('sets appropriate method and all-false permissions', () => {
                        result = RequestPrivacyFactory.create(privacySDK, true);
                        assert.equal(result.method, method);
                        assert.equal(result.firstRequest, true);
                        assert.deepEqual(result.permissions, UserPrivacy.PERM_ALL_FALSE);
                    });
                });
                context('and limitAdTracking = false', () => {
                    it('sets appropriate method and all-false permissions', () => {
                        result = RequestPrivacyFactory.create(privacySDK, false);
                        let expectedPermissions = UserPrivacy.PERM_ALL_FALSE;
                        switch (method) {
                            case PrivacyMethod.DEFAULT:
                                expectedPermissions = UserPrivacy.PERM_ALL_TRUE;
                                break;
                            case PrivacyMethod.UNITY_CONSENT:
                                expectedPermissions = UserPrivacy.PERM_ALL_FALSE;
                                break;
                            case PrivacyMethod.DEVELOPER_CONSENT:
                                expectedPermissions = UserPrivacy.PERM_ALL_FALSE;
                                break;
                            case PrivacyMethod.LEGITIMATE_INTEREST:
                                expectedPermissions = UserPrivacy.PERM_ALL_FALSE;
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
                let result;
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
                    it('should set firstRequest as false', () => assert.equal(result.firstRequest, false));
                    it('should set privacy method to ' + method, () => assert.equal(result.method, method));
                    it('should set recorded permissions', () => assert.deepEqual(result.permissions, userPermissions));
                });
                context('and limitAdTracking is true', () => {
                    beforeEach(() => {
                        result = RequestPrivacyFactory.create(privacySDK, true);
                    });
                    it('should set firstRequest as false', () => assert.equal(result.firstRequest, false));
                    it('should set privacy method to ' + method, () => assert.equal(result.method, method));
                    it('should set recorded permissions', () => assert.deepEqual(result.permissions, UserPrivacy.PERM_ALL_FALSE));
                });
            });
            context('if game privacy method has changed since last privacy store', () => {
                let result;
                const anyPermissions = {};
                beforeEach(() => {
                    userPrivacy = new UserPrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST, version: 0, permissions: anyPermissions });
                    gamePrivacy = new GamePrivacy({ method: method });
                    privacySDK = new PrivacySDK(gamePrivacy, userPrivacy, true, 0, LegalFramework.GDPR, false);
                    result = RequestPrivacyFactory.create(privacySDK, false);
                });
                it('should not affect set privacy method', () => assert.notEqual(result.method, method));
            });
        });
    });
    context('when all permission is set', () => {
        let result;
        const expectedPermissions = UserPrivacy.PERM_ALL_TRUE;
        beforeEach(() => {
            userPrivacy = new UserPrivacy({ method: PrivacyMethod.UNITY_CONSENT, version: 0, permissions: expectedPermissions });
            gamePrivacy = new GamePrivacy({ method: PrivacyMethod.UNITY_CONSENT });
            privacySDK = new PrivacySDK(gamePrivacy, userPrivacy, true, 0, LegalFramework.GDPR, false);
            result = RequestPrivacyFactory.create(privacySDK, false);
        });
        it('should strip away all:true and replace with granular permissions', () => assert.deepEqual(result.permissions, expectedPermissions));
    });
    context('if game privacy method is PrivacyMethod.LEGITIMATE_INTEREST', () => {
        let result;
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
                gameExp: true
            },
            version: CurrentUnityConsentVersion
        };
        beforeEach(() => {
            privacySDK = PrivacyParser.parse(privacyParts, clientInfo, deviceInfo);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdFByaXZhY3lUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Fkcy9SZXF1ZXN0UHJpdmFjeVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBbUIscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNuRixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsV0FBVyxFQUF1QixhQUFhLEVBQUUsV0FBVyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFM0gsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUM5RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVoRCxRQUFRLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO0lBQ3hDLElBQUksV0FBd0IsQ0FBQztJQUM3QixJQUFJLFdBQXdCLENBQUM7SUFDN0IsSUFBSSxVQUFzQixDQUFDO0lBQzNCLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hFLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzdDLFVBQVUsQ0FBQyxrQkFBbUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFD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