import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { PerformanceOperativeEventManager } from 'Ads/Managers/PerformanceOperativeEventManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import { MRAIDOperativeEventManager } from 'MRAID/Managers/MRAIDOperativeEventManager';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
describe('OperativeEventManagerFactoryTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let request;
    let storageBridge;
    let metaDataManager;
    let sessionManager;
    let clientInfo;
    let deviceInfo;
    let coreConfig;
    let adsConfig;
    let privacySDK;
    let userPrivacyManager;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        storageBridge = new StorageBridge(core);
        request = sinon.createStubInstance(RequestManager);
        sessionManager = sinon.createStubInstance(SessionManager);
        metaDataManager = new MetaDataManager(core);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        coreConfig = TestFixtures.getCoreConfiguration();
        adsConfig = TestFixtures.getAdsConfiguration();
        privacySDK = sinon.createStubInstance(PrivacySDK);
        userPrivacyManager = sinon.createStubInstance(UserPrivacyManager);
    });
    describe('should return correct type of operative manager', () => {
        it('with PerformanceCampaign', () => {
            const campaign = TestFixtures.getCampaign();
            const manager = OperativeEventManagerFactory.createOperativeEventManager({
                platform,
                core,
                ads,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign,
                playerMetadataServerId: 'test-gamerSid',
                privacySDK: privacySDK,
                userPrivacyManager: userPrivacyManager
            });
            assert.isTrue(manager instanceof PerformanceOperativeEventManager, 'Manager not instance of PerformanceOperativeEventManager');
        });
        it('with XPromoCampaign', () => {
            const campaign = TestFixtures.getXPromoCampaign();
            const manager = OperativeEventManagerFactory.createOperativeEventManager({
                platform,
                core,
                ads,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign,
                playerMetadataServerId: 'test-gamerSid',
                privacySDK: privacySDK,
                userPrivacyManager: userPrivacyManager
            });
            assert.isTrue(manager instanceof XPromoOperativeEventManager, 'Manager not instance of XPromoOperativeEventManager');
        });
        it('with MRAIDCampaign', () => {
            const campaign = TestFixtures.getExtendedMRAIDCampaign();
            const manager = OperativeEventManagerFactory.createOperativeEventManager({
                platform,
                core,
                ads,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign,
                playerMetadataServerId: 'test-gamerSid',
                privacySDK: privacySDK,
                userPrivacyManager: userPrivacyManager
            });
            assert.isTrue(manager instanceof MRAIDOperativeEventManager, 'Manager not instance of MRAIDOperativeEventManager');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlcmF0aXZlRXZlbnRNYW5hZ2VyRmFjdG9yeVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL09wZXJhdGl2ZUV2ZW50TWFuYWdlckZhY3RvcnlUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUc3RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBSzlELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3ZGLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUMxRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDaEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFckUsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTtJQUU5QyxJQUFJLFFBQWtCLENBQUM7SUFDdkIsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUksWUFBMEIsQ0FBQztJ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