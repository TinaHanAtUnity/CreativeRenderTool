import {
    AgeGateChoice,
    GDPREventAction,
    GDPREventSource,
    LegalFramework, OptOutScope,
    UserPrivacyManager
} from 'Ads/Managers/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { GamePrivacy, IPrivacyPermissions, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
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
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
    let privacyManager: UserPrivacyManager;
    let gamePrivacy: sinon.SinonStubbedInstance<GamePrivacy>;
    let userPrivacy: sinon.SinonStubbedInstance<UserPrivacy>;
    let privacySDK: sinon.SinonStubbedInstance<PrivacySDK>;
    let request: RequestManager;

    let onSetStub: sinon.SinonStub;
    let getStub: sinon.SinonStub;
    let setStub: sinon.SinonStub;
    let writeStub: sinon.SinonStub;
    let updateUserPrivacy: sinon.SinonSpy;
    let httpKafkaSpy: sinon.SinonStub;

    let privacyConsent: any = false;
    let gdprConsent: any = false;
    let isGDPREnabled: boolean = false;
    let storageTrigger: (eventType: string, data: any) => void;

    beforeEach(() => {
        privacyConsent = false;
        gdprConsent = false;

        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        (<any>core.Storage).onSet = new Observable2<string, object>();

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

        (<sinon.SinonStub>clientInfo.getGameId).returns(testGameId);
        (<sinon.SinonStub>clientInfo.getApplicationName).returns(testBundleId);
        (<sinon.SinonStub>deviceInfo.getAdvertisingIdentifier).returns(testAdvertisingId);
        (<sinon.SinonStub>coreConfig.getUnityProjectId).returns(testUnityProjectId);
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
        privacyManager = new UserPrivacyManager(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, request, <PrivacySDK><unknown>privacySDK);
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
            const tests: {
                storedConsent: boolean;
                event: string;
                optOutEnabled: boolean;
                optOutRecorded: boolean;
                isGdprEnabled: boolean;
                privacyEnabled: boolean;
                privacyMethod: PrivacyMethod;
                configUserPermissions: IPrivacyPermissions;
            }[] = [{
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

                    return (<Promise<void>>httpKafkaSpy.firstCall.returnValue).then(() => {
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
                        return (<Promise<void>>updateUserPrivacy.firstCall.returnValue).then(() => {
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
            const tests: {
                lastConsent: boolean | string;
                storedConsent: boolean;
                event: string;
                optOutEnabled: boolean;
                optOutRecorded: boolean;
                method: PrivacyMethod;
            }[] = [{
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
                        return (<Promise<void>>updateUserPrivacy.firstCall.returnValue).then(() => {
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
                    return privacyManager.getConsentAndUpdateConfiguration().then((storedConsent: boolean) => {
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
                    const writePromise = new Promise<void>((resolve) => {
                        writeStub.reset();
                        writeStub.callsFake(() => {
                            return Promise.resolve().then(resolve);
                        });
                    });
                    return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                        assert.fail('should throw');
                    }).catch((error: Error) => {
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
                            return (<Promise<void>>updateUserPrivacy.firstCall.returnValue).then(() => {
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
                (<sinon.SinonStub>deviceInfo.getLimitAdTracking).returns(true);
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

        let getRequestStub: sinon.SinonStub;
        let diagnosticTriggerStub: sinon.SinonStub;
        let logErrorStub: sinon.SinonStub;

        const gameId = '12345';
        const adId = '12345678-9ABC-DEF0-1234-56789ABCDEF0';
        const projectId = 'abcd-1234';
        const stores = 'xiaomi,google';
        const model = 'TestModel';
        const countryCode = 'FI';

        beforeEach(() => {
            getRequestStub = <sinon.SinonStub>request.get;
            getRequestStub.resolves({ response: '{"adsSeenInGameThisWeek":27,"gamePlaysThisWeek":39,"installsFromAds":0}' });
            diagnosticTriggerStub = sinon.stub(Diagnostics, 'trigger');
            logErrorStub = sinon.stub(core.Sdk, 'logError');

            (<sinon.SinonStub>clientInfo.getGameId).returns(gameId);
            (<sinon.SinonStub>deviceInfo.getAdvertisingIdentifier).returns(adId);
            (<sinon.SinonStub>deviceInfo.getStores).returns(stores);
            (<sinon.SinonStub>deviceInfo.getModel).returns(model);
            (<sinon.SinonStub>coreConfig.getUnityProjectId).returns(projectId);
            (<sinon.SinonStub>coreConfig.getCountry).returns(countryCode);
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
            (<sinon.SinonStub>coreConfig.getTestMode).returns(true);
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
        let sandbox: sinon.SinonSandbox;
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
            (<sinon.SinonStub>coreConfig.getCountry).returns(country);
            (<sinon.SinonStub>coreConfig.getSubdivision).returns(subdivision);
            (<sinon.SinonStub>coreConfig.getAbGroup).returns(abGroup);
            (<sinon.SinonStub>coreConfig.isCoppaCompliant).returns(coppaCompliant);
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('with proper fields', () => {
            const expectedKafkaObject = {
                v: 3,
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
                ageGateSource: 'missing'
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
        const anyConsent: IPrivacyPermissions = { gameExp: false, ads: false, external: false };
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            gamePrivacy.getMethod.returns(PrivacyMethod.UNITY_CONSENT);
            sandbox.stub(Math, 'random').returns(0);
            (<sinon.SinonStub>coreConfig.getCountry).returns('FI');
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('when updating user privacy', () => {
            function sendEvent(permissions: IPrivacyPermissions = anyConsent, source: GDPREventSource = GDPREventSource.USER, layout?: ConsentPage): Promise<any> {
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
                const expectedPermissions: IPrivacyPermissions = { gameExp: false, ads: true, external: true };
                (<sinon.SinonStub>coreConfig.isCoppaCompliant).returns(false);

                const expectedAbGroup = 19;
                (<sinon.SinonStub>coreConfig.getAbGroup).returns(expectedAbGroup);

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
                    assert.equal(eventData.scalable, OptOutScope.PROJECT_SCOPE);
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
                    { from: 'gdpr', to: 'gdpr' }];
                beforeEach(() => {
                    gdprConsent = gdprInitDevConsent;
                    return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                        sinon.assert.calledOnce(updateUserPrivacy);
                        httpKafkaSpy.resetHistory();
                        updateUserPrivacy.resetHistory();
                    }).catch ((e) => {
                        if (gdprInitDevConsent !== undefined) {
                            assert.fail('Setting of metadata should not fail here ' + JSON.stringify(e));
                        }
                        sinon.assert.notCalled(updateUserPrivacy);
                    });
                });
                allowedTransitions.forEach((transition: {from: string; to: string}) => {
                    describe('it updates ' + transition.from + '-metadatas based on ' + transition.to + '-metadatas', () => {
                        [true, false].forEach((firstConsent) => {
                            [true, false].forEach((secondConsent) => {
                                it('from ' + firstConsent + ' to ' + secondConsent, () => {
                                    const firstTrigger: {[index: string]: any} = {};
                                    firstTrigger[transition.from] = { consent: { value: firstConsent } };
                                    const expectedFirstPermissions = firstConsent ? UserPrivacy.PERM_DEVELOPER_CONSENTED : UserPrivacy.PERM_ALL_FALSE;
                                    storageTrigger('', firstTrigger);
                                    return (<Promise<void>>httpKafkaSpy.firstCall.returnValue).then(() => {
                                        sinon.assert.calledOnce(updateUserPrivacy);
                                        sinon.assert.calledWith(updateUserPrivacy, expectedFirstPermissions);

                                        const secondTrigger: {[index: string]: any} = {};
                                        secondTrigger[transition.to] = { consent: { value: secondConsent } };
                                        const expectedSecondPermissions = secondConsent ? UserPrivacy.PERM_DEVELOPER_CONSENTED : UserPrivacy.PERM_ALL_FALSE;
                                        storageTrigger('', secondTrigger);
                                        return (<Promise<void>>httpKafkaSpy.secondCall.returnValue).then(() => {
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
                                return (<Promise<void>>httpKafkaSpy.firstCall.returnValue).then(() => {
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
                        return (<Promise<void>>httpKafkaSpy.firstCall.returnValue).then(() => {
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
