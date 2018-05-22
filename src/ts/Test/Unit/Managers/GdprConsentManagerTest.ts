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
import { WakeUpManager } from 'Managers/WakeUpManager';

describe('GdprConsentManagerTest', () => {
    let nativeBridge: NativeBridge;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let configuration: Configuration;
    let gdprConsentManager: GdprConsentManager;
    let wakeUpManager: WakeUpManager;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        clientInfo = TestFixtures.getClientInfo();
        configuration = TestFixtures.getConfiguration();
        wakeUpManager = sinon.createStubInstance(WakeUpManager);

        configuration.setGDPREnabled(false);
        configuration.setOptOutEnabled(false);
        configuration.setOptOutRecorded(false);
    });

    it('should accept boolean true for metadata value', () => {
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'gdpr.consent.value').returns(Promise.resolve(true));

        gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration, wakeUpManager);

        return gdprConsentManager.fetch().then(() => {
            assert.isTrue(configuration.isGDPREnabled(), 'GDPR was not enabled when consent metadata was set to boolean true');
            assert.isFalse(configuration.isOptOutEnabled(), 'GDPR opt-out was set to true when consent metadata was set to boolean true');
            assert.isTrue(configuration.isOptOutRecorded(), 'GDPR opt-out recorded was set to false when consent metadata was set to boolean true');
        });
    });

    it('should accept boolean false for metadata value', () => {
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'gdpr.consent.value').returns(Promise.resolve(false));

        gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration, wakeUpManager);

        return gdprConsentManager.fetch().then(() => {
            assert.isTrue(configuration.isGDPREnabled(), 'GDPR was not enabled when consent metadata was set to boolean false');
            assert.isTrue(configuration.isOptOutEnabled(), 'GDPR opt-out was set to false when consent metadata was set to boolean false');
            assert.isTrue(configuration.isOptOutRecorded(), 'GDPR opt-out recorded was set to false when consent metadata was set to boolean false');
        });
    });

    it('should accept string true for metadata value', () => {
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'gdpr.consent.value').returns(Promise.resolve('true'));

        gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration, wakeUpManager);

        return gdprConsentManager.fetch().then(() => {
            assert.isTrue(configuration.isGDPREnabled(), 'GDPR was not enabled when consent metadata was set to string true');
            assert.isFalse(configuration.isOptOutEnabled(), 'GDPR opt-out was set to true when consent metadata was set to string true');
            assert.isTrue(configuration.isOptOutRecorded(), 'GDPR opt-out recorded was set to false when consent metadata was set to string true');
        });
    });

    it('should accept string false for metadata value', () => {
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'gdpr.consent.value').returns(Promise.resolve('false'));

        gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration, wakeUpManager);

        return gdprConsentManager.fetch().then(() => {
            assert.isTrue(configuration.isGDPREnabled(), 'GDPR was not enabled when consent metadata was set to string false');
            assert.isTrue(configuration.isOptOutEnabled(), 'GDPR opt-out was set to false when consent metadata was set to string false');
            assert.isTrue(configuration.isOptOutRecorded(), 'GDPR opt-out recorded was set to false when consent metadata was set to string false');
        });
    });

    it('should not accept random string for metadata value', () => {
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'gdpr.consent.value').returns(Promise.resolve('test'));

        gdprConsentManager = new GdprConsentManager(nativeBridge, deviceInfo, clientInfo, configuration, wakeUpManager);

        return gdprConsentManager.fetch().then(() => {
            assert.isFalse(configuration.isGDPREnabled(), 'GDPR was enabled when consent metadata was set to random string');
            assert.isFalse(configuration.isOptOutEnabled(), 'GDPR opt-out was set to true when consent metadata was set to random string');
            assert.isFalse(configuration.isOptOutRecorded(), 'GDPR opt-out recorded was set to true when consent metadata was set to random string');
        });
    });
});
