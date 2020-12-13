import { LoadAndFillEventManager } from 'Ads/Managers/LoadAndFillEventManager';
import { Core } from 'Core/__mocks__/Core';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { Platform } from 'Core/Constants/Platform';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { StorageBridge } from 'Core/Utilities/__mocks__/StorageBridge';
import { Campaign } from 'Ads/Models/__mocks__/Campaign';
import { toAbGroup } from 'Core/Models/ABGroup';
import { Placement } from 'Ads/Models/__mocks__/Placement';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
[Platform.ANDROID, Platform.IOS].forEach((platform) => {
    describe(`LoadAndFillEventManagerTests(${Platform[platform]})`, () => {
        let core;
        let coreConfig;
        let adsConfig;
        let request;
        let clientInfo;
        let privacySDK;
        let loadAndFillEventManager;
        let framework;
        let storageBridge;
        beforeEach(() => {
            core = Core();
            coreConfig = CoreConfiguration();
            adsConfig = AdsConfiguration();
            request = RequestManager();
            clientInfo = ClientInfo();
            privacySDK = PrivacySDK();
            framework = new FrameworkMetaData();
            storageBridge = StorageBridge();
            clientInfo.getGameId.mockReturnValue('testgameid_1');
            clientInfo.getSdkVersion.mockReturnValue('3450_test');
            coreConfig.getAbGroup.mockReturnValue(toAbGroup(99));
            coreConfig.getToken.mockReturnValue('test_token');
            coreConfig.isCoppaCompliant.mockReturnValue(true);
            CustomFeatures.shouldSendLoadFillEvent = jest.fn().mockReturnValue(true);
            framework.setModelValues({
                keys: [],
                category: '',
                version: 'test_version',
                name: 'test_name'
            });
            loadAndFillEventManager = new LoadAndFillEventManager(core.Api, request, platform, clientInfo, coreConfig, storageBridge, privacySDK, adsConfig, framework);
        });
        describe('sendLoadTrackingEvents', () => {
            beforeEach(() => {
                const placement = Placement('test_1');
                placement.getAdUnitId.mockReturnValue('test_ad_unit_1');
                privacySDK.isOptOutEnabled.mockReturnValue(false);
                adsConfig.getPlacement.mockReturnValue(placement);
                loadAndFillEventManager.sendLoadTrackingEvents('test_1');
            });
            it('should call requestManager.post', () => {
                expect(request.get).toBeCalledTimes(1);
            });
            it('should call requestManager.post with correct parameters', () => {
                if (platform !== Platform.ANDROID) {
                    return;
                }
                expect(request.get).toBeCalledWith(`https://tracking.prd.mz.internal.unity3d.com/operative/test_1?eventType=load&token=test_token&abGroup=99&gameId=testgameid_1&campaignId=005472656d6f7220416e6472&adUnitId=test_ad_unit_1&coppa=true&optOutEnabled=false&frameworkName=test_name&frameworkVersion=test_version&platform=${Platform[platform]}&sdkVersion=3450_test`, [], {
                    followRedirects: true,
                    retries: 2,
                    retryDelay: 10000,
                    retryWithConnectionEvents: false
                });
            });
            it('should call requestManager.post with correct parameters', () => {
                if (platform !== Platform.IOS) {
                    return;
                }
                expect(request.get).toBeCalledWith(`https://tracking.prd.mz.internal.unity3d.com/operative/test_1?eventType=load&token=test_token&abGroup=99&gameId=testgameid_1&campaignId=00005472656d6f7220694f53&adUnitId=test_ad_unit_1&coppa=true&optOutEnabled=false&frameworkName=test_name&frameworkVersion=test_version&platform=${Platform[platform]}&sdkVersion=3450_test`, [], {
                    followRedirects: true,
                    retries: 2,
                    retryDelay: 10000,
                    retryWithConnectionEvents: false
                });
            });
        });
        describe('sendFillTrackingEvents', () => {
            beforeEach(() => {
                const placement = Placement('test_2');
                placement.getAdUnitId.mockReturnValue('test_ad_unit_2');
                privacySDK.isOptOutEnabled.mockReturnValue(false);
                adsConfig.getPlacement.mockReturnValue(placement);
                loadAndFillEventManager.sendFillTrackingEvents('test_2', Campaign('', 'test_id'));
            });
            it('should call requestManager.post', () => {
                expect(request.get).toBeCalledTimes(1);
            });
            it('should call requestManager.post with correct parameters', () => {
                expect(request.get).toBeCalledWith(`https://tracking.prd.mz.internal.unity3d.com/operative/test_2?eventType=fill&token=test_token&abGroup=99&gameId=testgameid_1&campaignId=test_id&adUnitId=test_ad_unit_2&coppa=true&optOutEnabled=false&frameworkName=test_name&frameworkVersion=test_version&platform=${Platform[platform]}&sdkVersion=3450_test`, [], {
                    followRedirects: true,
                    retries: 2,
                    retryDelay: 10000,
                    retryWithConnectionEvents: false
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9hZEFuZEZpbGxFdmVudE1hbmFnZXIuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTWFuYWdlcnMvTG9hZEFuZEZpbGxFdmVudE1hbmFnZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUMvRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFM0MsT0FBTyxFQUF5QixpQkFBaUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ25HLE9BQU8sRUFBd0IsZ0JBQWdCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUMvRixPQUFPLEVBQXNCLGNBQWMsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQzVGLE9BQU8sRUFBa0IsVUFBVSxFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDOUUsT0FBTyxFQUFrQixVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDM0UsT0FBTyxFQUFxQixhQUFhLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUMxRixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDekQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMzRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFOUQsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtJQUNsRCxRQUFRLENBQUMsZ0NBQWdDLFFB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