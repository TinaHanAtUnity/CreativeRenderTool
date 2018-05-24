import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { Configuration } from 'Models/Configuration';
import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { GdprManager } from 'Managers/GdprManager';
import { StorageType } from 'Native/Api/Storage';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Request } from 'Utilities/Request';
import { Diagnostics } from 'Utilities/Diagnostics';

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
    let setConsentSpy: sinon.SinonSpy;

    let consentlastsent: boolean = false;
    let consent: any = false;
    let storageTrigger: (eventType: string, data: any) => void;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        clientInfo = TestFixtures.getClientInfo();
        configuration = TestFixtures.getConfiguration();
        request = sinon.createStubInstance(Request);

        onSetStub = sinon.stub(nativeBridge.Storage.onSet, 'subscribe');
        getStub = sinon.stub(nativeBridge.Storage, 'get');
        setStub = sinon.stub(nativeBridge.Storage, 'set').resolves();
        writeStub = sinon.stub(nativeBridge.Storage, 'write').resolves();
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
        setConsentSpy = sinon.spy(gdprManager, 'setConsent');
    });

    afterEach(() => {
        onSetStub.restore();
        getStub.restore();
        setStub.restore();
        writeStub.restore();
        sendGDPREventStub.restore();
        setConsentSpy.restore();
        consentlastsent = false;
        consent = false;
    });

    it('should subscribe to Storage.onSet', () => {
        sinon.assert.calledOnce(onSetStub);
    });

    it('subscribe should send gdpr action consent when true', () => {
        consentlastsent = false;
        storageTrigger('', {gdpr: {consent: {value: true}}});
        const setConsentPromise = <Promise<void>>setConsentSpy.firstCall.returnValue;
        return setConsentPromise.then(() => {
            sinon.assert.calledOnce(onSetStub);
            sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
            sinon.assert.calledWith(sendGDPREventStub, 'consent');
            sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', true);
            sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
        });
    });

    it('subscribe should send gdpr action optout when false', () => {
        consentlastsent = true;
        storageTrigger('', {gdpr: {consent: {value: false}}});
        const setConsentPromise = <Promise<void>>setConsentSpy.firstCall.returnValue;
        return setConsentPromise.then(() => {
            sinon.assert.calledOnce(onSetStub);
            sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
            sinon.assert.calledWith(sendGDPREventStub, 'optout');
            sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', false);
            sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
        });
    });

    it('subscribe should not send gdpr action consent when consent is undefined', () => {
        storageTrigger('', {});
        sinon.assert.calledOnce(onSetStub);
        sinon.assert.notCalled(setConsentSpy);
        sinon.assert.notCalled(getStub);
        sinon.assert.notCalled(sendGDPREventStub);
        sinon.assert.notCalled(setStub);
        sinon.assert.notCalled(writeStub);
    });

    it('subscribe should not send gdpr action when consent has not changed and is false', () => {
        consentlastsent = false;
        storageTrigger('', {gdpr: {consent: {value: false}}});
        const setConsentPromise = <Promise<void>>setConsentSpy.firstCall.returnValue;
        return setConsentPromise.then(() => {
            sinon.assert.calledOnce(onSetStub);
            sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
            sinon.assert.notCalled(sendGDPREventStub);
            sinon.assert.notCalled(setStub);
            sinon.assert.notCalled(writeStub);
        });
    });

    it('subscribe should not send gdpr action when consent has not changed and is true', () => {
        consentlastsent = true;
        storageTrigger('', {gdpr: {consent: {value: true}}});
        const setConsentPromise = <Promise<void>> setConsentSpy.firstCall.returnValue;
        return setConsentPromise.then(() => {
            sinon.assert.calledOnce(onSetStub);
            sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
            sinon.assert.notCalled(sendGDPREventStub);
            sinon.assert.notCalled(setStub);
            sinon.assert.notCalled(writeStub);
        });
    });

    it('getConsent should call storage get with true', () => {
        consent = true;
        return gdprManager.getConsent().then((consentValue) => {
            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
            assert.equal(consentValue, consent);
        });
    });

    it('getConsent should call storage get with false', () => {
        consent = false;
        return gdprManager.getConsent().then((consentValue) => {
            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
            assert.equal(consentValue, consent);
        });
    });

    it('getConsent should call storage get with "true"', () => {
        consent = 'true';
        return gdprManager.getConsent().then((consentValue) => {
            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
            assert.equal(consentValue, true);
        });
    });

    it('getConsent should call storage get with "false"', () => {
        consent = 'false';
        return gdprManager.getConsent().then((consentValue) => {
            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
            assert.equal(consentValue, false);
        });
    });

    it('getConsent should call storage get with undefined', () => {
        consent = undefined;
        return gdprManager.getConsent().then(() => {
            assert.fail('Should throw');
        }).catch((error) => {
            sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'gdpr.consent.value');
        });
    });

    it('setConsent with consent true', () => {
        consentlastsent = false;
        return gdprManager.setConsent(true).then(() => {
            sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
            sinon.assert.calledWith(sendGDPREventStub, 'consent');
            sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', true);
            sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
        });
    });

    it('setConsent with consent false', () => {
        consentlastsent = true;
        return gdprManager.setConsent(false).then(() => {
            sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
            sinon.assert.calledWith(sendGDPREventStub, 'optout');
            sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', false);
            sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
        });
    });

    it('setConsent with consent true and last consent true', () => {
        consentlastsent = true;
        return gdprManager.setConsent(true).then(() => {
            sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
            sinon.assert.notCalled(sendGDPREventStub);
            sinon.assert.notCalled(setStub);
            sinon.assert.notCalled(writeStub);
        });
    });

    it('setConsent with consent false and last consent false', () => {
        consentlastsent = false;
        return gdprManager.setConsent(false).then(() => {
            sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
            sinon.assert.notCalled(sendGDPREventStub);
            sinon.assert.notCalled(setStub);
            sinon.assert.notCalled(writeStub);
        });
    });

    it('setConsent with consent true and no last consent', () => {
        getStub.withArgs(StorageType.PRIVATE, 'gdpr.consentlastsent').reset();
        getStub.withArgs(StorageType.PRIVATE, 'gdpr.consentlastsent').rejects('test error');
        return gdprManager.setConsent(true).then(() => {
            sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
            sinon.assert.calledWith(sendGDPREventStub, 'consent');
            sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', true);
            sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
        });
    });

    it('setConsent with consent false and no last consent', () => {
        getStub.withArgs(StorageType.PRIVATE, 'gdpr.consentlastsent').reset();
        getStub.withArgs(StorageType.PRIVATE, 'gdpr.consentlastsent').rejects('test error');
        return gdprManager.setConsent(false).then(() => {
            sinon.assert.calledWith(getStub, StorageType.PRIVATE, 'gdpr.consentlastsent');
            sinon.assert.calledWith(sendGDPREventStub, 'optout');
            sinon.assert.calledWith(setStub, StorageType.PRIVATE, 'gdpr.consentlastsent', false);
            sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
        });
    });

    describe('Fetch personal information', () => {

        let getRequestStub: sinon.SinonStub;
        let diagnosticTriggerStub: sinon.SinonStub;
        let logErrorStub: sinon.SinonStub;

        beforeEach(() => {
            getRequestStub = <sinon.SinonStub>request.get;
            getRequestStub.resolves({response: '{}'});
            diagnosticTriggerStub = sinon.stub(Diagnostics, 'trigger');
            logErrorStub = sinon.stub(nativeBridge.Sdk, 'logError');
        });

        afterEach(() => {
            getRequestStub.reset();
            diagnosticTriggerStub.restore();
            logErrorStub.restore();
        });

        it('should call request.get', () => {
            gdprManager.retrievePersonalInformation();
            sinon.assert.calledWith(getRequestStub, 'https://tracking.adsx.unityads.unity3d.com/user-summary?gameId=12345&adid=12345678-9ABC-DEF0-1234-56789ABCDEF0&projectId=abcd-1234&storeId=xiaomi,google');
        });

        it('verify response has personal payload', () => {
            return gdprManager.retrievePersonalInformation().then((response) => {
                assert.equal(response.deviceModel, 'TestModel');
                assert.equal(response.country, 'FI');
            });
        });

        it('should call diagnostics on error', () => {
            getRequestStub.reset();
            getRequestStub.rejects('Test Error');
            return gdprManager.retrievePersonalInformation().then(() => {
                assert.fail('Should throw error');
            }).catch((error) => {
                assert.equal(error, 'Test Error');
                sinon.assert.calledWith(diagnosticTriggerStub, 'gdpr_request_failed', {url: 'https://tracking.adsx.unityads.unity3d.com/user-summary?gameId=12345&adid=12345678-9ABC-DEF0-1234-56789ABCDEF0&projectId=abcd-1234&storeId=xiaomi,google'});
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
