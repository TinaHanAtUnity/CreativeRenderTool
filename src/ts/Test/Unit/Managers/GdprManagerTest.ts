import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { Configuration } from 'Models/Configuration';
import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { GdprManager } from 'Managers/GdprManager';
import { StorageType, StorageApi } from 'Native/Api/Storage';
import { OperativeEventManager, GDPREventSource } from 'Managers/OperativeEventManager';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Request } from 'Utilities/Request';
import { Diagnostics } from 'Utilities/Diagnostics';
import { Observable2 } from 'Utilities/Observable';
import { SdkApi } from 'Native/Api/Sdk';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';

describe('GdprManagerTest', () => {
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
    let sendGDPREventStub: sinon.SinonStub;

    let consentlastsent: boolean | string = false;
    let consent: any = false;
    let storageTrigger: (eventType: string, data: any) => void;

    beforeEach(() => {
        consentlastsent = false;
        consent = false;

        nativeBridge = sinon.createStubInstance(NativeBridge);
        nativeBridge.Sdk = sinon.createStubInstance(SdkApi);
        nativeBridge.Storage = sinon.createStubInstance(StorageApi);
        (<any>nativeBridge.Storage).onSet = new Observable2<string, object>();

        deviceInfo = sinon.createStubInstance(AndroidDeviceInfo);
        clientInfo = sinon.createStubInstance(ClientInfo);
        configuration = sinon.createStubInstance(Configuration);
        request = sinon.createStubInstance(Request);

        onSetStub = sinon.stub(nativeBridge.Storage.onSet, 'subscribe');
        getStub = <sinon.SinonStub>nativeBridge.Storage.get;
        setStub = (<sinon.SinonStub>nativeBridge.Storage.set).resolves();
        writeStub = (<sinon.SinonStub>nativeBridge.Storage.write).resolves();
        sendGDPREventStub = sinon.stub(OperativeEventManager, 'sendGDPREvent').resolves();

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
    });

    afterEach(() => {
        sendGDPREventStub.restore();
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
                gdprEnabled: boolean;
                optOutEnabled: boolean;
                optOutRecorded: boolean;
            }> = [{
                lastConsent: false,
                storedConsent: true,
                event: 'consent',
                gdprEnabled: true,
                optOutEnabled: false,
                optOutRecorded: true
            }, {
                lastConsent: true,
                storedConsent: false,
                event: 'optout',
                gdprEnabled: true,
                optOutEnabled: true,
                optOutRecorded: true
            }];

            tests.forEach((t) => {
                it(`subscribe should send "${t.event}" when "${t.storedConsent}"`, () => {
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
                            sinon.assert.calledWith(sendGDPREventStub, t.event, sinon.match.any, sinon.match.any, sinon.match.any, GDPREventSource.METADATA);
                        } else {
                            sinon.assert.calledWith(sendGDPREventStub, t.event);
                        }
                        sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', t.storedConsent);
                        sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
                        sinon.assert.calledWith(<sinon.SinonStub>configuration.setGDPREnabled, t.gdprEnabled);
                        sinon.assert.calledWith(<sinon.SinonStub>configuration.setOptOutEnabled, t.optOutEnabled);
                        sinon.assert.calledWith(<sinon.SinonStub>configuration.setOptOutRecorded, t.optOutRecorded);
                    });
                });
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
                    consentlastsent = b;
                    storageTrigger('', {gdpr: {consent: {value: b}}});
                    return Promise.resolve().then(() => {
                        sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                        return (<Promise<void>>getStub.firstCall.returnValue).then(() => {
                            sinon.assert.calledWith(<sinon.SinonStub>configuration.setGDPREnabled, true);
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
                gdprEnabled: boolean;
                optOutEnabled: boolean;
                optOutRecorded: boolean;
            }> = [{
                lastConsent: false,
                storedConsent: true,
                event: 'consent',
                gdprEnabled: true,
                optOutEnabled: false,
                optOutRecorded: true
            }, {
                lastConsent: true,
                storedConsent: false,
                event: 'optout',
                gdprEnabled: true,
                optOutEnabled: true,
                optOutRecorded: true
            }, {
                lastConsent: 'false',
                storedConsent: true,
                event: 'consent',
                gdprEnabled: true,
                optOutEnabled: false,
                optOutRecorded: true
            }, {
                lastConsent: 'true',
                storedConsent: false,
                event: 'optout',
                gdprEnabled: true,
                optOutEnabled: true,
                optOutRecorded: true
            }];

            tests.forEach((t) => {
                it(`should send "${t.event}" when "${t.storedConsent}"`, () => {
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
                                sinon.assert.calledWith(sendGDPREventStub, t.event, sinon.match.any, sinon.match.any, sinon.match.any, GDPREventSource.METADATA);
                            } else {
                                sinon.assert.calledWith(sendGDPREventStub, t.event);
                            }
                            sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', t.storedConsent);
                            sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
                            sinon.assert.calledWith(<sinon.SinonStub>configuration.setGDPREnabled, t.gdprEnabled);
                            sinon.assert.calledWith(<sinon.SinonStub>configuration.setOptOutEnabled, t.optOutEnabled);
                            sinon.assert.calledWith(<sinon.SinonStub>configuration.setOptOutRecorded, t.optOutRecorded);
                        });
                    });
                });
            });

            describe('and last consent has not been stored', () => {
                [[false, 'optout'], [true, 'consent']].forEach(([userConsents, event]) => {
                    it(`should send and store the last consent for ${userConsents}`, () => {
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
                                    sinon.assert.calledWith(sendGDPREventStub, event, sinon.match.any, sinon.match.any, sinon.match.any, GDPREventSource.METADATA);
                                } else {
                                    sinon.assert.calledWith(sendGDPREventStub, event);
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
});
