import {assert} from 'chai';
import 'mocha';
import {ILegacyRequestPrivacy, IRequestPrivacy, RequestPrivacyFactory} from 'Ads/Models/RequestPrivacy';
import {GamePrivacy, IPermissions, PrivacyMethod, UserPrivacy} from 'Ads/Models/Privacy';

describe('RequestPrivacyFactoryTests', () => {
    let userPrivacy: UserPrivacy;
    let gamePrivacy: GamePrivacy;

    const consentMethods = [PrivacyMethod.UNITY_CONSENT, PrivacyMethod.DEVELOPER_CONSENT];

    consentMethods.forEach((method) => {
        context('for a game using ' + method, () => {
            context('when no previous user privacy is recorded', () => {
                let result: IRequestPrivacy | undefined;
                beforeEach(() => {
                    userPrivacy = new UserPrivacy({ method: PrivacyMethod.DEFAULT, version: 0, permissions: { profiling: false } });
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
            userPrivacy = new UserPrivacy({ method: PrivacyMethod.UNITY_CONSENT, version: 0, permissions: { all: true} });
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
});

describe('LegacyRequestPrivacyTests', () => {
    const anyMethod = PrivacyMethod.DEVELOPER_CONSENT;

    context('optOutRecorded', () => {
        it('should set optOutRecorded true if not the first request', () => {
            const result = RequestPrivacyFactory.createLegacy({ method: anyMethod, firstRequest: false, permissions: {}});
            assert.equal(result.optOutRecorded, true);
        });

        it('should set optOutRecorded false if the first request', () => {
            const result = RequestPrivacyFactory.createLegacy({ method: anyMethod, firstRequest: true, permissions: {}});
            assert.equal(result.optOutRecorded, false);
        });
    });

    context('when privacy method is DEFAULT (e.g. user has never played inside EU)', () => {
        let result: ILegacyRequestPrivacy;
        beforeEach(() => {
            const requestPrivacy = { method: PrivacyMethod.DEFAULT, firstRequest: true, permissions: {}};
            result = RequestPrivacyFactory.createLegacy(requestPrivacy);
        });
        it('should set gdprEnabled false', () => assert.equal(result.gdprEnabled, false));
        it('should set optOutRecorded false', () => assert.equal(result.optOutEnabled, false));
        it('should set optOutEnabled false', () => assert.equal(result.optOutEnabled, false));
    });

    context('when privacy method is UNITY_CONSENT', () => {
        let result: ILegacyRequestPrivacy;
        beforeEach(() => {
            const requestPrivacy = { method: PrivacyMethod.UNITY_CONSENT, firstRequest: false, permissions: {}};
            result = RequestPrivacyFactory.createLegacy(requestPrivacy);
        });
        it('should set gdprEnabled true', () => assert.equal(result.gdprEnabled, true));
        it('should set optOutEnabled true', () => assert.equal(result.optOutEnabled, true));
    });

    it('should set optOutEnabled false for first request if LEGITIMATE_INTEREST', () => {
        const result = RequestPrivacyFactory.createLegacy({ method: PrivacyMethod.LEGITIMATE_INTEREST, firstRequest: true, permissions: {}});
        assert.equal(result.optOutRecorded, false);
        assert.equal(result.optOutEnabled, false);
    });

    it('should set optOutEnabled based on permissions for first request if DEVELOPER_CONSENT', () => {
        const result = RequestPrivacyFactory.createLegacy({ method: PrivacyMethod.DEVELOPER_CONSENT, firstRequest: true, permissions: { profiling: false }});
        assert.equal(result.optOutRecorded, false);
        assert.equal(result.optOutEnabled, true);
    });

    context('when privacy method is LEGITIMATE_INTEREST or DEVELOPER_CONSENT', () => {
        let result: ILegacyRequestPrivacy;
        context('and user has given permission for profiling', () => {
            beforeEach(() => {
                const requestPrivacy = { method: anyMethod, firstRequest: false, permissions: { profiling: true } };
                result = RequestPrivacyFactory.createLegacy(requestPrivacy);
            });
            it('should set gdprEnabled true', () => assert.equal(result.gdprEnabled, true));
            it('should set optOutRecorded true', () => assert.equal(result.optOutRecorded, true));
            it('should set optOutEnabled false', () => assert.equal(result.optOutEnabled, false));
        });

        context('and user has denied permission for profiling', () => {
            beforeEach(() => {
                const requestPrivacy = { method: anyMethod, firstRequest: false, permissions: { profiling: false } };
                result = RequestPrivacyFactory.createLegacy(requestPrivacy);
            });
            it('should set gdprEnabled true', () => assert.equal(result.gdprEnabled, true));
            it('should set optOutRecorded true', () => assert.equal(result.optOutRecorded, true));
            it('should set optOutEnabled false', () => assert.equal(result.optOutEnabled, true));
        });
    });
});
