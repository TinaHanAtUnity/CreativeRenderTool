import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';

import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { PerformanceOperativeEventManager } from 'Ads/Managers/PerformanceOperativeEventManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Configuration } from 'Core/Models/Configuration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Request } from 'Core/Utilities/Request';
import 'mocha';
import { MRAIDOperativeEventManager } from 'MRAID/Managers/MRAIDOperativeEventManager';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';

describe('OperativeEventManagerFactoryTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();

    let nativeBridge: NativeBridge;
    let request: Request;
    let metaDataManager: MetaDataManager;
    let sessionManager: SessionManager;
    let clientInfo: ClientInfo;
    let deviceInfo: DeviceInfo;
    let configuration: Configuration;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.ANDROID);

        request = sinon.createStubInstance(Request);
        sessionManager = sinon.createStubInstance(SessionManager);
        metaDataManager = new MetaDataManager(nativeBridge);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        configuration = TestFixtures.getConfiguration();
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
                configuration: configuration,
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
                configuration: configuration,
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
                configuration: configuration,
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
                configuration: configuration,
                campaign: campaign
            });

            assert.isTrue(manager instanceof OperativeEventManager, 'Manager not instance of OperativeEventManager');
        });
    });
});
