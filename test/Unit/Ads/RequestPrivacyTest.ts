import { assert } from 'chai';
import 'mocha';
import { IRequestPrivacy, RequestPrivacyFactory } from 'Ads/Models/RequestPrivacy';
import {
    CurrentUnityConsentVersion,
    GamePrivacy,
    IPermissions,
    PrivacyMethod,
    UserPrivacy
} from 'Privacy/Privacy';

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
    const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
    const deviceInfo = sinon.createStubInstance(AndroidDeviceInfo);
    (<sinon.SinonStub>deviceInfo.getLimitAdTracking).returns(false);

    const consentMethods = [PrivacyMethod.UNITY_CONSENT, PrivacyMethod.DEVELOPER_CONSENT];

    consentMethods.forEach((method) => {
        context('for a game using ' + method, () => {
            context('when no previous user privacy is recorded', () => {
                let result: IRequestPrivacy | undefined;
                beforeEach(() => {
                    userPrivacy = UserPrivacy.createUnrecorded();
                    gamePrivacy = new GamePrivacy({ method: method });
                    result = RequestPrivacyFactory.create(userPrivacy, gamePrivacy);
                });
                it('should set firstRequest as true', () => assert.equal(result!.firstRequest, true));
                it('should set privacy method as ' + method, () => assert.equal(result!.method, method));
                it('should set permissions as empty', () => assert.deepEqual(result!.permissions, {}));
            });

            context('when a recorded user privacy exists', () => {
                let result: IRequestPrivacy | undefined;
                const expectedPermissions = { gameExp: false, ads: true, external: true };
                beforeEach(() => {
                    userPrivacy = new UserPrivacy({ method: method, version: 20190101, permissions: expectedPermissions });
                    gamePrivacy = new GamePrivacy({ method: method });
                    result = RequestPrivacyFactory.create(userPrivacy, gamePrivacy);
                });
                it('should set firstRequest as false', () => assert.equal(result!.firstRequest, false));
                it('should set privacy method to ' + method, () => assert.equal(result!.method, method));
                it('should set recorded permissions', () => assert.deepEqual(result!.permissions, expectedPermissions));
            });

            context('if game privacy method has changed since last privacy store', () => {
                let result: IRequestPrivacy | undefined;
                const anyPermissions = <IPermissions>{};
                beforeEach(() => {
                    userPrivacy = new UserPrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST, version: 0, permissions: anyPermissions });
                    gamePrivacy = new GamePrivacy({ method: method });
                    result = RequestPrivacyFactory.create(userPrivacy, gamePrivacy);
                });
                it('should not affect set privacy method', () => assert.notEqual(result!.method, method));
            });
        });
    });

    context('when all permission is set', () => {
        let result: IRequestPrivacy | undefined;
        const expectedPermissions = { gameExp: true, ads: true, external: true };
        beforeEach(() => {
            userPrivacy = new UserPrivacy({ method: PrivacyMethod.UNITY_CONSENT, version: 0, permissions: expectedPermissions });
            gamePrivacy = new GamePrivacy({ method: PrivacyMethod.UNITY_CONSENT });
            result = RequestPrivacyFactory.create(userPrivacy, gamePrivacy);
        });
        it('should strip away all:true and replace with granular permissions',
            () => assert.deepEqual(result!.permissions, expectedPermissions));
    });

    context('if game privacy method is PrivacyMethod.LEGITIMATE_INTEREST', () => {
        let result: IRequestPrivacy | undefined;
        const anyPermissions = <IPermissions>{};
        beforeEach(() => {
            userPrivacy = new UserPrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST, version: 0, permissions: anyPermissions });
            gamePrivacy = new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST });
            result = RequestPrivacyFactory.create(userPrivacy, gamePrivacy);
        });
        it('should return undefined', () => assert.isUndefined(result));
    });

    context('when userPrivacy is modified', () => {
        const privacyParts = {
            gdprEnabled: true,
            optOutRecorded: false,
            optOutEnabled: false,
            gamePrivacy: {method: PrivacyMethod.UNITY_CONSENT},
            legalFramework: LegalFramework.GDPR
        };
        const newUserPrivacy = {
            method: PrivacyMethod.UNITY_CONSENT,
            permissions: {
                ads: true,
                external: true,
                gameExp: true},
            version: CurrentUnityConsentVersion};
        let privacySDK: PrivacySDK;
        beforeEach(() => {
            privacySDK = PrivacyParser.parse(<IRawAdsConfiguration>privacyParts, clientInfo, deviceInfo);
        });

        it('requestPrivacy should be unaltered by privacy changes', () => {
            const requestPrivacy = RequestPrivacyFactory.create(privacySDK.getUserPrivacy(), privacySDK.getGamePrivacy());
            assert.exists(requestPrivacy);
            assert.equal(requestPrivacy!.method, PrivacyMethod.UNITY_CONSENT);
            assert.equal(requestPrivacy!.firstRequest, true);
            assert.deepEqual(requestPrivacy!.permissions, {});
            privacySDK.getUserPrivacy().update(newUserPrivacy);
            assert.equal(requestPrivacy!.method, PrivacyMethod.UNITY_CONSENT);
            assert.equal(requestPrivacy!.firstRequest, true);
            assert.deepEqual(requestPrivacy!.permissions, {});
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
