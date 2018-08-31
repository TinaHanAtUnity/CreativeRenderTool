import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Platform } from 'Common/Constants/Platform';
import { Request } from 'Core/Utilities/Request';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PerformanceOperativeEventManager } from 'Ads/Managers/PerformanceOperativeEventManager';
import { XPromoOperativeEventManager } from 'Ads/Managers/XPromoOperativeEventManager';
import { MRAIDOperativeEventManager } from 'Ads/Managers/MRAIDOperativeEventManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { Configuration } from 'Core/Models/Configuration';

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
