import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';

import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { PerformanceOperativeEventManager } from 'Ads/Managers/PerformanceOperativeEventManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import { MRAIDOperativeEventManager } from 'MRAID/Managers/MRAIDOperativeEventManager';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

describe('OperativeEventManagerFactoryTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();

    let nativeBridge: NativeBridge;
<<<<<<< HEAD:test-old/Unit/Managers/OperativeEventManagerFactoryTest.ts
    let request: RequestManager;
=======
    let storageBridge: StorageBridge;
    let request: Request;
>>>>>>> master:test/Unit/Managers/OperativeEventManagerFactoryTest.ts
    let metaDataManager: MetaDataManager;
    let sessionManager: SessionManager;
    let clientInfo: ClientInfo;
    let deviceInfo: DeviceInfo;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.ANDROID);

        storageBridge = new StorageBridge(nativeBridge);
        request = sinon.createStubInstance(Request);
        sessionManager = sinon.createStubInstance(SessionManager);
        metaDataManager = new MetaDataManager(nativeBridge);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        coreConfig = TestFixtures.getCoreConfiguration();
        adsConfig = TestFixtures.getAdsConfiguration();
    });

    describe('should return correct type of operative manager', () => {
        it('with PerformanceCampaign', () => {
            const campaign = TestFixtures.getCampaign();
            const manager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign
            });

            assert.isTrue(manager instanceof PerformanceOperativeEventManager, 'Manager not instance of PerformanceOperativeEventManager');
        });

        it('with XPromoCampaign', () => {
            const campaign = TestFixtures.getXPromoCampaign();
            const manager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign
            });

            assert.isTrue(manager instanceof XPromoOperativeEventManager, 'Manager not instance of XPromoOperativeEventManager');
        });

        it('with MRAIDCampaign', () => {
            const campaign = TestFixtures.getPlayableMRAIDCampaign();
            const manager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign
            });

            assert.isTrue(manager instanceof MRAIDOperativeEventManager, 'Manager not instance of MRAIDOperativeEventManager');
        });

        it('with all other campaign types', () => {
            const campaign = TestFixtures.getPromoCampaign();
            const manager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign
            });

            assert.isTrue(manager instanceof OperativeEventManager, 'Manager not instance of OperativeEventManager');
        });
    });
});
