import { AdMobSignalFactory } from 'AdMob/Utilities/__mocks__/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/__mocks__/AssetManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/__mocks__/ContentTypeHandlerManager';
import { SessionManager } from 'Ads/Managers/__mocks__/SessionManager';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { Placement } from 'Ads/Models/__mocks__/Placement.ts';
import { CacheBookkeepingManager } from 'Core/Managers/__mocks__/CacheBookkeepingManager';
import { MetaDataManager } from 'Core/Managers/__mocks__/MetaDataManager';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { Core } from 'Core/__mocks__/Core';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { AuctionStatusCode } from 'Ads/Models/AuctionResponse';
import { Platform } from 'Core/Constants/Platform';
import { AuctionProtocol, RequestManager as RealRequestManager } from 'Core/Managers/RequestManager';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';
// TODO: Update once json importing is fixed for .spec.ts
// eslint-disable-next-line
const AuctionV6Response = require('json/AuctionV6Response.json');
[Platform.IOS, Platform.ANDROID].forEach(platform => {
    describe(`LegacyCampaignManager on ${Platform[platform]}`, () => {
        let campaignManager;
        let core;
        let coreConfig;
        let adsConfig;
        let assetManager;
        let sessionManager;
        let adMobSignalFactory;
        let requestManager;
        let clientInfo;
        let deviceInfo;
        let metaDataManager;
        let cacheBookkeeping;
        let contentTypeHandlerManager;
        let privacySDK;
        let userPrivacyManager;
        beforeEach(() => {
            core = Core();
            coreConfig = CoreConfiguration();
            adsConfig = AdsConfiguration();
            assetManager = AssetManager();
            sessionManager = SessionManager();
            adMobSignalFactory = AdMobSignalFactory();
            requestManager = RequestManager();
            clientInfo = ClientInfo();
            deviceInfo = DeviceInfo();
            metaDataManager = MetaDataManager();
            cacheBookkeeping = CacheBookkeepingManager();
            contentTypeHandlerManager = ContentTypeHandlerManager();
            privacySDK = PrivacySDK();
            userPrivacyManager = UserPrivacyManager();
            // TODO: Potentially update with a construct other than the real CometCampaignParser
            contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
            RealRequestManager.getAuctionProtocol = () => {
                return AuctionProtocol.V6;
            };
            campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, requestManager, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager, undefined);
        });
        describe('Requesting with Auction V6 Protocol', () => {
            let filledPlacements;
            let noFillPlacements;
            let triggeredRefreshDelay;
            let triggeredCampaignCount;
            let triggeredAuctionStatusCode;
            beforeEach(() => {
                filledPlacements = {};
                campaignManager.onCampaign.subscribe((placementId, campaign, trackingUrls) => {
                    filledPlacements[placementId] = {
                        campaign,
                        trackingUrls
                    };
                });
                noFillPlacements = [];
                campaignManager.onNoFill.subscribe((placement) => {
                    noFillPlacements.push(placement);
                });
                campaignManager.onError.subscribe((error) => {
                    throw error;
                });
                campaignManager.onAdPlanReceived.subscribe((refreshDelay, campaignCount, auctionStatusCode) => {
                    triggeredRefreshDelay = refreshDelay;
                    triggeredCampaignCount = campaignCount;
                    triggeredAuctionStatusCode = auctionStatusCode;
                });
                requestManager.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(AuctionV6Response),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacements.mockReturnValue({
                    premium: Placement('premium'),
                    video: Placement('video'),
                    rewardedVideoZone: Placement('rewardedVideoZone'),
                    mraid: Placement('mraid')
                });
                return campaignManager.request();
            });
            it('should create the session', () => {
                expect(sessionManager.create).toBeCalledTimes(1);
                expect(sessionManager.create).toBeCalledWith('auction-v6-fake-auction-id');
            });
            it('should call for the comet campaign parser', () => {
                expect(contentTypeHandlerManager.getParser).toBeCalledTimes(1);
                expect(contentTypeHandlerManager.getParser).toBeCalledWith('comet/campaign');
            });
            it('should trigger onAdPlanReceived', () => {
                expect(triggeredRefreshDelay).toEqual(3600);
                expect(triggeredCampaignCount).toEqual(1);
                expect(triggeredAuctionStatusCode).toEqual(AuctionStatusCode.NORMAL);
            });
            it('should nofill the correct placements', () => {
                expect(noFillPlacements.length).toEqual(1);
                expect(noFillPlacements[0]).toEqual('mraid');
            });
            it('should fill the correct placements', () => {
                expect(Object.keys(filledPlacements).length).toEqual(3);
            });
        });
        describe('Should request with China auction endpoint ', () => {
            let campaignManagerCN;
            beforeEach(() => {
                coreConfig.getCountry = jest.fn().mockImplementation(() => 'CN');
                campaignManagerCN = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, requestManager, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager, undefined);
                return campaignManagerCN.request();
            });
            it('should change endpoint accordingly', () => {
                expect(requestManager.post).toHaveBeenCalledWith(`https://auction.unityads.unity.cn/v6/games/test/requests?&deviceModel=&platform=${Platform[platform].toLowerCase()}&sdkVersion=3420&stores=&screenWidth=567&screenHeight=1234&connectionType=&networkType=0`, expect.anything(), expect.anything(), expect.anything());
            });
        });
        describe('Should not request with China auction endpoint ', () => {
            beforeEach(() => {
                return campaignManager.request();
            });
            it('Endpoint should remain .com', () => {
                expect(requestManager.post).toHaveBeenCalledWith(`https://auction.unityads.unity3d.com/v6/games/test/requests?&deviceModel=&platform=${Platform[platform].toLowerCase()}&sdkVersion=3420&stores=&screenWidth=567&screenHeight=1234&connectionType=&networkType=0`, expect.anything(), expect.anything(), expect.anything());
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGVnYWN5Q2FtcGFpZ25NYW5hZ2VyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01hbmFnZXJzL0xlZ2FjeUNhbXBhaWduTWFuYWdlci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxrQkFBa0IsRUFBMEIsTUFBTSw4Q0FBOEMsQ0FBQztBQUMxRyxPQUFPLEVBQUUsWUFBWSxFQUFvQixNQUFNLHFDQUFxQyxDQUFDO0FBQ3JGLE9BQU8sRUFBRSx5QkFBeUIsRUFBaUMsTUFBTSxrREFBa0QsQ0FBQztBQUM1SCxPQUFPLEVBQUUsY0FBYyxFQUFzQixNQUFNLHVDQUF1QyxDQUFDO0FBQzNGLE9BQU8sRUFBRSxrQkFBa0IsRUFBMEIsTUFBTSwyQ0FBMkMsQ0FBQztBQUN2RyxPQUFPLEVBQUUsZ0JBQWdCLEVBQXdCLE1BQU0sdUNBQXVDLENBQUM7QUFDL0YsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzlELE9BQU8sRUFBRSx1QkFBdUIsRUFBK0IsTUFBTSxpREFBaUQsQ0FBQztBQUN2SCxPQUFPLEVBQUUsZUFBZSxFQUF1QixNQUFNLHlDQUF5QyxDQUFDO0FBQy9GLE9BQU8sRUFBRSxjQUFjLEVBQXNCLE1BQU0sd0NBQXdDLENBQUM7QUFDNUYsT0FBTyxFQUFFLFVBQVUsRUFBa0IsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RSxPQUFPLEVBQUUsaUJBQWlCLEVBQXlCLE1BQU0seUNBQXlDLENBQUM7QUFDbkcsT0FBTyxFQUFFLFVBQVUsRUFBa0IsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDM0MsT0FBTyxFQUFFLFVBQVUsRUFBa0IsTUFBTSw4QkFBOEIsQ0FBQztBQUUxRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUUvRCxPQUFPLEVBQUUs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