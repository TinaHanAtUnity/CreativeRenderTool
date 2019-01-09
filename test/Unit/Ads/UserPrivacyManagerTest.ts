import { GDPREventAction, GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { GamePrivacy, PrivacyMethod, IPermissions, UserPrivacy } from 'Ads/Models/Privacy';
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

describe('UserPrivacyManagerTest', () => {
    const testGameId = '12345';
    const testAdvertisingId = '128970986778678';
    const testUnityProjectId = 'game-1';
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
    let privacyManager: UserPrivacyManager;
    let gamePrivacy: GamePrivacy;
    let userPrivacy: UserPrivacy;
    let request: RequestManager;

    let onSetStub: sinon.SinonStub;
    let getStub: sinon.SinonStub;
    let setStub: sinon.SinonStub;
    let writeStub: sinon.SinonStub;
    let sendGDPREventStub: sinon.SinonSpy;
    let httpKafkaStub: sinon.SinonSpy;

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
        gamePrivacy = new GamePrivacy({ method: PrivacyMethod.UNITY_CONSENT });
        (<sinon.SinonStub>adsConfig.getGamePrivacy).returns(gamePrivacy);
        userPrivacy = new UserPrivacy({
            method: PrivacyMethod.DEFAULT,
            version: 0,
            permissions: {
                profiling: false
            }
        });
        (<sinon.SinonStub>adsConfig.getUserPrivacy).returns(userPrivacy);

        request = sinon.createStubInstance(RequestManager);

        onSetStub = sinon.stub(core.Storage.onSet, 'subscribe');
        getStub = sinon.stub(core.Storage, 'get');
        setStub = sinon.stub(core.Storage, 'set').resolves();
        writeStub = sinon.stub(core.Storage, 'write').resolves();

        (<sinon.SinonStub>clientInfo.getGameId).returns(testGameId);
        (<sinon.SinonStub>deviceInfo.getAdvertisingIdentifier).returns(testAdvertisingId);
        (<sinon.SinonStub>coreConfig.getUnityProjectId).returns(testUnityProjectId);
        (<sinon.SinonStub>adsConfig.isGDPREnabled).callsFake(() => {
            return isGDPREnabled;
        });

        httpKafkaStub = sinon.stub(HttpKafka, 'sendEvent').resolves();

        getStub.withArgs(StorageType.PRIVATE, 'gdpr.consentlastsent').callsFake(() => {
            return Promise.resolve(consentlastsent);
        });
        getStub.withArgs(StorageType.PUBLIC, 'gdpr.consent.value').callsFake(() => {
            return Promise.resolve(consent);
        });
        onSetStub.callsFake((fun) => {
            storageTrigger = fun;
        });
        privacyManager = new UserPrivacyManager(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, request);
        sendGDPREventStub = sinon.spy(privacyManager, 'sendGDPREvent');
    });

    afterEach(() => {
        httpKafkaStub.restore();
        isGDPREnabled = false;
    });

    it('should subscribe to Storage.onSet', () => {
        sinon.assert.calledOnce(onSetStub);
    });

    describe('when storage is set', () => {
        describe('and the consent value has changed', () => {
            const tests: {
                lastConsent: boolean;
                storedConsent: boolean;
                event: string;
                optOutEnabled: boolean;
                optOutRecorded: boolean;
                isGdprEnabled: boolean;
            }[] = [{
                lastConsent: false,
                storedConsent: true,
                event: 'consent',
                optOutEnabled: false,
                optOutRecorded: true,
                isGdprEnabled: true
            }, {
                lastConsent: true,
                storedConsent: false,
                event: 'optout',
                optOutEnabled: true,
                optOutRecorded: true,
                isGdprEnabled: true
            }];

            tests.forEach((t) => {
                it(`subscribe should send "${t.event}" when "${t.storedConsent}"`, () => {
                    isGDPREnabled = t.isGdprEnabled;
                    consentlastsent = t.lastConsent;
                    const writePromise = new Promise<void>((resolve) => {
                        writeStub.reset();
                        writeStub.callsFake(() => {
                            return Promise.resolve().then(resolve);
                        });
                    });
                    storageTrigger('', { gdpr: { consent: { value: t.storedConsent } } });

                    return writePromise.then(() => {
                        sinon.assert.calledOnce(onSetStub);
                        sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                        if (t.event === 'optout') {
                            sinon.assert.calledWithExactly(sendGDPREventStub, t.event, GDPREventSource.METADATA);
                        } else {
                            sinon.assert.calledWithExactly(sendGDPREventStub, t.event);
                        }
                        sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', t.storedConsent);
                        sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
                        sinon.assert.calledWith(<sinon.SinonStub>adsConfig.setOptOutEnabled, t.optOutEnabled);
                        sinon.assert.calledWith(<sinon.SinonStub>adsConfig.setOptOutRecorded, t.optOutRecorded);
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
                sinon.assert.notCalled(sendGDPREventStub);
                sinon.assert.notCalled(setStub);
                sinon.assert.notCalled(writeStub);
                sinon.assert.notCalled(<sinon.SinonStub>adsConfig.setOptOutEnabled);
                sinon.assert.notCalled(<sinon.SinonStub>adsConfig.setOptOutRecorded);
            });
        });

        describe('and the stored consent is undefined', () => {
            it('should not do anything', () => {
                storageTrigger('', {});
                sinon.assert.calledOnce(onSetStub);
                sinon.assert.notCalled(getStub);
                sinon.assert.notCalled(sendGDPREventStub);
                sinon.assert.notCalled(setStub);
                sinon.assert.notCalled(writeStub);
                sinon.assert.notCalled(<sinon.SinonStub>adsConfig.setGDPREnabled);
                sinon.assert.notCalled(<sinon.SinonStub>adsConfig.setOptOutEnabled);
                sinon.assert.notCalled(<sinon.SinonStub>adsConfig.setOptOutRecorded);
            });
        });

        describe('and the stored consent has not changed', () => {
            [true, false].forEach((b) => {
                it(`should not send anything for value "${b}"`, () => {
                    isGDPREnabled = true;
                    consentlastsent = b;
                    storageTrigger('', {gdpr: {consent: {value: b}}});
                    return Promise.resolve().then(() => {
                        sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                        return (<Promise<void>>getStub.firstCall.returnValue).then(() => {
                            sinon.assert.notCalled(sendGDPREventStub);
                            sinon.assert.calledWith(<sinon.SinonStub>adsConfig.setOptOutEnabled, !b);
                            sinon.assert.calledWith(<sinon.SinonStub>adsConfig.setOptOutRecorded, true);
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
                    sinon.assert.notCalled(<sinon.SinonStub>adsConfig.setGDPREnabled);
                    sinon.assert.notCalled(<sinon.SinonStub>adsConfig.setOptOutEnabled);
                    sinon.assert.notCalled(<sinon.SinonStub>adsConfig.setOptOutRecorded);
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
            }[] = [{
                lastConsent: false,
                storedConsent: true,
                event: 'consent',
                optOutEnabled: false,
                optOutRecorded: true
            }, {
                lastConsent: true,
                storedConsent: false,
                event: 'optout',
                optOutEnabled: true,
                optOutRecorded: true
            }, {
                lastConsent: 'false',
                storedConsent: true,
                event: 'consent',
                optOutEnabled: false,
                optOutRecorded: true
            }, {
                lastConsent: 'true',
                storedConsent: false,
                event: 'optout',
                optOutEnabled: true,
                optOutRecorded: true
            }];

            tests.forEach((t) => {
                it(`should send "${t.event}" when "${t.storedConsent}"`, () => {
                    isGDPREnabled = true;
                    consentlastsent = t.lastConsent;
                    consent = t.storedConsent;
                    const writePromise = new Promise<void>((resolve) => {
                        writeStub.reset();
                        writeStub.callsFake(() => {
                            return Promise.resolve().then(resolve);
                        });
                    });

                    return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                        return writePromise.then(() => {
                            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
                            sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                            if (t.event === 'optout') {
                                sinon.assert.calledWithExactly(sendGDPREventStub, t.event, GDPREventSource.METADATA);
                            } else {
                                sinon.assert.calledWithExactly(sendGDPREventStub, t.event);
                            }
                            sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', t.storedConsent);
                            sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
                            sinon.assert.calledWith(<sinon.SinonStub>adsConfig.setOptOutEnabled, t.optOutEnabled);
                            sinon.assert.calledWith(<sinon.SinonStub>adsConfig.setOptOutRecorded, t.optOutRecorded);
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
                        sinon.assert.notCalled(sendGDPREventStub);
                        sinon.assert.notCalled(setStub);
                        sinon.assert.notCalled(writeStub);
                        sinon.assert.notCalled(<sinon.SinonStub>adsConfig.setOptOutEnabled);
                        sinon.assert.notCalled(<sinon.SinonStub>adsConfig.setOptOutRecorded);
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
                        sinon.assert.notCalled(sendGDPREventStub);
                        sinon.assert.notCalled(setStub);
                        sinon.assert.notCalled(writeStub);
                        sinon.assert.notCalled(<sinon.SinonStub>adsConfig.setOptOutEnabled);
                        sinon.assert.notCalled(<sinon.SinonStub>adsConfig.setOptOutRecorded);
                    });
                });
            });

            describe('and last consent has not been stored', () => {
                [[false, 'optout'], [true, 'consent']].forEach(([userConsents, event]) => {
                    it(`should send and store the last consent for ${userConsents}`, () => {
                        isGDPREnabled = true;
                        getStub.withArgs(StorageType.PRIVATE, 'gdpr.consentlastsent').reset();
                        getStub.withArgs(StorageType.PRIVATE, 'gdpr.consentlastsent').rejects('test error');
                        const writePromise = new Promise<void>((resolve) => {
                            writeStub.reset();
                            writeStub.callsFake(() => {
                                return Promise.resolve().then(resolve);
                            });
                        });
                        consent = userConsents;

                        return privacyManager.getConsentAndUpdateConfiguration().then(() => {
                            return writePromise.then(() => {
                                sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                                if (event === 'optout') {
                                    sinon.assert.calledWithExactly(sendGDPREventStub, event, GDPREventSource.METADATA);
                                } else {
                                    sinon.assert.calledWithExactly(sendGDPREventStub, event);
                                }
                                sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', userConsents);
                                sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
                            });
                        });
                    });
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
                sinon.assert.calledWith(getRequestStub, `https://tracking.prd.mz.internal.unity3d.com/user-summary?gameId=${gameId}&adid=${adId}&projectId=${projectId}&storeId=${stores}`);
            });
        });

        it('should cache the result', () => {
            return privacyManager.retrieveUserSummary().then(() => {
                sinon.assert.calledOnce(getRequestStub);
                return privacyManager.retrieveUserSummary().then((response) => {
                    sinon.assert.calledOnce(getRequestStub);
                    assert.equal(response.deviceModel, model);
                });
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
                sinon.assert.calledWith(diagnosticTriggerStub, 'gdpr_request_failed', {url: `https://tracking.prd.mz.internal.unity3d.com/user-summary?gameId=${gameId}&adid=${adId}&projectId=${projectId}&storeId=${stores}`});
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
                'adid': testAdvertisingId,
                'action': 'skip',
                'projectId': testUnityProjectId,
                'platform': 'android',
                'gameId': testGameId
            }
        }, {
            action: GDPREventAction.CONSENT,
            source: undefined,
            infoJson: {
                'adid': testAdvertisingId,
                'action': 'consent',
                'projectId': testUnityProjectId,
                'platform': 'android',
                'gameId': testGameId
            }
        }, {
            action: GDPREventAction.OPTOUT,
            source: undefined,
            infoJson: {
                'adid': testAdvertisingId,
                'action': 'optout',
                'projectId': testUnityProjectId,
                'platform': 'android',
                'gameId': testGameId
            }
        }, {
            action: GDPREventAction.OPTOUT,
            source: GDPREventSource.METADATA,
            infoJson: {
                'adid': testAdvertisingId,
                'action': 'optout',
                'projectId': testUnityProjectId,
                'platform': 'android',
                'gameId': testGameId,
                'source': 'metadata'
            }
        }, {
            action: GDPREventAction.OPTOUT,
            source: GDPREventSource.USER,
            infoJson: {
                'adid': testAdvertisingId,
                'action': 'optout',
                'projectId': testUnityProjectId,
                'platform': 'android',
                'gameId': testGameId,
                'source': 'user'
            }
        }, {
            action: GDPREventAction.OPTIN,
            source: undefined,
            infoJson: {
                'adid': testAdvertisingId,
                'action': 'optin',
                'projectId': testUnityProjectId,
                'platform': 'android',
                'gameId': testGameId
            }
        }];

        tests.forEach((t) => {
            it(`should send matching payload when action is "${t.action}"`, () => {
                httpKafkaStub.resetHistory();
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
                    return true;
                };
                privacyManager.sendGDPREvent(t.action, t.source);
                assert.isTrue(comparison(httpKafkaStub.firstCall.args[2]), `expected infoJson ${JSON.stringify(t.infoJson)}\nreceived infoJson ${JSON.stringify(httpKafkaStub.firstCall.args[2])}`);
                httpKafkaStub.calledWithExactly('ads.events.optout.v1.json', KafkaCommonObjectType.EMPTY, t.infoJson);
            });
        });
    });

    describe('updateUserPrivacy', () => {
        const sandbox = sinon.createSandbox();
        const anyConsent: IPermissions = { gameExp: false, ads: false, external: false };

        afterEach(() => {
            sandbox.restore();
        });

        describe('when updating user privacy', () => {
            function sendEvent(permissions: IPermissions = anyConsent, source: GDPREventSource = GDPREventSource.USER): Promise<any> {
                return privacyManager.updateUserPrivacy(permissions, source).then(() => {
                    sinon.assert.calledOnce(httpKafkaStub);
                    return httpKafkaStub.firstCall.args[2];
                });
            }

            it('should send event to a correct topic', () => {
                return sendEvent().then(() => {
                    sinon.assert.calledOnce(httpKafkaStub);
                    sinon.assert.calledWith(httpKafkaStub, 'ads.events.optout.v1.json', KafkaCommonObjectType.EMPTY, sinon.match.object);
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
                    assert.equal(eventData.source, GDPREventSource.USER);
                });
            });

            it('should send new privacy fields', () => {
                const expectedPermissions: IPermissions = { gameExp: false, ads: true, external: true };
                (<sinon.SinonStub>coreConfig.isCoppaCompliant).returns(false);

                return sendEvent(expectedPermissions, GDPREventSource.USER).then((eventData) => {
                    assert.isDefined(eventData);
                    assert.equal(eventData.method, PrivacyMethod.UNITY_CONSENT);
                    assert.equal(eventData.version, gamePrivacy.getVersion());
                    assert.equal(eventData.coppa, false);
                    assert.equal(eventData.permissions, expectedPermissions);
                });
            });

            it('should send permissions=all if source is NO_REVIEW', () => {
                return sendEvent(undefined, GDPREventSource.NO_REVIEW).then((eventData) => {
                    assert.isDefined(eventData);
                    assert.deepEqual(eventData.permissions, { all: true });
                });
            });
        });

        describe('should not update user privacy', () => {
            it('if game privacy is disabled', () => {
                sandbox.stub(gamePrivacy, 'isEnabled').returns(false);
                return privacyManager.updateUserPrivacy(anyConsent, GDPREventSource.USER).then(() => {
                    sinon.assert.notCalled(httpKafkaStub);
                });
            });

            it('if nothing changed', () => {
                const permissions = { gameExp: false, ads: true, external: true };
                sandbox.stub(gamePrivacy, 'getMethod').returns(PrivacyMethod.UNITY_CONSENT);
                sandbox.stub(userPrivacy, 'getMethod').returns(PrivacyMethod.UNITY_CONSENT);
                sandbox.stub(gamePrivacy, 'getVersion').returns(25250101);
                sandbox.stub(userPrivacy, 'getVersion').returns(25250101);
                sandbox.stub(userPrivacy, 'getPermissions').returns(permissions);
                return privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER).then(() => {
                    sinon.assert.notCalled(httpKafkaStub);
                });
            });

            it('if permissions=all was not changed', () => {
                sandbox.stub(gamePrivacy, 'getMethod').returns(PrivacyMethod.UNITY_CONSENT);
                sandbox.stub(userPrivacy, 'getMethod').returns(PrivacyMethod.UNITY_CONSENT);
                sandbox.stub(gamePrivacy, 'getVersion').returns(25250101);
                sandbox.stub(userPrivacy, 'getVersion').returns(25250101);
                sandbox.stub(userPrivacy, 'getPermissions').returns({ all: true });
                return privacyManager.updateUserPrivacy(anyConsent, GDPREventSource.NO_REVIEW).then(() => {
                    sinon.assert.notCalled(httpKafkaStub);
                });
            });

            //TODO: remove/rephrase when old fields are deprecated
            it('if game privacy method is other than UnityConsent', () => {
                sandbox.stub(gamePrivacy, 'getMethod').returns(PrivacyMethod.DEVELOPER_CONSENT);
                return privacyManager.updateUserPrivacy(anyConsent, GDPREventSource.USER).then(() => {
                    sinon.assert.notCalled(httpKafkaStub);
                });
            });
        });
    });
});
