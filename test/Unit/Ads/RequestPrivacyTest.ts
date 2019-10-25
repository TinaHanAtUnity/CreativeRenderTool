import {assert} from 'chai';
import 'mocha';
import {ILegacyRequestPrivacy, IRequestPrivacy, RequestPrivacyFactory} from 'Ads/Models/RequestPrivacy';
import {GamePrivacy, IPermissions, IProfilingPermissions, PrivacyMethod, UserPrivacy} from 'Privacy/Privacy';
import {toAbGroup} from 'Core/Models/ABGroup';

describe('RequestPrivacyFactoryTests', () => {
    let userPrivacy: UserPrivacy;
    let gamePrivacy: GamePrivacy;

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
                    userPrivacy = new UserPrivacy({ method: method, version: 20190101, agreedAll: false, permissions: expectedPermissions });
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
                    userPrivacy = new UserPrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST, agreedAll: false, version: 0, permissions: anyPermissions });
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
            userPrivacy = new UserPrivacy({ method: PrivacyMethod.UNITY_CONSENT, version: 0, agreedAll: true, permissions: expectedPermissions });
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
            userPrivacy = new UserPrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST, agreedAll: false, version: 0, permissions: anyPermissions });
            gamePrivacy = new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST });
            result = RequestPrivacyFactory.create(userPrivacy, gamePrivacy);
        });
        it('should return undefined', () => assert.isUndefined(result));
    });
});
