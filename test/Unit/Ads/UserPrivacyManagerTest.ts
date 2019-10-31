import { GDPREventAction, GDPREventSource, LegalFramework, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { GamePrivacy, IGranularPermissions, IPermissions, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
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
import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { Observable2 } from 'Core/Utilities/Observable';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ConsentPage } from 'Ads/Views/Consent/Consent';
import { PrivacySDK } from 'Privacy/PrivacySDK';

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

    let consentlastsent: boolean | string = false;
    let consent: any = false;
    let isGDPREnabled: boolean = false;
    let storageTrigger: (eventType: string, data: any) => void;

    beforeEach(() => {
        consentlastsent = false;
        consent = false;

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
        (<sinon.SinonStub>privacySDK.getGamePrivacy).returns(gamePrivacy);
        userPrivacy = sinon.createStubInstance(UserPrivacy);
        (<sinon.SinonStub>privacySDK.getUserPrivacy).returns(userPrivacy);

        request = sinon.createStubInstance(RequestManager);

        onSetStub = sinon.stub(core.Storage.onSet, 'subscribe');
        getStub = sinon.stub(core.Storage, 'get');
        setStub = sinon.stub(core.Storage, 'set').resolves();
        writeStub = sinon.stub(core.Storage, 'write').resolves();

        (<sinon.SinonStub>clientInfo.getGameId).returns(testGameId);
        (<sinon.SinonStub>clientInfo.getApplicationName).returns(testBundleId);
        (<sinon.SinonStub>deviceInfo.getAdvertisingIdentifier).returns(testAdvertisingId);
        (<sinon.SinonStub>coreConfig.getUnityProjectId).returns(testUnityProjectId);
        (<sinon.SinonStub>privacySDK.isGDPREnabled).callsFake(() => {
            return isGDPREnabled;
        });
        (<sinon.SinonStub>privacySDK.getLegalFramework).callsFake(() => {
            return isGDPREnabled ? LegalFramework.GDPR : LegalFramework.DEFAULT;
        });

        httpKafkaSpy = sinon.stub(HttpKafka, 'sendEvent').resolves();

        getStub.withArgs(StorageType.PRIVATE, 'gdpr.consentlastsent').callsFake(() => {
            return Promise.resolve(consentlastsent);
        });
        getStub.withArgs(StorageType.PUBLIC, 'gdpr.consent.value').callsFake(() => {
            return Promise.resolve(consent);
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
                configUserPermissions: IGranularPermissions;
            }[] = [{
                storedConsent: true,
                event: 'consent',
                optOutEnabled: false,
                optOutRecorded: true,
                isGdprEnabled: true,
                privacyEnabled: true,
                privacyMethod: PrivacyMethod.DEVELOPER_CONSENT,
                configUserPermissions: {ads: false, external: false, gameExp: false}
            }, {
                storedConsent: false,
                event: 'optout',
                optOutEnabled: true,
                optOutRecorded: true,
                isGdprEnabled: true,
                privacyEnabled: true,
                privacyMethod: PrivacyMethod.DEVELOPER_CONSENT,
                configUserPermissions: {ads: true, external: true, gameExp: false}
            }];

            tests.forEach((t) => {
                beforeEach(() => {
                    gamePrivacy.isEnabled.returns(t.privacyEnabled);
                    userPrivacy.getPermissions.returns(t.configUserPermissions);
                    userPrivacy.getMethod.returns(t.privacyMethod);
                    userPrivacy.getVersion.returns(0);
                });
                it(`subscribe should send "${t.event}" when "${t.storedConsent}"`, () => {
                    isGDPREnabled = t.isGdprEnabled;
                    storageTrigger('', { gdpr: { consent: { value: t.storedConsent } } });

                    return (<Promise<void>>httpKafkaSpy.firstCall.returnValue).then(() => {
                        sinon.assert.calledOnce(onSetStub);
                        sinon.assert.calledWithExactly(updateUserPrivacy, {ads: !t.optOutEnabled, external: !t.optOutEnabled, gameExp: false}, GDPREventSource.DEVELOPER, t.event);
                    });
                });
            });
        });

        describe('and configuration isGDPREnabled is false', () => {
            it('should not do anything', () => {
                isGDPREnabled = false;
                consentlastsent = false;
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
                sinon.assert.notCalled(<sinon.SinonStub>privacySDK.setGDPREnabled);
            });
        });

        describe('and the stored consent has not changed', () => {
            [true, false].forEach((b) => {
                it(`should not send anything for value "${b}"`, () => {
                    isGDPREnabled = true;
                    gamePrivacy.isEnabled.returns(true);
                    gamePrivacy.getMethod.returns(PrivacyMethod.DEVELOPER_CONSENT);
                    gamePrivacy.getVersion.returns(0);
                    userPrivacy.getPermissions.returns({ads: b, external: b, gameExp: false});
                    userPrivacy.getMethod.returns(PrivacyMethod.DEVELOPER_CONSENT);
                    userPrivacy.getVersion.returns(0);
                    storageTrigger('', {gdpr: {consent: {value: b}}});
                    return Promise.resolve().then(() => {
                        return (<Promise<void>>updateUserPrivacy.firstCall.returnValue).then(() => {
                            sinon.assert.notCalled(httpKafkaSpy);
                        });
                    });
                });
            });
        });
    });

    describe('getConsentAndUpdateConfiguration', () => {
        describe('and consent is undefined', () => {
            it('should not update the configuration', () => {
                consent = undefined;
                return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                    assert.fail('should throw');
                }).catch(() => {
                    sinon.assert.notCalled(<sinon.SinonStub>privacySDK.setGDPREnabled);
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
                event: 'consent',
                optOutEnabled: false,
                optOutRecorded: true,
                method: PrivacyMethod.DEVELOPER_CONSENT
            }, {
                lastConsent: true,
                storedConsent: false,
                event: 'optout',
                optOutEnabled: true,
                optOutRecorded: true,
                method: PrivacyMethod.LEGITIMATE_INTEREST
            }, {
                lastConsent: 'false',
                storedConsent: true,
                event: 'consent',
                optOutEnabled: false,
                optOutRecorded: true,
                method: PrivacyMethod.DEVELOPER_CONSENT
            }, {
                lastConsent: 'true',
                storedConsent: false,
                event: 'optout',
                optOutEnabled: true,
                optOutRecorded: true,
                method: PrivacyMethod.DEVELOPER_CONSENT
            }];

            tests.forEach((t) => {
                it(`should send "${t.event}" when "${t.storedConsent}"`, () => {
                    isGDPREnabled = true;
                    gamePrivacy.isEnabled.returns(true);
                    gamePrivacy.getMethod.returns(t.method);
                    gamePrivacy.getVersion.returns(0);
                    userPrivacy.getPermissions.returns({ads: t.lastConsent, external: t.lastConsent, gameExp: false});
                    userPrivacy.getMethod.returns(t.method);
                    userPrivacy.getVersion.returns(0);
                    consentlastsent = t.lastConsent;
                    consent = t.storedConsent;

                    return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                        return (<Promise<void>>updateUserPrivacy.firstCall.returnValue).then(() => {
                            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
                            sinon.assert.calledWithExactly(updateUserPrivacy, {ads: t.storedConsent, external: t.storedConsent, gameExp: false}, GDPREventSource.DEVELOPER, t.event);
                        });
                    });
                });
            });

            describe('and configuration isGDPREnabled is set to false during getConsentAndUpdateConfiguration', () => {
                it('should not do anything', () => {
                    isGDPREnabled = true;
                    consentlastsent = false;
                    consent = true;
                    getStub.reset();
                    getStub.callsFake(() => {
                        isGDPREnabled = false;
                        return Promise.resolve(true);
                    });
                    return privacyManager.getConsentAndUpdateConfiguration().then((storedConsent: boolean) => {
                        assert.equal(storedConsent, true);
                        sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
                        sinon.assert.notCalled(updateUserPrivacy);
                        sinon.assert.notCalled(setStub);
                        sinon.assert.notCalled(writeStub);
                    });
                });
            });

            describe('and configuration isGDPREnabled is false', () => {
                it('should not do anything', () => {
                    isGDPREnabled = false;
                    consentlastsent = false;
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
                [[false, 'optout'], [true, 'consent']].forEach(([userConsents, event]) => {
                    it(`should send the last consent for ${userConsents}`, () => {
                        isGDPREnabled = true;
                        gamePrivacy.isEnabled.returns(true);
                        gamePrivacy.getMethod.returns(PrivacyMethod.DEVELOPER_CONSENT);
                        gamePrivacy.getVersion.returns(0);
                        userPrivacy.getPermissions.returns({ads: false, external: false, gameExp: false});
                        userPrivacy.getMethod.returns(PrivacyMethod.DEFAULT);
                        userPrivacy.getVersion.returns(0);
                        consent = userConsents;

                        return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                            return (<Promise<void>>updateUserPrivacy.firstCall.returnValue).then(() => {
                                sinon.assert.calledWithExactly(updateUserPrivacy, {ads: userConsents, external: userConsents, gameExp: false}, GDPREventSource.DEVELOPER, event);
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
                gamePrivacy.isEnabled.returns(true);
                gamePrivacy.getMethod.callsFake(() => gamePrivacyMethod);
                gamePrivacy.setMethod.callsFake((value) => gamePrivacyMethod = value);
                gamePrivacy.getVersion.returns(0);
                (<sinon.SinonStub>deviceInfo.getLimitAdTracking).returns(true);
            });

            it('should override the configuration with no consent', () => {
                consent = true;
                return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                    sinon.assert.calledWith(gamePrivacy.setMethod, PrivacyMethod.DEVELOPER_CONSENT);
                    sinon.assert.calledWith(userPrivacy.update, {
                        method: PrivacyMethod.DEVELOPER_CONSENT,
                        version: 0,
                        agreedAll: false,
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
                gamePrivacy.isEnabled.returns(true);
                gamePrivacy.getMethod.returns(PrivacyMethod.UNITY_CONSENT);
            });

            it('should not override the configuration', () => {
                consent = undefined;
                return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                    assert.fail('should throw');
                }).catch(() => {
                    sinon.assert.notCalled(gamePrivacy.setMethod);
                });
            });

            it('should override the configuration if consent is given', () => {
                consent = false;
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
            getRequestStub.resolves({response: '{"adsSeenInGameThisWeek":27,"gamePlaysThisWeek":39,"installsFromAds":0}'});
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
                sinon.assert.calledWith(diagnosticTriggerStub, 'gdpr_request_failed', {url: `https://ads-privacy-api.prd.mz.internal.unity3d.com/api/v1/summary?gameId=${gameId}&adid=${adId}&projectId=${projectId}&storeId=${stores}`});
            });
        });

        it('should call logError on error', () => {
            getRequestStub.reset();
            getRequestStub.rejects('Test Error');
            return privacyManager.retrieveUserSummary().then(() => {
                assert.fail('Should throw error');
            }).catch((error) => {
                assert.equal(error, 'Test Error');
                sinon.assert.calledWith(logErrorStub, 'Gdpr request failedTest Error');
            });
        });
    });

    describe('Sending gdpr events', () => {
        const tests: {
            action: GDPREventAction;
            source: GDPREventSource | undefined;
            infoJson: any;
        }[] = [{
            action: GDPREventAction.SKIP,
            source: undefined,
            infoJson: {
                'v': 1,
                'adid': testAdvertisingId,
                'action': 'skip',
                'projectId': testUnityProjectId,
                'platform': 'android',
                'country': 'FF',
                'gameId': testGameId,
                'bundleId': testBundleId,
                'legalFramework': 'gdpr',
                'agreedOverAgeLimit': 'missing'
            }
        }, {
            action: GDPREventAction.CONSENT,
            source: undefined,
            infoJson: {
                'v': 1,
                'adid': testAdvertisingId,
                'action': 'consent',
                'projectId': testUnityProjectId,
                'platform': 'android',
                'country': 'FF',
                'gameId': testGameId,
                'bundleId': testBundleId,
                'legalFramework': 'gdpr',
                'agreedOverAgeLimit': 'missing'
            }
        }, {
            action: GDPREventAction.OPTOUT,
            source: undefined,
            infoJson: {
                'v': 1,
                'adid': testAdvertisingId,
                'action': 'optout',
                'projectId': testUnityProjectId,
                'platform': 'android',
                'country': 'FF',
                'gameId': testGameId,
                'bundleId': testBundleId,
                'legalFramework': 'gdpr',
                'agreedOverAgeLimit': 'missing'
            }
        }, {
            action: GDPREventAction.OPTOUT,
            source: GDPREventSource.DEVELOPER,
            infoJson: {
                'v': 1,
                'adid': testAdvertisingId,
                'action': 'optout',
                'projectId': testUnityProjectId,
                'platform': 'android',
                'gameId': testGameId,
                'country': 'FF',
                'source': 'developer',
                'bundleId': testBundleId,
                'legalFramework': 'gdpr',
                'agreedOverAgeLimit': 'missing'
            }
        }, {
            action: GDPREventAction.OPTOUT,
            source: GDPREventSource.USER,
            infoJson: {
                'v': 1,
                'adid': testAdvertisingId,
                'action': 'optout',
                'projectId': testUnityProjectId,
                'platform': 'android',
                'gameId': testGameId,
                'country': 'FF',
                'source': 'user',
                'bundleId': testBundleId,
                'legalFramework': 'gdpr',
                'agreedOverAgeLimit': 'missing'
            }
        }, {
            action: GDPREventAction.OPTIN,
            source: undefined,
            infoJson: {
                'v': 1,
                'adid': testAdvertisingId,
                'action': 'optin',
                'projectId': testUnityProjectId,
                'platform': 'android',
                'country': 'FF',
                'gameId': testGameId,
                'bundleId': testBundleId,
                'legalFramework': 'gdpr',
                'agreedOverAgeLimit': 'missing'
            }
        }];

        beforeEach(() => {
            (<sinon.SinonStub>coreConfig.getCountry).returns('FF');
        });

        tests.forEach((t) => {
            it(`should send matching payload when action is "${t.action}"`, () => {
                httpKafkaSpy.resetHistory();
                isGDPREnabled = true;
                const comparison = (value: any): boolean => {
                    if (Object.keys(value).length !== Object.keys(t.infoJson).length) {
                        return false;
                    }
                    if (value.adid !== t.infoJson.adid) {
                        return false;
                    }
                    if (value.action !== t.infoJson.action) {
                        return false;
                    }
                    if (value.projectId !== t.infoJson.projectId) {
                        return false;
                    }
                    if (value.platform !== t.infoJson.platform) {
                        return false;
                    }
                    if (value.gameId !== t.infoJson.gameId) {
                        return false;
                    }
                    if (value.source !== t.infoJson.source) {
                        return false;
                    }
                    if (value.bundleId !== t.infoJson.bundleId) {
                        return false;
                    }
                    if (value.legalFramework !== t.infoJson.legalFramework) {
                        return false;
                    }
                    if (value.agreedOverAgeLimit !== t.infoJson.agreedOverAgeLimit) {
                        return false;
                    }
                    if (value.v !== t.infoJson.v) {
                        return false;
                    }
                    return true;
                };
                return privacyManager.sendGDPREvent(t.action, t.source).then(() => {
                    assert.equal(httpKafkaSpy.firstCall.args[0], 'ads.events.optout.v1.json', 'privacy event sent to incorrect kafka topic');
                    assert.equal(httpKafkaSpy.firstCall.args[1], KafkaCommonObjectType.EMPTY, 'incorrect kafka common object for privacy event');
                    assert.isTrue(comparison(httpKafkaSpy.firstCall.args[2]), `expected infoJson ${JSON.stringify(t.infoJson)}\nreceived infoJson ${JSON.stringify(httpKafkaSpy.firstCall.args[2])}`);
                });
            });
        });
    });

    describe('updateUserPrivacy', () => {
        const anyConsent: IPermissions = { gameExp: false, ads: false, external: false };
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            gamePrivacy.isEnabled.returns(true);
            gamePrivacy.getMethod.returns(PrivacyMethod.UNITY_CONSENT);
            sandbox.stub(Math, 'random').returns(0);
            (<sinon.SinonStub>coreConfig.getCountry).returns('FI');
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('when updating user privacy', () => {
            function sendEvent(permissions: IPermissions = anyConsent, source: GDPREventSource = GDPREventSource.USER, layout?: ConsentPage, agreeToAll: boolean = false): Promise<any> {
                return privacyManager.updateUserPrivacy(permissions, source, GDPREventAction.CONSENT, layout, agreeToAll).then(() => {
                    sinon.assert.calledTwice(httpKafkaSpy); // First one is temporary diagnostics
                    return httpKafkaSpy.secondCall.args[2];
                });
            }

            it('should send event to a correct topic', () => {
                return sendEvent().then(() => {
                    sinon.assert.calledTwice(httpKafkaSpy);
                    sinon.assert.calledWith(httpKafkaSpy, 'ads.sdk2.diagnostics', sinon.match.any);
                    sinon.assert.calledWith(httpKafkaSpy, 'ads.events.optout.v1.json', KafkaCommonObjectType.EMPTY);
                });
            });

            it('should send backwards-compatible event data', () => {
                return sendEvent(undefined, GDPREventSource.USER).then((eventData) => {
                    assert.isDefined(eventData);
                    assert.equal(eventData.adid, testAdvertisingId);
                    assert.equal(eventData.action, GDPREventAction.CONSENT);
                    assert.equal(eventData.projectId, testUnityProjectId);
                    assert.equal(eventData.platform, 'android');
                    assert.equal(eventData.gameId, testGameId);
                    assert.equal(eventData.country, 'FI');
                    assert.equal(eventData.source, GDPREventSource.USER);
                });
            });

            it('should send new privacy fields', () => {
                const expectedPermissions: IPermissions = { gameExp: false, ads: true, external: true };
                (<sinon.SinonStub>coreConfig.isCoppaCompliant).returns(false);

                const expectedAbGroup = 19;
                (<sinon.SinonStub>coreConfig.getAbGroup).returns(expectedAbGroup);

                return sendEvent(expectedPermissions, GDPREventSource.USER).then((eventData) => {
                    assert.isDefined(eventData);
                    assert.equal(eventData.method, PrivacyMethod.UNITY_CONSENT);
                    assert.equal(eventData.version, gamePrivacy.getVersion());
                    assert.equal(eventData.coppa, false);
                    assert.equal(eventData.permissions, expectedPermissions);
                    assert.equal(eventData.group, expectedAbGroup);
                    assert.equal(eventData.layout, '');
                    assert.equal(eventData.firstRequest, true);
                    assert.equal(eventData.agreedAll, false);
                    assert.equal(eventData.v, 2);
                    assert.equal(eventData.agreedVersion, gamePrivacy.getVersion());
                });
            });

            it('should send selected layout with consent event', () => {
                return sendEvent(undefined, GDPREventSource.USER, ConsentPage.HOMEPAGE).then((eventData) => {
                    assert.isDefined(eventData);
                    assert.equal(eventData.layout, ConsentPage.HOMEPAGE);
                });
            });

            it('should no longer send permissions=all if source is NO_REVIEW', () => {
                return sendEvent(undefined, GDPREventSource.USER_INDIRECT).then((eventData) => {
                    assert.isDefined(eventData);
                    assert.deepEqual(eventData.permissions, { ads: true, external: true, gameExp: true });
                    assert.isTrue(eventData.agreedAll);
                });
            });
        });

        describe('should not update user privacy', () => {
            beforeEach(() => {
                gamePrivacy.getMethod.returns(PrivacyMethod.UNITY_CONSENT);
                gamePrivacy.getVersion.returns(25250101);
            });

            it('if game privacy is disabled', () => {
                gamePrivacy.isEnabled.returns(false);
                return privacyManager.updateUserPrivacy(anyConsent, GDPREventSource.USER, GDPREventAction.CONSENT).then(() => {
                    sinon.assert.notCalled(httpKafkaSpy);
                });
            });

            it('if nothing changed', () => {
                const permissions = { gameExp: false, ads: true, external: true };
                userPrivacy.getMethod.returns(PrivacyMethod.UNITY_CONSENT);
                userPrivacy.getVersion.returns(25250101);
                userPrivacy.getPermissions.returns(permissions);
                return privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, GDPREventAction.CONSENT).then(() => {
                    sinon.assert.notCalled(httpKafkaSpy);
                });
            });

            it('if permissions=all was not changed', () => {
                userPrivacy.getMethod.returns(PrivacyMethod.UNITY_CONSENT);
                userPrivacy.getVersion.returns(25250101);
                userPrivacy.getPermissions.returns({ ads: true, gameExp: true, external: true });
                return privacyManager.updateUserPrivacy({ ads: true, gameExp: true, external: true }, GDPREventSource.USER_INDIRECT, GDPREventAction.CONSENT).then(() => {
                    sinon.assert.notCalled(httpKafkaSpy);
                });
            });
        });
    });
});
