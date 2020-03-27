import { AdMobSignalFactory, AdMobSignalFactoryMock } from 'AdMob/Utilities/__mocks__/AdMobSignalFactory';
import { AssetManager, AssetManagerMock } from 'Ads/Managers/__mocks__/AssetManager';
import { ContentTypeHandlerManager, ContentTypeHandlerManagerMock } from 'Ads/Managers/__mocks__/ContentTypeHandlerManager';
import { SessionManager, SessionManagerMock } from 'Ads/Managers/__mocks__/SessionManager';
import { UserPrivacyManager, UserPrivacyManagerMock } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { AdsConfiguration, AdsConfigurationMock } from 'Ads/Models/__mocks__/AdsConfiguration';
import { Placement } from 'Ads/Models/__mocks__/Placement.ts';
import { CacheBookkeepingManager, CacheBookkeepingManagerMock } from 'Core/Managers/__mocks__/CacheBookkeepingManager';
import { MetaDataManager, MetaDataManagerMock } from 'Core/Managers/__mocks__/MetaDataManager';
import { RequestManager, RequestManagerMock } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo, ClientInfoMock } from 'Core/Models/__mocks__/ClientInfo';
import { CoreConfiguration, CoreConfigurationMock } from 'Core/Models/__mocks__/CoreConfiguration';
import { DeviceInfo, DeviceInfoMock } from 'Core/Models/__mocks__/DeviceInfo';
import { Core } from 'Core/__mocks__/Core';
import { PrivacySDK, PrivacySDKMock } from 'Privacy/__mocks__/PrivacySDK';

import { AuctionStatusCode } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { AuctionProtocol, RequestManager as RealRequestManager } from 'Core/Managers/RequestManager';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';

// TODO: Update once json importing is fixed for .spec.ts
const AuctionV6Response = require('json/AuctionV6Response.json');

[Platform.IOS, Platform.ANDROID].forEach(platform => {
    describe(`LegacyCampaignManager on ${Platform[platform]}`, () => {
        let campaignManager: LegacyCampaignManager;
        let core: ICore;
        let coreConfig: CoreConfigurationMock;
        let adsConfig: AdsConfigurationMock;
        let assetManager: AssetManagerMock;
        let sessionManager: SessionManagerMock;
        let adMobSignalFactory: AdMobSignalFactoryMock;
        let requestManager: RequestManagerMock;
        let clientInfo: ClientInfoMock;
        let deviceInfo: DeviceInfoMock;
        let metaDataManager: MetaDataManagerMock;
        let cacheBookkeeping: CacheBookkeepingManagerMock;
        let contentTypeHandlerManager: ContentTypeHandlerManagerMock;
        let privacySDK: PrivacySDKMock;
        let userPrivacyManager: UserPrivacyManagerMock;

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

            let filledPlacements: { [placementId: string]: { campaign: Campaign; trackingUrls: ICampaignTrackingUrls | undefined } };
            let noFillPlacements: string[];
            let triggeredRefreshDelay: number;
            let triggeredCampaignCount: number;
            let triggeredAuctionStatusCode: AuctionStatusCode

            beforeEach(() => {
                filledPlacements = {};
                campaignManager.onCampaign.subscribe((placementId: string, campaign: Campaign, trackingUrls: ICampaignTrackingUrls | undefined) => {
                    filledPlacements[placementId] = {
                        campaign,
                        trackingUrls
                    };
                });

                noFillPlacements = [];
                campaignManager.onNoFill.subscribe((placement: string) => {
                    noFillPlacements.push(placement);
                });

                campaignManager.onError.subscribe((error) => {
                    throw error;
                });

                campaignManager.onAdPlanReceived.subscribe((refreshDelay: number, campaignCount: number, auctionStatusCode: number) => {
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
    });
});
