import { LoadAndFillEventManager } from 'Ads/Managers/LoadAndFillEventManager';
import { Core } from 'Core/__mocks__/Core';
import { ICore } from 'Core/ICore';
import { CoreConfigurationMock, CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { AdsConfigurationMock, AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { RequestManagerMock, RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfoMock, ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { PrivacySDKMock, PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { Platform } from 'Core/Constants/Platform';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { StorageBridgeMock, StorageBridge } from 'Core/Utilities/__mocks__/StorageBridge';
import { Campaign } from 'Ads/Models/__mocks__/Campaign';
import { toAbGroup } from 'Core/Models/ABGroup';
import { Placement } from 'Ads/Models/__mocks__/Placement';

[Platform.ANDROID, Platform.IOS].forEach((platform) => {
    describe(`LoadAndFillEventManagerTests(${Platform[platform]})`, () => {
        let core: ICore;
        let coreConfig: CoreConfigurationMock;
        let adsConfig: AdsConfigurationMock;
        let request: RequestManagerMock;
        let clientInfo: ClientInfoMock;
        let privacySDK: PrivacySDKMock;
        let loadAndFillEventManager: LoadAndFillEventManager;
        let framework: FrameworkMetaData;
        let storageBridge: StorageBridgeMock;

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
            clientInfo.getSdkVersionName.mockReturnValue('3.4.5_test');
            coreConfig.getAbGroup.mockReturnValue(toAbGroup(99));
            coreConfig.getToken.mockReturnValue('test_token');
            coreConfig.isCoppaCompliant.mockReturnValue(true);

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
                expect(request.get).toBeCalledWith(`https://tracking.prd.mz.internal.unity3d.com/operative/test_1?eventType=load&token=test_token&abGroup=99&gameId=testgameid_1&campaignId=005472656d6f7220416e6472&adUnitId=test_ad_unit_1&coppa=true&optOutEnabled=false&frameworkName=test_name&frameworkVersion=test_version&platform=${Platform[platform]}&sdkVersion=3.4.5_test`, [], {
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
                expect(request.get).toBeCalledWith(`https://tracking.prd.mz.internal.unity3d.com/operative/test_1?eventType=load&token=test_token&abGroup=99&gameId=testgameid_1&campaignId=00005472656d6f7220694f53&adUnitId=test_ad_unit_1&coppa=true&optOutEnabled=false&frameworkName=test_name&frameworkVersion=test_version&platform=${Platform[platform]}&sdkVersion=3.4.5_test`, [], {
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
                expect(request.get).toBeCalledWith(`https://tracking.prd.mz.internal.unity3d.com/operative/test_2?eventType=fill&token=test_token&abGroup=99&gameId=testgameid_1&campaignId=test_id&adUnitId=test_ad_unit_2&coppa=true&optOutEnabled=false&frameworkName=test_name&frameworkVersion=test_version&platform=${Platform[platform]}&sdkVersion=3.4.5_test`, [], {
                    followRedirects: true,
                    retries: 2,
                    retryDelay: 10000,
                    retryWithConnectionEvents: false
                });
            });
        });
    });
});
