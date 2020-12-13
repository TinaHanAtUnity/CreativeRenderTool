import { AgeGateChoice, GDPREventAction, GDPREventSource, LegalFramework, OptOutScope, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { GamePrivacy, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { StorageError, StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { Observable2 } from 'Core/Utilities/Observable';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ConsentPage } from 'Ads/Views/Privacy/Privacy';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import PrivacySDKFlow from 'json/privacy/PrivacySDKFlow.json';
import PrivacyWebUI from 'html/PrivacyWebUI.html';
describe('UserPrivacyManagerTest', () => {
    const testGameId = '12345';
    const testAdvertisingId = '128970986778678';
    const testUnityProjectId = 'game-1';
    const testBundleId = 'com.unity.ads.test';
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let deviceInfo;
    let clientInfo;
    let coreConfig;
    let adsConfig;
    let privacyManager;
    let gamePrivacy;
    let userPrivacy;
    let privacySDK;
    let request;
    let onSetStub;
    let getStub;
    let setStub;
    let writeStub;
    let updateUserPrivacy;
    let httpKafkaSpy;
    let privacyConsent = false;
    let gdprConsent = false;
    let isGDPREnabled = false;
    let storageTrigger;
    beforeEach(() => {
        privacyConsent = false;
        gdprConsent = false;
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        core.Storage.onSet = new Observable2();
        clientInfo = sinon.createStubInstance(ClientInfo);
        deviceInfo = sinon.createStubInstance(AndroidDeviceInfo);
        coreConfig = sinon.createStubInstance(CoreConfiguration);
        adsConfig = sinon.createStubInstance(AdsConfiguration);
        gamePrivacy = sinon.createStubInstance(GamePrivacy);
        privacySDK = sinon.createStubInstance(PrivacySDK);
        privacySDK.getGamePrivacy.returns(gamePrivacy);
        userPrivacy = sinon.createStubInstance(UserPrivacy);
        userPrivacy.getPermissions.returns({
            ads: false,
            gameExp: false,
            external: false,
            ageGateChoice: AgeGateChoice.MISSING,
            agreementMethod: ''
        });
        privacySDK.getUserPrivacy.returns(userPrivacy);
        request = sinon.createStubInstance(RequestManager);
        onSetStub = sinon.stub(core.Storage.onSet, 'subscribe');
        getStub = sinon.stub(core.Storage, 'get');
        setStub = sinon.stub(core.Storage, 'set').resolves();
        writeStub = sinon.stub(core.Storage, 'write').resolves();
        clientInfo.getGameId.returns(testGameId);
        clientInfo.getApplicationName.returns(testBundleId);
        deviceInfo.getAdvertisingIdentifier.returns(testAdvertisingId);
        coreConfig.getUnityProjectId.returns(testUnityProjectId);
        privacySDK.isGDPREnabled.callsFake(() => {
            return isGDPREnabled;
        });
        privacySDK.getLegalFramework.callsFake(() => {
            return isGDPREnabled ? LegalFramework.GDPR : LegalFramework.NONE;
        });
        httpKafkaSpy = sinon.stub(HttpKafka, 'sendEvent').resolves();
        getStub.withArgs(StorageType.PUBLIC, 'gdpr.consent.value').callsFake(() => {
            return Promise.resolve(gdprConsent);
        });
        getStub.withArgs(StorageType.PUBLIC, 'privacy.consent.value').callsFake(() => {
            return Promise.resolve(privacyConsent);
        });
        onSetStub.callsFake((fun) => {
            storageTrigger = fun;
        });
        privacySDK.getUserPrivacy.returns(userPrivacy);
        privacyManager = new UserPrivacyManager(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
        updateUserPrivacy = sinon.spy(privacyManager, 'updateUserPrivacy');
    });
    afterEach(() => {
        httpKafkaSpy.restore();
        isGDPREnabled = false;
    });
    it('should subscribe to Storage.onSet', () => {
        sinon.assert.calledOnce(onSetStub);
    });
    describe('when storage is set', () => {
        describe('and the consent value has changed', () => {
            const tests = [{
                    storedConsent: true,
                    event: GDPREventAction.DEVELOPER_CONSENT,
                    optOutEnabled: false,
                    optOutRecorded: true,
                    isGdprEnabled: true,
                    privacyEnabled: true,
                    privacyMethod: PrivacyMethod.DEVELOPER_CONSENT,
                    configUserPermissions: UserPrivacy.PERM_ALL_FALSE
                }, {
                    storedConsent: false,
                    event: GDPREventAction.DEVELOPER_OPTOUT,
                    optOutEnabled: true,
                    optOutRecorded: true,
                    isGdprEnabled: true,
                    privacyEnabled: true,
                    privacyMethod: PrivacyMethod.DEVELOPER_CONSENT,
                    configUserPermissions: UserPrivacy.PERM_DEVELOPER_CONSENTED
                }];
            tests.forEach((t) => {
                beforeEach(() => {
                    userPrivacy.getPermissions.returns(t.configUserPermissions);
                    userPrivacy.getMethod.returns(t.privacyMethod);
                    userPrivacy.getVersion.returns(0);
                });
                it(`subscribe should send "${t.event}" when "${t.storedConsent}"`, () => {
                    isGDPREnabled = t.isGdprEnabled;
                    storageTrigger('', { gdpr: { consent: { value: t.storedConsent } } });
                    return httpKafkaSpy.firstCall.returnValue.then(() => {
                        sinon.assert.calledOnce(onSetStub);
                        let expectedPermissions = UserPrivacy.PERM_DEVELOPER_CONSENTED;
                        if (t.optOutEnabled) {
                            expectedPermissions = UserPrivacy.PERM_ALL_FALSE;
                        }
                        sinon.assert.calledWithExactly(updateUserPrivacy, expectedPermissions, GDPREventSource.DEVELOPER, t.event);
                    });
                });
            });
        });
        describe('and configuration isGDPREnabled is false', () => {
            it('should not do anything', () => {
                isGDPREnabled = false;
                storageTrigger('', { gdpr: { consent: { value: true } } });
                sinon.assert.calledOnce(onSetStub);
                sinon.assert.notCalled(getStub);
                sinon.assert.notCalled(updateUserPrivacy);
                sinon.assert.notCalled(setStub);
                sinon.assert.notCalled(writeStub);
            });
        });
        describe('and the stored consent is undefined', () => {
            it('should not do anything', () => {
                storageTrigger('', {});
                sinon.assert.calledOnce(onSetStub);
                sinon.assert.notCalled(getStub);
                sinon.assert.notCalled(updateUserPrivacy);
                sinon.assert.notCalled(setStub);
                sinon.assert.notCalled(writeStub);
                sinon.assert.notCalled(privacySDK.setGDPREnabled);
            });
        });
        describe('and the stored consent has not changed', () => {
            [true, false].forEach((b) => {
                it(`should not send anything for value "${b}"`, () => {
                    isGDPREnabled = true;
                    gamePrivacy.getMethod.returns(PrivacyMethod.DEVELOPER_CONSENT);
                    gamePrivacy.getVersion.returns(0);
                    let currentPermissions = UserPrivacy.PERM_ALL_FALSE;
                    if (b) {
                        currentPermissions = UserPrivacy.PERM_DEVELOPER_CONSENTED;
                    }
                    userPrivacy.getPermissions.returns(currentPermissions);
                    userPrivacy.getMethod.returns(PrivacyMethod.DEVELOPER_CONSENT);
                    userPrivacy.getVersion.returns(0);
                    storageTrigger('', { gdpr: { consent: { value: b } } });
                    return Promise.resolve().then(() => {
                        return updateUserPrivacy.firstCall.returnValue.then(() => {
                            sinon.assert.notCalled(httpKafkaSpy);
                        });
                    });
                });
            });
        });
        describe('prioritises privacy.consent over gdpr.consent', () => {
            beforeEach(() => {
                isGDPREnabled = true;
                userPrivacy.getPermissions.returns({ ads: false, external: true, gameExp: false });
                userPrivacy.getMethod.returns(PrivacyMethod.DEVELOPER_CONSENT);
                userPrivacy.getVersion.returns(0);
                getStub.reset();
                getStub.withArgs(StorageType.PUBLIC, 'gdpr.consent.value').callsFake(() => {
                    if (gdprConsent === undefined) {
                        return Promise.reject(StorageError.COULDNT_GET_VALUE);
                    }
                    return Promise.resolve(gdprConsent);
                });
                getStub.withArgs(StorageType.PUBLIC, 'privacy.consent.value').callsFake(() => {
                    if (privacyConsent === undefined) {
                        return Promise.reject(StorageError.COULDNT_GET_VALUE);
                    }
                    return Promise.resolve(privacyConsent);
                });
            });
            after(() => {
                getStub.reset();
                getStub.withArgs(StorageType.PUBLIC, 'gdpr.consent.value').callsFake(() => {
                    return Promise.resolve(gdprConsent);
                });
                getStub.withArgs(StorageType.PUBLIC, 'privacy.consent.value').callsFake(() => {
                    return Promise.resolve(privacyConsent);
                });
            });
            describe('sets value according to privacy.consent', () => {
                [true, false].forEach((privacyConsentValue) => {
                    it('when privacy.consent = ' + privacyConsentValue, () => {
                        privacyConsent = privacyConsentValue;
                        return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                            const expectedPermissions = privacyConsentValue ? UserPrivacy.PERM_DEVELOPER_CONSENTED : UserPrivacy.PERM_ALL_FALSE;
                            sinon.assert.calledOnce(getStub);
                            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'privacy.consent.value');
                            sinon.assert.calledOnce(updateUserPrivacy);
                            sinon.assert.calledWith(updateUserPrivacy, expectedPermissions);
                        });
                    });
                });
            });
            describe('when privacy.consent has a bad value', () => {
                it('throws an error', () => {
                    privacyConsent = 'badValue';
                    return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                        assert.fail('Should throw');
                    }).catch((e) => {
                        sinon.assert.calledOnce(getStub);
                        sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'privacy.consent.value');
                        sinon.assert.notCalled(updateUserPrivacy);
                        assert.equal(e.message, 'privacy.consent.value is undefined');
                    });
                });
            });
            describe('when privacy.consent has not been set', () => {
                beforeEach(() => {
                    privacyConsent = undefined;
                });
                [true, false].forEach((gdprConsentValue) => {
                    it('gdpr.consent = ' + gdprConsentValue, () => {
                        gdprConsent = gdprConsentValue;
                        return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                            sinon.assert.calledTwice(getStub);
                            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'privacy.consent.value');
                            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
                            const expectedPermissions = gdprConsentValue ? UserPrivacy.PERM_DEVELOPER_CONSENTED : UserPrivacy.PERM_ALL_FALSE;
                            sinon.assert.calledOnce(updateUserPrivacy);
                            sinon.assert.calledWith(updateUserPrivacy, expectedPermissions);
                        });
                    });
                });
                it('gdpr.consent is not set, should throw', () => {
                    gdprConsent = undefined;
                    return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                        assert.fail('should throw');
                    }).catch((e) => {
                        sinon.assert.calledTwice(getStub);
                        sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'privacy.consent.value');
                        sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
                        sinon.assert.notCalled(updateUserPrivacy);
                        assert.equal(e, StorageError.COULDNT_GET_VALUE);
                    });
                });
                it('gdpr.consent is set to a bad value, should throw', () => {
                    gdprConsent = 'badValue';
                    return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                        assert.fail('should throw');
                    }).catch((e) => {
                        sinon.assert.calledTwice(getStub);
                        sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'privacy.consent.value');
                        sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
                        sinon.assert.notCalled(updateUserPrivacy);
                        assert.equal(e.message, 'gdpr.consent.value is undefined');
                    });
                });
            });
        });
    });
    describe('getConsentAndUpdateConfiguration', () => {
        describe('and consent is undefined', () => {
            it('should not update the configuration', () => {
                privacyConsent = undefined;
                return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                    assert.fail('should throw');
                }).catch(() => {
                    sinon.assert.notCalled(privacySDK.setGDPREnabled);
                    sinon.assert.notCalled(httpKafkaSpy);
                });
            });
        });
        describe('and consent has changed', () => {
            const tests = [{
                    lastConsent: false,
                    storedConsent: true,
                    event: GDPREventAction.DEVELOPER_CONSENT,
                    optOutEnabled: false,
                    optOutRecorded: true,
                    method: PrivacyMethod.DEVELOPER_CONSENT
                }, {
                    lastConsent: true,
                    storedConsent: false,
                    event: GDPREventAction.DEVELOPER_OPTOUT,
                    optOutEnabled: true,
                    optOutRecorded: true,
                    method: PrivacyMethod.LEGITIMATE_INTEREST
                }, {
                    lastConsent: 'false',
                    storedConsent: true,
                    event: GDPREventAction.DEVELOPER_CONSENT,
                    optOutEnabled: false,
                    optOutRecorded: true,
                    method: PrivacyMethod.DEVELOPER_CONSENT
                }, {
                    lastConsent: 'true',
                    storedConsent: false,
                    event: GDPREventAction.DEVELOPER_OPTOUT,
                    optOutEnabled: true,
                    optOutRecorded: true,
                    method: PrivacyMethod.DEVELOPER_CONSENT
                }];
            tests.forEach((t) => {
                it(`should send "${t.event}" when "${t.storedConsent}"`, () => {
                    isGDPREnabled = true;
                    gamePrivacy.getMethod.returns(t.method);
                    gamePrivacy.getVersion.returns(0);
                    let currentPermissions = UserPrivacy.PERM_ALL_FALSE;
                    if (t.lastConsent) {
                        currentPermissions = UserPrivacy.PERM_DEVELOPER_CONSENTED;
                    }
                    let expectedPermissions = UserPrivacy.PERM_ALL_FALSE;
                    if (t.storedConsent) {
                        expectedPermissions = UserPrivacy.PERM_DEVELOPER_CONSENTED;
                    }
                    userPrivacy.getPermissions.returns(currentPermissions);
                    userPrivacy.getMethod.returns(t.method);
                    userPrivacy.getVersion.returns(0);
                    privacyConsent = t.storedConsent;
                    return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                        return updateUserPrivacy.firstCall.returnValue.then(() => {
                            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'privacy.consent.value');
                            sinon.assert.calledWithExactly(updateUserPrivacy, expectedPermissions, GDPREventSource.DEVELOPER, t.event);
                        });
                    });
                });
            });
            describe('and configuration isGDPREnabled is set to false during getConsentAndUpdateConfiguration', () => {
                it('should not do anything', () => {
                    isGDPREnabled = true;
                    privacyConsent = true;
                    getStub.reset();
                    getStub.callsFake(() => {
                        isGDPREnabled = false;
                        return Promise.resolve(true);
                    });
                    return privacyManager.getConsentAndUpdateConfiguration().then((storedConsent) => {
                        assert.equal(storedConsent, true);
                        sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'privacy.consent.value');
                        sinon.assert.notCalled(updateUserPrivacy);
                        sinon.assert.notCalled(setStub);
                        sinon.assert.notCalled(writeStub);
                    });
                });
            });
            describe('and configuration isGDPREnabled is false', () => {
                it('should not do anything', () => {
                    isGDPREnabled = false;
                    const writePromise = new Promise((resolve) => {
                        writeStub.reset();
                        writeStub.callsFake(() => {
                            return Promise.resolve().then(resolve);
                        });
                    });
                    return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                        assert.fail('should throw');
                    }).catch((error) => {
                        assert.equal(error.message, 'Configuration gdpr is not enabled');
                        sinon.assert.notCalled(getStub);
                        sinon.assert.notCalled(updateUserPrivacy);
                        sinon.assert.notCalled(setStub);
                        sinon.assert.notCalled(writeStub);
                    });
                });
            });
            describe('and last consent has not been stored', () => {
                [[false, GDPREventAction.DEVELOPER_OPTOUT], [true, GDPREventAction.DEVELOPER_CONSENT]].forEach(([userConsents, event]) => {
                    it(`should send the last consent for ${userConsents}`, () => {
                        isGDPREnabled = true;
                        gamePrivacy.getMethod.returns(PrivacyMethod.DEVELOPER_CONSENT);
                        gamePrivacy.getVersion.returns(0);
                        userPrivacy.getPermissions.returns(UserPrivacy.PERM_ALL_FALSE);
                        userPrivacy.getMethod.returns(PrivacyMethod.DEFAULT);
                        userPrivacy.getVersion.returns(0);
                        privacyConsent = userConsents;
                        let expectedPermissions = UserPrivacy.PERM_ALL_FALSE;
                        if (userConsents) {
                            expectedPermissions = UserPrivacy.PERM_DEVELOPER_CONSENTED;
                        }
                        return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                            return updateUserPrivacy.firstCall.returnValue.then(() => {
                                sinon.assert.calledWithExactly(updateUserPrivacy, expectedPermissions, GDPREventSource.DEVELOPER, event);
                            });
                        });
                    });
                });
            });
        });
        describe('when limitAdTracking is enabled', () => {
            beforeEach(() => {
                let gamePrivacyMethod = PrivacyMethod.DEFAULT;
                isGDPREnabled = true;
                gamePrivacy.getMethod.callsFake(() => gamePrivacyMethod);
                gamePrivacy.setMethod.callsFake((value) => gamePrivacyMethod = value);
                gamePrivacy.getVersion.returns(0);
                deviceInfo.getLimitAdTracking.returns(true);
            });
            it('should override the configuration with no consent', () => {
                privacyConsent = true;
                return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                    sinon.assert.calledWith(gamePrivacy.setMethod, PrivacyMethod.DEVELOPER_CONSENT);
                    sinon.assert.calledWith(userPrivacy.update, {
                        method: PrivacyMethod.DEVELOPER_CONSENT,
                        version: 0,
                        permissions: {
                            gameExp: false,
                            ads: false,
                            external: false
                        }
                    });
                });
            });
        });
        describe('when game uses UNITY_CONSENT', () => {
            beforeEach(() => {
                isGDPREnabled = true;
                gamePrivacy.getMethod.returns(PrivacyMethod.UNITY_CONSENT);
            });
            it('should not override the configuration', () => {
                privacyConsent = undefined;
                return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                    assert.fail('should throw');
                }).catch(() => {
                    sinon.assert.notCalled(gamePrivacy.setMethod);
                });
            });
            it('should override the configuration if consent is given', () => {
                privacyConsent = false;
                return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                    sinon.assert.calledWith(gamePrivacy.setMethod, PrivacyMethod.DEVELOPER_CONSENT);
                }).catch(() => {
                    assert.fail('should not throw');
                });
            });
        });
    });
    describe('Fetch personal information', () => {
        let getRequestStub;
        let diagnosticTriggerStub;
        let logErrorStub;
        const gameId = '12345';
        const adId = '12345678-9ABC-DEF0-1234-56789ABCDEF0';
        const projectId = 'abcd-1234';
        const stores = 'xiaomi,google';
        const model = 'TestModel';
        const countryCode = 'FI';
        beforeEach(() => {
            getRequestStub = request.get;
            getRequestStub.resolves({ response: '{"adsSeenInGameThisWeek":27,"gamePlaysThisWeek":39,"installsFromAds":0}' });
            diagnosticTriggerStub = sinon.stub(Diagnostics, 'trigger');
            logErrorStub = sinon.stub(core.Sdk, 'logError');
            clientInfo.getGameId.returns(gameId);
            deviceInfo.getAdvertisingIdentifier.returns(adId);
            deviceInfo.getStores.returns(stores);
            deviceInfo.getModel.returns(model);
            coreConfig.getUnityProjectId.returns(projectId);
            coreConfig.getCountry.returns(countryCode);
        });
        afterEach(() => {
            diagnosticTriggerStub.restore();
        });
        it('should call request.get', () => {
            return privacyManager.retrieveUserSummary().then(() => {
                sinon.assert.calledWith(getRequestStub, `https://ads-privacy-api.prd.mz.internal.unity3d.com/api/v1/summary?gameId=${gameId}&adid=${adId}&projectId=${projectId}&storeId=${stores}`);
            });
        });
        it('should call request.get with testurl in testmode', () => {
            coreConfig.getTestMode.returns(true);
            return privacyManager.retrieveUserSummary().then(() => {
                sinon.assert.calledWith(getRequestStub, `https://ads-privacy-api.stg.mz.internal.unity3d.com/api/v1/summary?adid=f2c5a456-229f-49c8-abed-c4047c86f8e7&projectId=24295855-8602-4efc-a30d-a9d84b275eda&storeId=google&gameId=1490325`);
            });
        });
        it('verify response has personal payload', () => {
            return privacyManager.retrieveUserSummary().then((response) => {
                assert.equal(response.deviceModel, model);
                assert.equal(response.country, countryCode);
            });
        });
        it('should call diagnostics on error', () => {
            getRequestStub.reset();
            getRequestStub.rejects('Test Error');
            return privacyManager.retrieveUserSummary().then(() => {
                assert.fail('Should throw error');
            }).catch((error) => {
                assert.equal(error, 'Test Error');
            });
        });
        it('should call logError on error', () => {
            getRequestStub.reset();
            getRequestStub.rejects('Test Error');
            return privacyManager.retrieveUserSummary().then(() => {
                assert.fail('Should throw error');
            }).catch((error) => {
                assert.equal(error, 'Test Error');
                sinon.assert.calledWith(logErrorStub, 'User summary request failedTest Error');
            });
        });
    });
    describe('Sending privacy events', () => {
        let sandbox;
        const permissions = { ads: true, external: true, gameExp: false };
        const source = GDPREventSource.USER;
        const action = GDPREventAction.PERSONALIZED_PERMISSIONS;
        const layout = ConsentPage.MY_CHOICES;
        const gamePrivacyMethod = PrivacyMethod.UNITY_CONSENT;
        const country = 'FI';
        const subdivision = 'Korso';
        const abGroup = '1';
        const firstRequest = true;
        const agreedVersion = 20180614;
        const coppaCompliant = false;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            gamePrivacy.getMethod.returns(gamePrivacyMethod);
            gamePrivacy.getVersion.returns(agreedVersion);
            sandbox.stub(Math, 'random').returns(1);
            coreConfig.getCountry.returns(country);
            coreConfig.getSubdivision.returns(subdivision);
            coreConfig.getAbGroup.returns(abGroup);
            coreConfig.isCoppaCompliant.returns(coppaCompliant);
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('with proper fields', () => {
            const expectedKafkaObject = {
                v: 4,
                advertisingId: testAdvertisingId,
                abGroup: abGroup,
                layout: layout,
                userAction: action,
                projectId: testUnityProjectId,
                platform: 'android',
                country: country,
                subdivision: subdivision,
                gameId: testGameId,
                source: source,
                method: gamePrivacyMethod,
                agreedVersion: agreedVersion,
                coppa: coppaCompliant,
                firstRequest: firstRequest,
                bundleId: testBundleId,
                permissions: permissions,
                legalFramework: 'none',
                agreedOverAgeLimit: 'missing',
                ageGateSource: 'missing',
                scope: 'project'
            };
            return privacyManager.updateUserPrivacy(permissions, source, action, layout).then(() => {
                const sentKafkaObject = httpKafkaSpy.firstCall.args[2];
                assert.equal(httpKafkaSpy.firstCall.args[0], 'ads.events.optout.v1.json', 'privacy event sent to incorrect kafka topic');
                assert.equal(httpKafkaSpy.firstCall.args[1], KafkaCommonObjectType.EMPTY, 'incorrect kafka common object for privacy event');
                assert.deepEqual(sentKafkaObject, expectedKafkaObject, 'Expected message: ' + JSON.stringify(expectedKafkaObject) + ', got ' + JSON.stringify(sentKafkaObject));
            });
        });
    });
    describe('updateUserPrivacy', () => {
        const anyConsent = { gameExp: false, ads: false, external: false };
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            gamePrivacy.getMethod.returns(PrivacyMethod.UNITY_CONSENT);
            sandbox.stub(Math, 'random').returns(0);
            coreConfig.getCountry.returns('FI');
        });
        afterEach(() => {
            sandbox.restore();
        });
        describe('when updating user privacy', () => {
            function sendEvent(permissions = anyConsent, source = GDPREventSource.USER, layout) {
                return privacyManager.updateUserPrivacy(permissions, source, GDPREventAction.PERSONALIZED_PERMISSIONS, layout).then(() => {
                    sinon.assert.calledOnce(httpKafkaSpy);
                    return httpKafkaSpy.firstCall.args[2];
                });
            }
            it('should send event to a correct topic', () => {
                return sendEvent().then(() => {
                    sinon.assert.calledOnce(httpKafkaSpy);
                    sinon.assert.calledWith(httpKafkaSpy, 'ads.events.optout.v1.json', KafkaCommonObjectType.EMPTY);
                });
            });
            it('should send backwards-compatible event data', () => {
                return sendEvent(undefined, GDPREventSource.USER).then((eventData) => {
                    assert.isDefined(eventData);
                    assert.equal(eventData.advertisingId, testAdvertisingId);
                    assert.equal(eventData.userAction, GDPREventAction.PERSONALIZED_PERMISSIONS);
                    assert.equal(eventData.projectId, testUnityProjectId);
                    assert.equal(eventData.platform, 'android');
                    assert.equal(eventData.gameId, testGameId);
                    assert.equal(eventData.country, 'FI');
                    assert.equal(eventData.source, GDPREventSource.USER);
                });
            });
            it('should send new privacy fields', () => {
                const expectedPermissions = { gameExp: false, ads: true, external: true };
                coreConfig.isCoppaCompliant.returns(false);
                const expectedAbGroup = 19;
                coreConfig.getAbGroup.returns(expectedAbGroup);
                return sendEvent(expectedPermissions, GDPREventSource.USER).then((eventData) => {
                    assert.isDefined(eventData);
                    assert.equal(eventData.method, PrivacyMethod.UNITY_CONSENT);
                    assert.equal(eventData.version, gamePrivacy.getVersion());
                    assert.equal(eventData.coppa, false);
                    assert.equal(eventData.permissions, expectedPermissions);
                    assert.equal(eventData.abGroup, expectedAbGroup);
                    assert.equal(eventData.layout, '');
                    assert.equal(eventData.firstRequest, true);
                    assert.equal(eventData.v, 4);
                    assert.equal(eventData.agreedVersion, gamePrivacy.getVersion());
                    assert.equal(eventData.scope, OptOutScope.PROJECT_SCOPE);
                });
            });
            it('should send selected layout with consent event', () => {
                return sendEvent(undefined, GDPREventSource.USER, ConsentPage.HOMEPAGE).then((eventData) => {
                    assert.isDefined(eventData);
                    assert.equal(eventData.layout, ConsentPage.HOMEPAGE);
                });
            });
        });
        describe('should not update user privacy', () => {
            beforeEach(() => {
                gamePrivacy.getMethod.returns(PrivacyMethod.UNITY_CONSENT);
                gamePrivacy.getVersion.returns(25250101);
            });
            it('if game privacy is disabled', () => {
                gamePrivacy.getMethod.returns(PrivacyMethod.DEFAULT);
                return privacyManager.updateUserPrivacy(anyConsent, GDPREventSource.USER, GDPREventAction.PERSONALIZED_PERMISSIONS).then(() => {
                    sinon.assert.notCalled(httpKafkaSpy);
                });
            });
            it('if nothing changed', () => {
                const permissions = { gameExp: false, ads: true, external: true };
                userPrivacy.getMethod.returns(PrivacyMethod.UNITY_CONSENT);
                userPrivacy.getVersion.returns(25250101);
                userPrivacy.getPermissions.returns(permissions);
                return privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, GDPREventAction.PERSONALIZED_PERMISSIONS).then(() => {
                    sinon.assert.notCalled(httpKafkaSpy);
                });
            });
            it('if permissions=all was not changed', () => {
                userPrivacy.getMethod.returns(PrivacyMethod.UNITY_CONSENT);
                userPrivacy.getVersion.returns(25250101);
                userPrivacy.getPermissions.returns({ ads: true, gameExp: true, external: true });
                return privacyManager.updateUserPrivacy({ ads: true, gameExp: true, external: true }, GDPREventSource.USER_INDIRECT, GDPREventAction.PERSONALIZED_PERMISSIONS).then(() => {
                    sinon.assert.notCalled(httpKafkaSpy);
                });
            });
        });
    });
    describe('Setting developer_consent after Ads has been initialized', () => {
        beforeEach(() => {
            isGDPREnabled = true;
            privacyConsent = undefined;
            gdprConsent = undefined;
            userPrivacy.getPermissions.returns({ ads: false, external: true, gameExp: false });
            userPrivacy.getMethod.returns(PrivacyMethod.DEVELOPER_CONSENT);
            userPrivacy.getVersion.returns(0);
            getStub.withArgs(StorageType.PUBLIC, 'gdpr.consent.value').callsFake(() => {
                if (gdprConsent === undefined) {
                    return Promise.reject(StorageError.COULDNT_GET_VALUE);
                }
                return Promise.resolve(gdprConsent);
            });
            getStub.withArgs(StorageType.PUBLIC, 'privacy.consent.value').callsFake(() => {
                if (privacyConsent === undefined) {
                    return Promise.reject(StorageError.COULDNT_GET_VALUE);
                }
                return Promise.resolve(privacyConsent);
            });
        });
        after(() => {
            getStub.reset();
            getStub.withArgs(StorageType.PUBLIC, 'gdpr.consent.value').callsFake(() => {
                return Promise.resolve(gdprConsent);
            });
            getStub.withArgs(StorageType.PUBLIC, 'privacy.consent.value').callsFake(() => {
                return Promise.resolve(privacyConsent);
            });
        });
        [true, false, undefined].forEach((gdprInitDevConsent) => {
            describe('when developer consent was set on init with gdpr.consent=' + gdprInitDevConsent, () => {
                const allowedTransitions = [
                    { from: 'privacy', to: 'privacy' },
                    { from: 'gdpr', to: 'privacy' },
                    { from: 'gdpr', to: 'gdpr' }
                ];
                beforeEach(() => {
                    gdprConsent = gdprInitDevConsent;
                    return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                        sinon.assert.calledOnce(updateUserPrivacy);
                        httpKafkaSpy.resetHistory();
                        updateUserPrivacy.resetHistory();
                    }).catch((e) => {
                        if (gdprInitDevConsent !== undefined) {
                            assert.fail('Setting of metadata should not fail here ' + JSON.stringify(e));
                        }
                        sinon.assert.notCalled(updateUserPrivacy);
                    });
                });
                allowedTransitions.forEach((transition) => {
                    describe('it updates ' + transition.from + '-metadatas based on ' + transition.to + '-metadatas', () => {
                        [true, false].forEach((firstConsent) => {
                            [true, false].forEach((secondConsent) => {
                                it('from ' + firstConsent + ' to ' + secondConsent, () => {
                                    const firstTrigger = {};
                                    firstTrigger[transition.from] = { consent: { value: firstConsent } };
                                    const expectedFirstPermissions = firstConsent ? UserPrivacy.PERM_DEVELOPER_CONSENTED : UserPrivacy.PERM_ALL_FALSE;
                                    storageTrigger('', firstTrigger);
                                    return httpKafkaSpy.firstCall.returnValue.then(() => {
                                        sinon.assert.calledOnce(updateUserPrivacy);
                                        sinon.assert.calledWith(updateUserPrivacy, expectedFirstPermissions);
                                        const secondTrigger = {};
                                        secondTrigger[transition.to] = { consent: { value: secondConsent } };
                                        const expectedSecondPermissions = secondConsent ? UserPrivacy.PERM_DEVELOPER_CONSENTED : UserPrivacy.PERM_ALL_FALSE;
                                        storageTrigger('', secondTrigger);
                                        return httpKafkaSpy.secondCall.returnValue.then(() => {
                                            sinon.assert.calledTwice(updateUserPrivacy);
                                            sinon.assert.calledWith(updateUserPrivacy, expectedSecondPermissions);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
                describe('it does not update privacy-metadatas with gdpr-metadatas', () => {
                    [true, false].forEach((firstConsent) => {
                        [true, false].forEach((secondConsent) => {
                            it('from ' + firstConsent + ' to ' + secondConsent, () => {
                                const firstTrigger = { privacy: { consent: { value: firstConsent } } };
                                const expectedFirstPermissions = firstConsent ? UserPrivacy.PERM_DEVELOPER_CONSENTED : UserPrivacy.PERM_ALL_FALSE;
                                storageTrigger('', firstTrigger);
                                return httpKafkaSpy.firstCall.returnValue.then(() => {
                                    sinon.assert.calledOnce(updateUserPrivacy);
                                    sinon.assert.calledWith(updateUserPrivacy, expectedFirstPermissions);
                                    httpKafkaSpy.resetHistory();
                                    updateUserPrivacy.resetHistory();
                                    const secondTrigger = { gdpr: { consent: { value: firstConsent } } };
                                    storageTrigger('', secondTrigger);
                                    sinon.assert.notCalled(httpKafkaSpy);
                                    sinon.assert.notCalled(updateUserPrivacy);
                                });
                            });
                        });
                    });
                });
            });
        });
        [true, false].forEach((privacyInitDevConsent) => {
            describe('when developer consent was set on init with privacy.consent=' + privacyInitDevConsent, () => {
                beforeEach(() => {
                    privacyConsent = privacyInitDevConsent;
                    return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                        sinon.assert.calledOnce(updateUserPrivacy);
                        httpKafkaSpy.resetHistory();
                        updateUserPrivacy.resetHistory();
                    });
                });
                [true, false].forEach((consent) => {
                    it('it does not update with gdpr.consent=' + consent, () => {
                        const trigger = { gdpr: { consent: { value: consent } } };
                        storageTrigger('', trigger);
                        sinon.assert.notCalled(httpKafkaSpy);
                        sinon.assert.notCalled(updateUserPrivacy);
                    });
                    it('updates with privacy.consent=' + consent, () => {
                        const trigger = { privacy: { consent: { value: consent } } };
                        const expectedPermissions = consent ? UserPrivacy.PERM_DEVELOPER_CONSENTED : UserPrivacy.PERM_ALL_FALSE;
                        storageTrigger('', trigger);
                        return httpKafkaSpy.firstCall.returnValue.then(() => {
                            sinon.assert.calledOnce(updateUserPrivacy);
                            sinon.assert.calledWith(updateUserPrivacy, expectedPermissions);
                        });
                    });
                });
            });
        });
    });
    describe('getPrivacyConfig', () => {
        it('Returns a non-null object', () => {
            assert.isNotNull(privacyManager.getPrivacyConfig());
        });
        describe('Returned object has proper values', () => {
            it('getFlow', () => {
                assert.deepEqual(privacyManager.getPrivacyConfig().getFlow(), PrivacySDKFlow);
            });
            it('getEnv', () => {
                assert.isNotNull(privacyManager.getPrivacyConfig().getEnv());
            });
            it('getUserSettings', () => {
                assert.deepEqual(privacyManager.getPrivacyConfig().getUserSettings(), {
                    ads: false,
                    external: false,
                    gameExp: false,
                    ageGateChoice: AgeGateChoice.MISSING,
                    agreementMethod: ''
                });
            });
            it('getHtml', () => {
                assert.equal(privacyManager.getPrivacyConfig().getHtml(), PrivacyWebUI);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclByaXZhY3lNYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvVXNlclByaXZhY3lNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0gsYUFBYSxFQUNiLGVBQWUsRUFDZixlQUFlLEVBQ2YsY0FBYyxFQUFFLFdBQVcsRUFDM0Isa0JBQWtCLEVBQ3JCLE1BQU0saUNBQWlDLENBQUM7QUFDekMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFdBQVcsRUFBdUIsYUFBYSxFQUFFLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRS9GLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFHbEUsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzVFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSww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