import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { Configuration } from 'Models/Configuration';
import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { GdprConsentManager } from 'Managers/GdprConsentManager';
import { StorageType } from 'Native/Api/Storage';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { debug } from 'util';
import { write } from 'fs';

describe('GdprConsentManagerTest', () => {
    let nativeBridge: NativeBridge;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let configuration: Configuration;
    let gdprConsentManager: GdprConsentManager;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        clientInfo = TestFixtures.getClientInfo();
        configuration = TestFixtures.getConfiguration();

        configuration.setGDPREnabled(false);
        configuration.setOptOutEnabled(false);
        configuration.setOptOutRecorded(false);
    });

    it('should accept boolean true for metadata value', () => {
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'gdpr.consent.value').returns(Promise.resolve(true));

        gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);

        return gdprConsentManager.fetch().then(() => {
            assert.isTrue(configuration.isGDPREnabled(), 'GDPR was not enabled when consent metadata was set to boolean true');
            assert.isFalse(configuration.isOptOutEnabled(), 'GDPR opt-out was set to true when consent metadata was set to boolean true');
            assert.isTrue(configuration.isOptOutRecorded(), 'GDPR opt-out recorded was set to false when consent metadata was set to boolean true');
        });
    });

    it('should accept boolean false for metadata value', () => {
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'gdpr.consent.value').returns(Promise.resolve(false));

        gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);

        return gdprConsentManager.fetch().then(() => {
            assert.isTrue(configuration.isGDPREnabled(), 'GDPR was not enabled when consent metadata was set to boolean false');
            assert.isTrue(configuration.isOptOutEnabled(), 'GDPR opt-out was set to false when consent metadata was set to boolean false');
            assert.isTrue(configuration.isOptOutRecorded(), 'GDPR opt-out recorded was set to false when consent metadata was set to boolean false');
        });
    });

    it('should accept string true for metadata value', () => {
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'gdpr.consent.value').returns(Promise.resolve('true'));

        gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);

        return gdprConsentManager.fetch().then(() => {
            assert.isTrue(configuration.isGDPREnabled(), 'GDPR was not enabled when consent metadata was set to string true');
            assert.isFalse(configuration.isOptOutEnabled(), 'GDPR opt-out was set to true when consent metadata was set to string true');
            assert.isTrue(configuration.isOptOutRecorded(), 'GDPR opt-out recorded was set to false when consent metadata was set to string true');
        });
    });

    it('should accept string false for metadata value', () => {
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'gdpr.consent.value').returns(Promise.resolve('false'));

        gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);

        return gdprConsentManager.fetch().then(() => {
            assert.isTrue(configuration.isGDPREnabled(), 'GDPR was not enabled when consent metadata was set to string false');
            assert.isTrue(configuration.isOptOutEnabled(), 'GDPR opt-out was set to false when consent metadata was set to string false');
            assert.isTrue(configuration.isOptOutRecorded(), 'GDPR opt-out recorded was set to false when consent metadata was set to string false');
        });
    });

    it('should not accept random string for metadata value', () => {
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'gdpr.consent.value').returns(Promise.resolve('test'));

        gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);

        return gdprConsentManager.fetch().then(() => {
            assert.isFalse(configuration.isGDPREnabled(), 'GDPR was enabled when consent metadata was set to random string');
            assert.isFalse(configuration.isOptOutEnabled(), 'GDPR opt-out was set to true when consent metadata was set to random string');
            assert.isFalse(configuration.isOptOutRecorded(), 'GDPR opt-out recorded was set to true when consent metadata was set to random string');
        });
    });

    describe('initialization', () => {
        let onSetStub: sinon.SinonStub;
        let getStub: sinon.SinonStub;
        let setStub: sinon.SinonStub;
        let writeStub: sinon.SinonStub;
        let sendGDPREventStub: sinon.SinonStub;

        let consentlastsent: boolean = false;
        let consent: boolean | undefined = false;
        let finishedPromise: Promise<void>;

        beforeEach(() => {
            onSetStub = sinon.stub(nativeBridge.Storage.onSet, 'subscribe');
            getStub = sinon.stub(nativeBridge.Storage, 'get');
            setStub = sinon.stub(nativeBridge.Storage, 'set');
            writeStub = sinon.stub(nativeBridge.Storage, 'write');
            sendGDPREventStub = sinon.stub(OperativeEventManager, 'sendGDPREvent').resolves();

            getStub.withArgs(StorageType.PRIVATE, 'gdpr.consentlastsent').callsFake(() => {
                return Promise.resolve(consentlastsent);
            });
            getStub.withArgs(StorageType.PUBLIC, 'gdpr.consent.value').callsFake(() => {
                return Promise.resolve(consent);
            });
            finishedPromise = new Promise((resolve, reject) => {
                onSetStub.callsFake((fun) => {
                    const funPromise = fun('', {gdpr: {consent: {value: consent}}});
                    resolve(funPromise);
                });
            });
        });

        afterEach(() => {
            onSetStub.restore();
            getStub.restore();
            setStub.restore();
            writeStub.restore();
            sendGDPREventStub.restore();
            consentlastsent = false;
            consent = false;
        });

        it('should subscribe to Storage.onSet', () => {
            gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);

            sinon.assert.calledOnce(onSetStub);
        });

        it('should send gdpr action consent when true', () => {
            consent = true;

            gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);

            if (finishedPromise) {
                return finishedPromise.then(() => {
                    sinon.assert.calledOnce(onSetStub);
                    sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                    sinon.assert.calledWith(sendGDPREventStub, 'consent');
                    sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', true);
                    sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
                });
            } else {
                assert.fail();
            }
        });

        it('should send gdpr action optout when false', () => {
            consent = false;
            consentlastsent = true;

            gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);

            if (finishedPromise) {
                return finishedPromise.then(() => {
                    sinon.assert.calledOnce(onSetStub);
                    sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                    sinon.assert.calledWith(sendGDPREventStub, 'optout');
                    sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', false);
                    sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
                });
            } else {
                assert.fail();
            }
        });

        it('should not send gdpr action consent when consent is undefined', () => {
            consent = undefined;

            gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);

            if (finishedPromise) {
                return finishedPromise.then(() => {
                    sinon.assert.calledOnce(onSetStub);
                    sinon.assert.notCalled(getStub);
                    sinon.assert.notCalled(sendGDPREventStub);
                    sinon.assert.notCalled(setStub);
                    sinon.assert.notCalled(writeStub);
                });
            } else {
                assert.fail();
            }
        });

        it('should not send gdpr action when consent has not changed and is false', () => {
            consent = false;
            consentlastsent = false;
            gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);

            if (finishedPromise) {
                return finishedPromise.then(() => {
                    sinon.assert.calledOnce(onSetStub);
                    sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                    sinon.assert.notCalled(sendGDPREventStub);
                    sinon.assert.notCalled(setStub);
                    sinon.assert.notCalled(writeStub);
                });
            } else {
                assert.fail();
            }
        });

        it('should not send gdpr action when consent has not changed and is true', () => {
            consent = true;
            consentlastsent = true;
            gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);

            if (finishedPromise) {
                return finishedPromise.then(() => {
                    sinon.assert.calledOnce(onSetStub);
                    sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                    sinon.assert.notCalled(sendGDPREventStub);
                    sinon.assert.notCalled(setStub);
                    sinon.assert.notCalled(writeStub);
                });
            } else {
                assert.fail();
            }
        });

        it('should call setConsent when fetch is called with consent true', () => {
            consent = true;
            consentlastsent = false;
            onSetStub.restore(); // prevent onSet
            gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);
            const setConsentSpy = sinon.spy((<any>gdprConsentManager), 'setConsent');
            return gdprConsentManager.fetch().then(() => {
                const setConsentPromise: Promise<any> = setConsentSpy.returnValues[0];
                return setConsentPromise;
            }).then(() => {
                sinon.assert.notCalled(onSetStub);
                sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
                sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                sinon.assert.calledWith(sendGDPREventStub, 'consent');
                sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', true);
                sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
            });
        });

        it('should call setConsent when fetch is called with consent false', () => {
            consent = false;
            consentlastsent = true;
            onSetStub.restore(); // prevent onSet

            gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);
            const setConsentSpy = sinon.spy((<any>gdprConsentManager), 'setConsent');
            return gdprConsentManager.fetch().then(() => {
                const setConsentPromise: Promise<any> = setConsentSpy.returnValues[0];
                return setConsentPromise;
            }).then(() => {
                sinon.assert.notCalled(onSetStub);
                sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
                sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                sinon.assert.calledWith(sendGDPREventStub, 'optout');
                sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', false);
                sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
            });
        });

        it('fetch should not send gdpr action when consent has not changed and is true', () => {
            consent = true;
            consentlastsent = true;
            onSetStub.restore(); // prevent onSet
            gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);
            const setConsentSpy = sinon.spy((<any>gdprConsentManager), 'setConsent');
            return gdprConsentManager.fetch().then(() => {
                const setConsentPromise: Promise<any> = setConsentSpy.returnValues[0];
                return setConsentPromise;
            }).then(() => {
                sinon.assert.notCalled(onSetStub);
                sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
                sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                sinon.assert.notCalled(sendGDPREventStub);
                sinon.assert.notCalled(setStub);
                sinon.assert.notCalled(writeStub);
            });
        });

        it('fetch should not send gdpr action when consent has not changed and is false', () => {
            consent = false;
            consentlastsent = false;
            onSetStub.restore(); // prevent onSet
            gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);
            const setConsentSpy = sinon.spy((<any>gdprConsentManager), 'setConsent');
            return gdprConsentManager.fetch().then(() => {
                const setConsentPromise: Promise<any> = setConsentSpy.returnValues[0];
                return setConsentPromise;
            }).then(() => {
                sinon.assert.notCalled(onSetStub);
                sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
                sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
                sinon.assert.notCalled(sendGDPREventStub);
                sinon.assert.notCalled(setStub);
                sinon.assert.notCalled(writeStub);
            });
        });

        it('fetch should not send gdpr action when consent is undefined', () => {
            consent = undefined;
            onSetStub.restore(); // prevent onSet
            gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration);
            const setConsentSpy = sinon.spy((<any>gdprConsentManager), 'setConsent');
            return gdprConsentManager.fetch().then(() => {
                const setConsentPromise: Promise<any> = setConsentSpy.returnValues[0];
                return setConsentPromise;
            }).then(() => {
                sinon.assert.notCalled(onSetStub);
                sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
                sinon.assert.calledOnce(getStub);
                sinon.assert.notCalled(sendGDPREventStub);
                sinon.assert.notCalled(setStub);
                sinon.assert.notCalled(writeStub);
            });
        });

    });
});
