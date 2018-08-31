import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { Configuration } from 'Core/Models/Configuration';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { GDPREventAction, GDPREventSource, GdprManager } from 'Ads/Managers/GdprManager';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { Request } from 'Core/Utilities/Request';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Observable2 } from 'Common/Utilities/Observable';
import { SdkApi } from 'Core/Native/Sdk';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { Platform } from 'Common/Constants/Platform';

describe('GdprManagerTest', () => {
    const testGameId = '12345';
    const testAdvertisingId = '128970986778678';
    const testUnityProjectId = 'game-1';
    let nativeBridge: NativeBridge;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let configuration: Configuration;
    let gdprManager: GdprManager;
    let request: Request;

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

        nativeBridge = sinon.createStubInstance(NativeBridge);
        nativeBridge.Sdk = sinon.createStubInstance(SdkApi);
        nativeBridge.Storage = sinon.createStubInstance(StorageApi);
        (<any>nativeBridge.Storage).onSet = new Observable2<string, object>();

        clientInfo = sinon.createStubInstance(ClientInfo);
        deviceInfo = sinon.createStubInstance(AndroidDeviceInfo);
        configuration = sinon.createStubInstance(Configuration);
        request = sinon.createStubInstance(Request);

        onSetStub = sinon.stub(nativeBridge.Storage.onSet, 'subscribe');
        getStub = <sinon.SinonStub>nativeBridge.Storage.get;
        setStub = (<sinon.SinonStub>nativeBridge.Storage.set).resolves();
        writeStub = (<sinon.SinonStub>nativeBridge.Storage.write).resolves();

        (<sinon.SinonStub>clientInfo.getPlatform).returns(Platform.TEST);
        (<sinon.SinonStub>clientInfo.getGameId).returns(testGameId);
        (<sinon.SinonStub>deviceInfo.getAdvertisingIdentifier).returns(testAdvertisingId);
        (<sinon.SinonStub>configuration.getUnityProjectId).returns(testUnityProjectId);
        (<sinon.SinonStub>configuration.isGDPREnabled).callsFake(() => {
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
        gdprManager = new GdprManager(nativeBridge, deviceInfo, clientInfo, configuration, request);
        sendGDPREventStub = sinon.spy(gdprManager, 'sendGDPREvent');
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
            const tests: Array<{
                lastConsent: boolean;
                storedConsent: boolean;
                event: string;
                optOutEnabled: boolean;
                optOutRecorded: boolean;
                isGdprEnabled: boolean;
            }> = [{
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
                        sinon.assert.calledWith(<sinon.SinonStub>configuration.setOptOutEnabled, t.optOutEnabled);
                        sinon.assert.calledWith(<sinon.SinonStub>configuration.setOptOutRecorded, t.optOutRecorded);
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
                sinon.assert.notCalled(<sinon.SinonStub>configuration.setOptOutEnabled);
                sinon.assert.notCalled(<sinon.SinonStub>configuration.setOptOutRecorded);
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
                sinon.assert.notCalled(<sinon.SinonStub>configuration.setGDPREnabled);
                sinon.assert.notCalled(<sinon.SinonStub>configuration.setOptOutEnabled);
                sinon.assert.notCalled(<sinon.SinonStub>configuration.setOptOutRecorded);
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
                            sinon.assert.calledWith(<sinon.SinonStub>configuration.setOptOutEnabled, !b);
                            sinon.assert.calledWith(<sinon.SinonStub>configuration.setOptOutRecorded, true);
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
                return gdprManager.getConsentAndUpdateConfiguration().then(() => {
                    assert.fail('should throw');
                }).catch(() => {
                    sinon.assert.notCalled(<sinon.SinonStub>configuration.setGDPREnabled);
                    sinon.assert.notCalled(<sinon.SinonStub>configuration.setOptOutEnabled);
                    sinon.assert.notCalled(<sinon.SinonStub>configuration.setOptOutRecorded);
                });
            });
        });

        describe('and consent has changed', () => {
            const tests: Array<{
                lastConsent: boolean | string;
                storedConsent: boolean;
                event: string;
                optOutEnabled: boolean;
                optOutRecorded: boolean;
            }> = [{
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

                    return gdprManager.getConsentAndUpdateConfiguration().then(() => {
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
                            sinon.assert.calledWith(<sinon.SinonStub>configuration.setOptOutEnabled, t.optOutEnabled);
                            sinon.assert.calledWith(<sinon.SinonStub>configuration.setOptOutRecorded, t.optOutRecorded);
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
                    return gdprManager.getConsentAndUpdateConfiguration().then((storedConsent: boolean) => {
                        assert.equal(storedConsent, true);
                        sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
                        sinon.assert.notCalled(sendGDPREventStub);
                        sinon.assert.notCalled(setStub);
                        sinon.assert.notCalled(writeStub);
                        sinon.assert.notCalled(<sinon.SinonStub>configuration.setOptOutEnabled);
                        sinon.assert.notCalled(<sinon.SinonStub>configuration.setOptOutRecorded);
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
                    return gdprManager.getConsentAndUpdateConfiguration().then(() => {
                        assert.fail('should throw');
                    }).catch((error: Error) => {
                        assert.equal(error.message, 'Configuration gdpr is not enabled');
                        sinon.assert.notCalled(getStub);
                        sinon.assert.notCalled(sendGDPREventStub);
                        sinon.assert.notCalled(setStub);
                        sinon.assert.notCalled(writeStub);
                        sinon.assert.notCalled(<sinon.SinonStub>configuration.setOptOutEnabled);
                        sinon.assert.notCalled(<sinon.SinonStub>configuration.setOptOutRecorded);
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

                        return gdprManager.getConsentAndUpdateConfiguration().then(() => {
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
            getRequestStub.resolves({response: '{}'});
            diagnosticTriggerStub = sinon.stub(Diagnostics, 'trigger');
            logErrorStub = <sinon.SinonStub>nativeBridge.Sdk.logError;

            (<sinon.SinonStub>clientInfo.getGameId).returns(gameId);
            (<sinon.SinonStub>deviceInfo.getAdvertisingIdentifier).returns(adId);
            (<sinon.SinonStub>deviceInfo.getStores).returns(stores);
            (<sinon.SinonStub>deviceInfo.getModel).returns(model);
            (<sinon.SinonStub>configuration.getUnityProjectId).returns(projectId);
            (<sinon.SinonStub>configuration.getCountry).returns(countryCode);
        });

        afterEach(() => {
            diagnosticTriggerStub.restore();
        });

        it('should call request.get', () => {
            return gdprManager.retrievePersonalInformation().then(() => {
                sinon.assert.calledWith(getRequestStub, `https://tracking.adsx.unityads.unity3d.com/user-summary?gameId=${gameId}&adid=${adId}&projectId=${projectId}&storeId=${stores}`);
            });
        });

        it('verify response has personal payload', () => {
            return gdprManager.retrievePersonalInformation().then((response) => {
                assert.equal(response.deviceModel, model);
                assert.equal(response.country, countryCode);
            });
        });

        it('should call diagnostics on error', () => {
            getRequestStub.reset();
            getRequestStub.rejects('Test Error');
            return gdprManager.retrievePersonalInformation().then(() => {
                assert.fail('Should throw error');
            }).catch((error) => {
                assert.equal(error, 'Test Error');
                sinon.assert.calledWith(diagnosticTriggerStub, 'gdpr_request_failed', {url: `https://tracking.adsx.unityads.unity3d.com/user-summary?gameId=${gameId}&adid=${adId}&projectId=${projectId}&storeId=${stores}`});
            });
        });

        it('should call logError on error', () => {
            getRequestStub.reset();
            getRequestStub.rejects('Test Error');
            return gdprManager.retrievePersonalInformation().then(() => {
                assert.fail('Should throw error');
            }).catch((error) => {
                assert.equal(error, 'Test Error');
                sinon.assert.calledWith(logErrorStub, 'Gdpr request failedTest Error');
            });
        });
    });

    describe('Sending gdpr events', () => {
        const tests: Array<{
            action: GDPREventAction;
            source: GDPREventSource | undefined;
            infoJson: any;
        }> = [{
            action: GDPREventAction.SKIP,
            source: undefined,
            infoJson: {
                'adid': testAdvertisingId,
                'action': 'skip',
                'projectId': testUnityProjectId,
                'platform': 'test',
                'gameId': testGameId
            }
        }, {
            action: GDPREventAction.CONSENT,
            source: undefined,
            infoJson: {
                'adid': testAdvertisingId,
                'action': 'consent',
                'projectId': testUnityProjectId,
                'platform': 'test',
                'gameId': testGameId
            }
        }, {
            action: GDPREventAction.OPTOUT,
            source: undefined,
            infoJson: {
                'adid': testAdvertisingId,
                'action': 'optout',
                'projectId': testUnityProjectId,
                'platform': 'test',
                'gameId': testGameId
            }
        }, {
            action: GDPREventAction.OPTOUT,
            source: GDPREventSource.METADATA,
            infoJson: {
                'adid': testAdvertisingId,
                'action': 'optout',
                'projectId': testUnityProjectId,
                'platform': 'test',
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
                'platform': 'test',
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
                'platform': 'test',
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
                gdprManager.sendGDPREvent(t.action, t.source);
                assert.isTrue(comparison(httpKafkaStub.firstCall.args[2]), `expected infoJson ${JSON.stringify(t.infoJson)}\nreceived infoJson ${JSON.stringify(httpKafkaStub.firstCall.args[2])}`);
                httpKafkaStub.calledWithExactly('ads.events.optout.v1.json', KafkaCommonObjectType.EMPTY, t.infoJson);
            });
        });
    });
});
