import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { Request } from 'Utilities/Request';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { SessionManager } from 'Managers/SessionManager';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { PerformanceOperativeEventManager } from 'Managers/PerformanceOperativeEventManager';
import { XPromoOperativeEventManager } from 'Managers/XPromoOperativeEventManager';
import { MRAIDOperativeEventManager } from 'Managers/MRAIDOperativeEventManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Configuration } from 'Models/Configuration';

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
