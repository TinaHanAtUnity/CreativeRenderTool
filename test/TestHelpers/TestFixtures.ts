import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { HTML } from 'Ads/Models/Assets/HTML';
import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { ICampaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { ICacheDiagnostics } from 'Ads/Utilities/CacheDiagnostics';
import { RingerMode } from 'Core/Constants/Android/RingerMode';
import { UIUserInterfaceIdiom } from 'Core/Constants/iOS/UIUserInterfaceIdiom';
import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import DummyDisplayInterstitialCampaign from 'json/DummyDisplayInterstitialCampaign.json';
import OnProgrammaticVPAIDPlcCampaign from 'json/OnProgrammaticVPAIDPlcCampaign.json';

import DummyPromoCampaign from 'json/DummyPromoCampaign.json';
import OnCometMraidPlcCampaign from 'json/OnCometMraidPlcCampaign.json';
import OnCometMraidPlcCampaignFollowsRedirects from 'json/OnCometMraidPlcCampaignFollowsRedirects.json';
import OnCometVideoPlcCampaign from 'json/OnCometVideoPlcCampaign.json';
import OnCometVideoPlcCampaignStandaloneAndroid from 'json/OnCometVideoPlcCampaignStandaloneAndroid.json';
import OnCometVideoPlcCampaignFollowsRedirects from 'json/OnCometVideoPlcCampaignFollowsRedirects.json';
import OnProgrammaticMraidUrlPlcCampaign from 'json/OnProgrammaticMraidUrlPlcCampaign.json';
import OnXPromoPlcCampaign from 'json/OnXPromoPlcCampaign.json';
import { IMRAIDCampaign, MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IPerformanceCampaign, PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { IPromoCampaign, PromoCampaign } from 'Promo/Models/PromoCampaign';

import * as sinon from 'sinon';
import { FakeAndroidDeviceInfo } from 'TestHelpers/FakeAndroidDeviceInfo';
import { FakeIosDeviceInfo } from 'TestHelpers/FakeIosDeviceInfo';
import { Vast } from 'VAST/Models/Vast';
import { IVastCampaign, VastCampaign } from 'VAST/Models/VastCampaign';
import { VastParser } from 'VAST/Utilities/VastParser';
import { VPAID } from 'VPAID/Models/VPAID';
import { IVPAIDCampaign, VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import EventTestVast from 'xml/EventTestVast.xml';
import VastCompanionXml from 'xml/VastCompanionAd.xml';
import VastCompanionAdWithoutImagesXml from 'xml/VastCompanionAdWithoutImages.xml';
import VPAIDCompanionAdWithAdParameters from 'xml/VPAIDCompanionAdWithAdParameters.xml';
import { IXPromoCampaign, XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { VPAIDParser } from 'VPAID/Utilities/VPAIDParser';
import { IPackageInfo } from 'Core/Native/Android/DeviceInfo';
import { ICoreApi } from '../../src/ts/Core/Core';
import { CacheApi } from '../../src/ts/Core/Native/Cache';
import { ConnectivityApi } from '../../src/ts/Core/Native/Connectivity';
import { DeviceInfoApi } from '../../src/ts/Core/Native/DeviceInfo';
import { ListenerApi as CoreListenerApi } from '../../src/ts/Core/Native/Listener';
import { PermissionsApi } from '../../src/ts/Core/Native/Permissions';
import { RequestApi } from '../../src/ts/Core/Native/Request';
import { ResolveApi } from '../../src/ts/Core/Native/Resolve';
import { SdkApi } from '../../src/ts/Core/Native/Sdk';
import { SensorInfoApi } from '../../src/ts/Core/Native/SensorInfo';
import { StorageApi } from '../../src/ts/Core/Native/Storage';
import { BroadcastApi } from '../../src/ts/Core/Native/Android/Broadcast';
import { IntentApi } from '../../src/ts/Core/Native/Android/Intent';
import { LifecycleApi } from '../../src/ts/Core/Native/Android/Lifecycle';
import { AndroidPreferencesApi } from '../../src/ts/Core/Native/Android/Preferences';
import { MainBundleApi } from '../../src/ts/Core/Native/iOS/MainBundle';
import { NotificationApi } from '../../src/ts/Core/Native/iOS/Notification';
import { IosPreferencesApi } from '../../src/ts/Core/Native/iOS/Preferences';
import { UrlSchemeApi } from '../../src/ts/Core/Native/iOS/UrlScheme';
import { AdsPropertiesApi } from '../../src/ts/Ads/Native/AdsProperties';
import { PlacementApi } from '../../src/ts/Ads/Native/Placement';
import { VideoPlayerApi } from '../../src/ts/Ads/Native/VideoPlayer';
import { WebPlayerApi } from '../../src/ts/Ads/Native/WebPlayer';
import { AndroidAdUnitApi } from '../../src/ts/Ads/Native/Android/AdUnit';
import { AndroidVideoPlayerApi } from '../../src/ts/Ads/Native/Android/VideoPlayer';
import { AppSheetApi } from '../../src/ts/Ads/Native/iOS/AppSheet';
import { IosAdUnitApi } from '../../src/ts/Ads/Native/iOS/AdUnit';
import { IosVideoPlayerApi } from '../../src/ts/Ads/Native/iOS/VideoPlayer';
import { IAdsApi } from '../../src/ts/Ads/Ads';
import { ListenerApi } from '../../src/ts/Ads/Native/Listener';
import { IBannersApi } from '../../src/ts/Banners/Banners';
import { BannerApi } from '../../src/ts/Banners/Native/Banner';
import { BannerListenerApi } from '../../src/ts/Banners/Native/UnityBannerListener';
import { Backend } from '../../src/ts/Backend/Backend';

const TestMediaID = 'beefcace-abcdefg-deadbeef';
export class TestFixtures {
    public static getPlacement(): Placement {
        return new Placement({
            id: 'fooId',
            name: 'fooName',
            'default': false,
            allowSkip: false,
            skipInSeconds: 0,
            disableBackButton: false,
            useDeviceOrientationForVideo: false,
            muteVideo: false,
            adTypes: ['TEST']
        });
    }

    public static getCometCampaignBaseParams(session: Session, campaignId: string, meta: string | undefined, adType?: string): ICampaign {
        return {
            id: campaignId,
            willExpireAt: undefined,
            adType: adType || undefined,
            correlationId: undefined,
            creativeId: undefined,
            seatId: undefined,
            meta: meta,
            session: session,
            mediaId: TestMediaID
        };
    }

    public static getPerformanceCampaignParams(json: any, storeName: StoreName): IPerformanceCampaign {
        const session = this.getSession();
        const parameters: IPerformanceCampaign = {
            ... this.getCometCampaignBaseParams(session, json.id, undefined),
            appStoreId: json.appStoreId,
            gameId: json.gameId,
            gameName: json.gameName,
            gameIcon: new Image(json.gameIcon, session),
            rating: json.rating,
            ratingCount: json.ratingCount,
            landscapeImage: new Image(json.endScreenLandscape, session),
            portraitImage: new Image(json.endScreenPortrait, session),
            clickAttributionUrl: json.clickAttributionUrl,
            clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects,
            clickUrl: json.clickUrl,
            videoEventUrls: json.videoEventUrls,
            bypassAppSheet: json.bypassAppSheet,
            store: storeName,
            adUnitStyle: new AdUnitStyle(json.adUnitStyle),
            appDownloadUrl: json.appDownloadUrl,
            trackingUrls: {
                'start': ['http://localhost:5000/operative?abGroup=0&adType=VIDEO&apiLevel=0&auctionId=&bidBundle=&bundleId=&buyerID=&campaignId=&connectionType=&country=&creativeId=&dealCode=&deviceMake=&deviceModel=&dspId=comet&eventType=start&frameworkName=&frameworkVersion=&gameId=&limitedAdTracking=false&mediationName=&mediationOrdinal=0&mediationVersion=&networkType=0&osVersion=&platform=&screenDensity=0&screenHeight=0&screenSize=0&screenWidth=0&sdkVersion=0&seatId=9000&token=&webviewUa=a'],
                'click': ['http://localhost:5000/operative?abGroup=0&adType=VIDEO&apiLevel=0&auctionId=&bidBundle=&bundleId=&buyerID=&campaignId=&connectionType=&country=&creativeId=&dealCode=&deviceMake=&deviceModel=&dspId=comet&eventType=click&frameworkName=&frameworkVersion=&gameId=&limitedAdTracking=false&mediationName=&mediationOrdinal=0&mediationVersion=&networkType=0&osVersion=&platform=&screenDensity=0&screenHeight=0&screenSize=0&screenWidth=0&sdkVersion=0&seatId=9000&token=&webviewUa=a'],
                'firstQuartile': ['http://localhost:5000/operative?abGroup=0&adType=VIDEO&apiLevel=0&auctionId=&bidBundle=&bundleId=&buyerID=&campaignId=&connectionType=&country=&creativeId=&dealCode=&deviceMake=&deviceModel=&dspId=comet&eventType=firstQuartile&frameworkName=&frameworkVersion=&gameId=&limitedAdTracking=false&mediationName=&mediationOrdinal=0&mediationVersion=&networkType=0&osVersion=&platform=&screenDensity=0&screenHeight=0&screenSize=0&screenWidth=0&sdkVersion=0&seatId=9000&token=&webviewUa=a'],
                'midpoint': ['http://localhost:5000/operative?abGroup=0&adType=VIDEO&apiLevel=0&auctionId=&bidBundle=&bundleId=&buyerID=&campaignId=&connectionType=&country=&creativeId=&dealCode=&deviceMake=&deviceModel=&dspId=comet&eventType=midpoint&frameworkName=&frameworkVersion=&gameId=&limitedAdTracking=false&mediationName=&mediationOrdinal=0&mediationVersion=&networkType=0&osVersion=&platform=&screenDensity=0&screenHeight=0&screenSize=0&screenWidth=0&sdkVersion=0&seatId=9000&token=&webviewUa=a'],
                'thirdQuartile': ['http://localhost:5000/operative?abGroup=0&adType=VIDEO&apiLevel=0&auctionId=&bidBundle=&bundleId=&buyerID=&campaignId=&connectionType=&country=&creativeId=&dealCode=&deviceMake=&deviceModel=&dspId=comet&eventType=thirdQuartile&frameworkName=&frameworkVersion=&gameId=&limitedAdTracking=false&mediationName=&mediationOrdinal=0&mediationVersion=&networkType=0&osVersion=&platform=&screenDensity=0&screenHeight=0&screenSize=0&screenWidth=0&sdkVersion=0&seatId=9000&token=&webviewUa=a'],
                'loaded': ['http://localhost:5000/operative?abGroup=0&adType=VIDEO&apiLevel=0&auctionId=&bidBundle=&bundleId=&buyerID=&campaignId=&connectionType=&country=&creativeId=&dealCode=&deviceMake=&deviceModel=&dspId=comet&eventType=loaded&frameworkName=&frameworkVersion=&gameId=&limitedAdTracking=false&mediationName=&mediationOrdinal=0&mediationVersion=&networkType=0&osVersion=&platform=&screenDensity=0&screenHeight=0&screenSize=0&screenWidth=0&sdkVersion=0&seatId=9000&token=&webviewUa=a'],
                'complete': ['http://localhost:5000/operative?abGroup=0&adType=VIDEO&apiLevel=0&auctionId=&bidBundle=&bundleId=&buyerID=&campaignId=&connectionType=&country=&creativeId=&dealCode=&deviceMake=&deviceModel=&dspId=comet&eventType=complete&frameworkName=&frameworkVersion=&gameId=&limitedAdTracking=false&mediationName=&mediationOrdinal=0&mediationVersion=&networkType=0&osVersion=&platform=&screenDensity=0&screenHeight=0&screenSize=0&screenWidth=0&sdkVersion=0&seatId=9000&token=&webviewUa=a'],
                'skip': ['http://localhost:5000/operative?abGroup=0&adType=VIDEO&apiLevel=0&auctionId=&bidBundle=&bundleId=&buyerID=&campaignId=&connectionType=&country=&creativeId=&dealCode=&deviceMake=&deviceModel=&dspId=comet&eventType=skip&frameworkName=&frameworkVersion=&gameId=&limitedAdTracking=false&mediationName=&mediationOrdinal=0&mediationVersion=&networkType=0&osVersion=&platform=&screenDensity=0&screenHeight=0&screenSize=0&screenWidth=0&sdkVersion=0&seatId=9000&token=&webviewUa=a'],
                'error': ['http://localhost:5000/operative?abGroup=0&adType=VIDEO&apiLevel=0&auctionId=&bidBundle=&bundleId=&buyerID=&campaignId=&connectionType=&country=&creativeId=&dealCode=&deviceMake=&deviceModel=&dspId=comet&eventType=skip&frameworkName=&frameworkVersion=&gameId=&limitedAdTracking=false&mediationName=&mediationOrdinal=0&mediationVersion=&networkType=0&osVersion=&platform=&screenDensity=0&screenHeight=0&screenSize=0&screenWidth=0&sdkVersion=0&seatId=9000&token=&webviewUa=a']
            }
        };

        if(json.trailerDownloadable && json.trailerDownloadableSize && json.trailerStreaming) {
            parameters.video = new Video(json.trailerDownloadable, session, json.trailerDownloadableSize, json.creativeId);
            parameters.streamingVideo = new Video(json.trailerStreaming, session, undefined, json.creativeId);
        }

        if(json.trailerPortraitDownloadable && json.trailerPortraitDownloadableSize && json.trailerPortraitStreaming) {
            parameters.videoPortrait = new Video(json.trailerPortraitDownloadable, session, json.trailerPortraitDownloadableSize, json.portraitCreativeId);
            parameters.streamingPortraitVideo = new Video(json.trailerPortraitStreaming, session, undefined, json.portraitCreativeId);
        }

        return parameters;
    }

    public static getXPromoCampaignParams(json: any, storeName: StoreName, creativeId: string): IXPromoCampaign {
        const session = this.getSession();
        const baseParams = this.getCometCampaignBaseParams(session, json.id, undefined);
        baseParams.creativeId = creativeId;
        const parameters: IXPromoCampaign = {
            ... baseParams,
            appStoreId: json.appStoreId,
            gameId: json.gameId,
            gameName: json.gameName,
            gameIcon: new Image(json.gameIcon, session),
            rating: json.rating,
            ratingCount: json.ratingCount,
            landscapeImage: new Image(json.endScreenLandscape, session),
            portraitImage: new Image(json.endScreenPortrait, session),
            clickAttributionUrl: json.clickAttributionUrl,
            clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects,
            bypassAppSheet: json.bypassAppSheet,
            store: storeName,
            trackingUrls: json.trackingUrls,
            videoEventUrls: json.videoEventUrls
        };

        if(json.trailerDownloadable && json.trailerDownloadableSize && json.trailerStreaming) {
            parameters.video = new Video(json.trailerDownloadable, session, json.trailerDownloadableSize);
            parameters.streamingVideo = new Video(json.trailerStreaming, session);
        }

        if(json.trailerPortraitDownloadable && json.trailerPortraitDownloadableSize && json.trailerPortraitStreaming) {
            parameters.videoPortrait = new Video(json.trailerPortraitDownloadable, session, json.trailerPortraitDownloadableSize);
            parameters.streamingPortraitVideo = new Video(json.trailerPortraitStreaming, session);
        }

        return parameters;
    }

    public static getPlayableMRAIDCampaignParams(json: any, storeName: StoreName): IMRAIDCampaign {
        const mraidContentJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        const mraidJson = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
        const session = this.getSession();
        return {
            ... this.getCometCampaignBaseParams(session, mraidContentJson.id, undefined, 'PLAYABLE'),
            useWebViewUserAgentForTracking: mraidJson.useWebViewUserAgentForTracking,
            resourceAsset: mraidContentJson.resourceUrl ? new HTML(mraidContentJson.resourceUrl, session, mraidContentJson.creativeId) : undefined,
            resource: undefined,
            dynamicMarkup: mraidContentJson.dynamicMarkup,
            trackingUrls: {},
            clickAttributionUrl: mraidContentJson.clickAttributionUrl,
            clickAttributionUrlFollowsRedirects: mraidContentJson.clickAttributionUrlFollowsRedirects,
            clickUrl: mraidContentJson.clickUrl ? mraidContentJson.clickUrl : undefined,
            videoEventUrls: mraidContentJson.videoEventUrls ? mraidContentJson.videoEventUrls : undefined,
            gameName: mraidContentJson.gameName,
            gameIcon: mraidContentJson.gameIcon ? new Image(mraidContentJson.gameIcon, session) : undefined,
            rating: mraidContentJson.rating,
            ratingCount: mraidContentJson.ratingCount,
            landscapeImage: mraidContentJson.endScreenLandscape ? new Image(mraidContentJson.endScreenLandscape, session) : undefined,
            portraitImage: mraidContentJson.endScreenPortrait ? new Image(mraidContentJson.endScreenPortrait, session) : undefined,
            bypassAppSheet: mraidContentJson.bypassAppSheet,
            store: storeName,
            appStoreId: mraidContentJson.appStoreId,
            playableConfiguration: undefined
        };
    }

    public static getProgrammaticMRAIDCampaignBaseParams(session: Session, campaignId: string, json: any): ICampaign {
        const mraidJson = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
        return {
            id: campaignId,
            willExpireAt: undefined,
            adType: mraidJson.adType || undefined,
            correlationId: json.correlationId || undefined,
            creativeId: mraidJson.creativeId || undefined,
            seatId: mraidJson.seatId || undefined,
            meta: mraidJson.meta || undefined,
            session: session,
            mediaId: TestMediaID
        };
    }

    public static getProgrammaticMRAIDCampaignParams(json: any, cacheTTL: number, campaignId: string, customParams: Partial<ICampaign> = {}): IMRAIDCampaign {
        const mraidContentJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        const mraidJson = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
        const session = this.getSession();

        return {
            ... this.getProgrammaticMRAIDCampaignBaseParams(this.getSession(), campaignId, json),
            ... customParams,
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            resourceAsset: mraidContentJson.inlinedUrl ? new HTML(mraidContentJson.inlinedUrl, session) : undefined,
            resource: '<div>resource</div>',
            dynamicMarkup: mraidContentJson.dynamicMarkup,
            trackingUrls: mraidJson.trackingUrls,
            clickAttributionUrl: mraidContentJson.clickAttributionUrl,
            clickAttributionUrlFollowsRedirects: mraidContentJson.clickAttributionUrlFollowsRedirects,
            clickUrl: mraidContentJson.clickUrl ? mraidContentJson.clickAttributionUrl : undefined,
            videoEventUrls: mraidContentJson.videoEventUrls ? mraidContentJson.videoEventUrls : undefined,
            gameName: mraidContentJson.gameName,
            gameIcon: mraidContentJson.gameIcon ? new Image(mraidContentJson.gameIcon, session) : undefined,
            rating: mraidContentJson.rating,
            ratingCount: mraidContentJson.ratingCount,
            landscapeImage: mraidContentJson.endScreenLandscape ? new Image(mraidContentJson.endScreenLandscape, session) : undefined,
            portraitImage: mraidContentJson.endScreenPortrait ? new Image(mraidContentJson.endScreenPortrait, session) : undefined,
            bypassAppSheet: mraidContentJson.bypassAppSheet,
            store: undefined,
            appStoreId: mraidContentJson.appStoreId,
            useWebViewUserAgentForTracking: mraidJson.useWebViewUserAgentForTracking,
            playableConfiguration: undefined
        };
    }

    public static getVASTCampaignBaseParams(session: Session, campaignId: string): ICampaign {
        return {
            id: campaignId,
            willExpireAt: undefined,
            adType: 'adType',
            correlationId: 'correlationId',
            creativeId: 'creativeId',
            seatId: 12345,
            meta: undefined,
            session: session,
            mediaId: TestMediaID
        };
    }

    public static getVastCampaignParams(vast: Vast, cacheTTL: number, campaignId: string): IVastCampaign {
        const session = this.getSession();
        const portraitUrl = vast.getCompanionPortraitUrl();
        let portraitAsset;
        if(portraitUrl) {
            portraitAsset = new Image(portraitUrl, session);
        }

        const landscapeUrl = vast.getCompanionLandscapeUrl();
        let landscapeAsset;
        if(landscapeUrl) {
            landscapeAsset = new Image(landscapeUrl, session);
        }

        return {
            ... this.getVASTCampaignBaseParams(session, campaignId),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            vast: vast,
            video: new Video(vast.getVideoUrl(), session),
            hasEndscreen: !!vast.getCompanionPortraitUrl() || !!vast.getCompanionLandscapeUrl(),
            portrait: portraitAsset,
            landscape: landscapeAsset,
            appCategory: 'appCategory',
            appSubcategory: 'appSubCategory',
            advertiserDomain: 'advertiserDomain',
            advertiserCampaignId: 'advertiserCampaignId',
            advertiserBundleId: 'advertiserBundleId',
            useWebViewUserAgentForTracking: false,
            buyerId: 'buyerId',
            trackingUrls: {},
            impressionUrls: vast.getImpressionUrls(),
            isMoatEnabled: true
        };
    }

    public static getDisplayInterstitialCampaignBaseParams(json: any, storeName: StoreName, campaignId: string): IDisplayInterstitialCampaign {
        const session = this.getSession();
        const baseCampaignParams: ICampaign = {
            id: campaignId,
            willExpireAt: json.cacheTTL ? Date.now() + json.cacheTTL * 1000 : undefined,
            adType: json.adType || undefined,
            correlationId: json.correlationId || undefined,
            creativeId: json.creativeId || undefined,
            seatId: json.seatId || undefined,
            meta: json.meta,
            session: session,
            mediaId: TestMediaID
        };

        return {
            ... baseCampaignParams,
            dynamicMarkup: json.content,
            trackingUrls: json.display.tracking || undefined,
            useWebViewUserAgentForTracking: false,
            width: json.display.width || undefined,
            height: json.display.height || undefined
        };
    }

    public static getVPAIDCampaignBaseParams(json: any): ICampaign {
        const session = this.getSession();
        return {
            id: json.campaignId,
            willExpireAt: json.cacheTTL ? Date.now() + json.cacheTTL * 1000 : undefined,
            adType: json.adType || undefined,
            correlationId: json.correlationId || undefined,
            creativeId: json.creativeId || undefined,
            seatId: json.seatId || undefined,
            meta: undefined,
            session: session,
            mediaId: TestMediaID
        };
    }

    public static getVPAIDCampaignParams(json: any, vpaid: VPAID): IVPAIDCampaign {
        return {
            ... this.getVPAIDCampaignBaseParams(json),
            vpaid: vpaid,
            trackingUrls: json.trackingUrls,
            appCategory: json.appCategory || undefined,
            appSubcategory: json.appSubCategory || undefined,
            advertiserDomain: json.advertiserDomain || undefined,
            advertiserCampaignId: json.advertiserCampaignId || undefined,
            advertiserBundleId: json.advertiserBundleId || undefined,
            useWebViewUserAgentForTracking: false,
            buyerId: json.buyerId || undefined
        };
    }

    public static getPromoCampaignParams(json: any, adType?: string, rewardedPromo?: boolean): IPromoCampaign {
        const session = this.getSession();
        const isRewardedPromo = (rewardedPromo !== undefined) ? rewardedPromo : false;
        return {
            ... this.getCometCampaignBaseParams(session, json.promo.id, json.meta, adType),
            iapProductId: json.promo.iapProductId,
            additionalTrackingEvents: json.promo.tracking ? json.promo.tracking : undefined,
            dynamicMarkup: json.promo.dynamicMarkup,
            creativeAsset: new HTML(json.promo.creativeUrl, session),
            rewardedPromo: isRewardedPromo
        };
    }

    public static getPromoCampaign(adType?: string, rewardedPromo?: boolean): PromoCampaign {
        const json = JSON.parse(DummyPromoCampaign);
        return new PromoCampaign(this.getPromoCampaignParams(json, adType, rewardedPromo));
    }

    public static getCampaignFollowsRedirects(): PerformanceCampaign {
        const json = JSON.parse(OnCometVideoPlcCampaignFollowsRedirects);
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.GOOGLE));
    }

    public static getCampaignStandaloneAndroid(): PerformanceCampaign {
        const json = JSON.parse(OnCometVideoPlcCampaignStandaloneAndroid);
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.STANDALONE_ANDROID));
    }

    public static getCampaign(): PerformanceCampaign {
        const json = JSON.parse(OnCometVideoPlcCampaign);
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.GOOGLE));
    }

    public static getXPromoCampaign(): XPromoCampaign {
        const json = JSON.parse(OnXPromoPlcCampaign);
        const xPromoJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        const creativeId = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].creativeId;
        return new XPromoCampaign(this.getXPromoCampaignParams(xPromoJson, StoreName.GOOGLE, creativeId));
    }

    public static getPlayableMRAIDCampaignFollowsRedirects(): MRAIDCampaign {
        const json = JSON.parse(OnCometMraidPlcCampaignFollowsRedirects);
        return new MRAIDCampaign(this.getPlayableMRAIDCampaignParams(json, StoreName.GOOGLE));
    }

    public static getPlayableMRAIDCampaign(): MRAIDCampaign {
        const json = JSON.parse(OnCometMraidPlcCampaign);
        return new MRAIDCampaign(this.getPlayableMRAIDCampaignParams(json, StoreName.GOOGLE));
    }

    public static getProgrammaticMRAIDCampaign(customParams: Partial<ICampaign> = {}): MRAIDCampaign {
        const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
        return new MRAIDCampaign(this.getProgrammaticMRAIDCampaignParams(json, 3600, 'testId', customParams));
    }

    public static getPerformanceMRAIDCampaign(customParams: Partial<ICampaign> = {}): PerformanceMRAIDCampaign {
        const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
        return new PerformanceMRAIDCampaign(this.getProgrammaticMRAIDCampaignParams(json, 3600, 'testId', customParams));
    }

    public static getCompanionVastCampaign(): VastCampaign {
        const vastParser = TestFixtures.getVastParser();
        const vast = vastParser.parseVast(VastCompanionXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }

    public static getCompanionVPAIDCampaign(): VPAIDCampaign {
        const vpaidParser = new VPAIDParser();
        const vpaid = vpaidParser.parse(VPAIDCompanionAdWithAdParameters);
        const json = JSON.parse(OnProgrammaticVPAIDPlcCampaign);
        return new VPAIDCampaign(this.getVPAIDCampaignParams(json, vpaid));
    }

    public static getEventVastCampaign(): VastCampaign {
        const vastParser = TestFixtures.getVastParser();
        const vastXml = EventTestVast;
        const vast = vastParser.parseVast(vastXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }

    public static getCompanionVastCampaignWihoutImages(): VastCampaign {
        const vastParser = TestFixtures.getVastParser();
        const vastXml = VastCompanionAdWithoutImagesXml;
        const vast = vastParser.parseVast(vastXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }

    public static getDisplayInterstitialCampaign(): DisplayInterstitialCampaign {
        const json = JSON.parse(DummyDisplayInterstitialCampaign);
        const displayInterstitialParams: IDisplayInterstitialCampaign = {
            ... this.getDisplayInterstitialCampaignBaseParams(json, StoreName.GOOGLE, '12345'),
            dynamicMarkup: json.content
        };
        return new DisplayInterstitialCampaign(displayInterstitialParams);
    }

    public static getClientInfo(platform?: Platform, gameId?: string): ClientInfo {
        if(typeof platform === 'undefined') {
            platform = Platform.ANDROID;
        }

        return new ClientInfo([
            gameId ? gameId : '12345',
            false,
            'com.unity3d.ads.example',
            '2.0.0-test2',
            2000,
            '2.0.0-alpha2',
            true,
            'http://example.com/config.json',
            'http://example.com/index.html',
            null,
            '2.0.0-webview',
            123456,
            false
        ]);
    }

    public static getAndroidDeviceInfo(core: ICoreApi): AndroidDeviceInfo {
        return new FakeAndroidDeviceInfo(core);
    }

    public static getIosDeviceInfo(core: ICoreApi): IosDeviceInfo {
        return new FakeIosDeviceInfo(core);
    }

    public static getOkNativeResponse(): INativeResponse {
        return {
            url: 'http://foo.url.com',
            response: 'foo response',
            responseCode: 200,
            headers: [['location', 'http://foobar.com']]
        };
    }

    public static getVastParser(): VastParser {
        let vastParser: VastParser;
        const domParser = new DOMParser();
        vastParser = new VastParser(domParser);
        return vastParser;
    }

    public static getBackend(platform: Platform): Backend {
        return new Backend(platform);
    }

    public static getNativeBridge(platform: Platform, backend: Backend): NativeBridge {
        const nativeBridge = new NativeBridge(backend, platform, false);
        backend.setNativeBridge(nativeBridge);
        return nativeBridge;
    }

    public static getCoreApi(nativeBridge: NativeBridge): ICoreApi {
        const platform = nativeBridge.getPlatform();
        return {
            Cache: new CacheApi(nativeBridge),
            Connectivity: new ConnectivityApi(nativeBridge),
            DeviceInfo: new DeviceInfoApi(nativeBridge),
            Listener: new CoreListenerApi(nativeBridge),
            Permissions: new PermissionsApi(nativeBridge),
            Request: new RequestApi(nativeBridge),
            Resolve: new ResolveApi(nativeBridge),
            Sdk: new SdkApi(nativeBridge),
            SensorInfo: new SensorInfoApi(nativeBridge),
            Storage: new StorageApi(nativeBridge),
            Android: platform === Platform.ANDROID ? {
                Broadcast: new BroadcastApi(nativeBridge),
                Intent: new IntentApi(nativeBridge),
                Lifecycle: new LifecycleApi(nativeBridge),
                Preferences: new AndroidPreferencesApi(nativeBridge)
            } : undefined,
            iOS: platform === Platform.IOS ? {
                MainBundle: new MainBundleApi(nativeBridge),
                Notification: new NotificationApi(nativeBridge),
                Preferences: new IosPreferencesApi(nativeBridge),
                UrlScheme: new UrlSchemeApi(nativeBridge)
            } : undefined
        };
    }

    public static getAdsApi(nativeBridge: NativeBridge): IAdsApi {
        const platform = nativeBridge.getPlatform();
        return {
            AdsProperties: new AdsPropertiesApi(nativeBridge),
            Listener: new ListenerApi(nativeBridge),
            Placement: new PlacementApi(nativeBridge),
            VideoPlayer: new VideoPlayerApi(nativeBridge),
            WebPlayer: new WebPlayerApi(nativeBridge),
            Android: platform === Platform.ANDROID ? {
                AdUnit: new AndroidAdUnitApi(nativeBridge),
                VideoPlayer: new AndroidVideoPlayerApi(nativeBridge)
            } : undefined,
            iOS: platform === Platform.IOS ? {
                AppSheet: new AppSheetApi(nativeBridge),
                AdUnit: new IosAdUnitApi(nativeBridge),
                VideoPlayer: new IosVideoPlayerApi(nativeBridge)
            } : undefined
        };
    }

    public static getBannersApi(nativeBridge: NativeBridge): IBannersApi {
        return {
            Banner: new BannerApi(nativeBridge),
            Listener: new BannerListenerApi(nativeBridge)
        };
    }

    public static getCoreConfiguration(): CoreConfiguration {
        const json = JSON.parse(ConfigurationAuctionPlc);
        return CoreConfigurationParser.parse(json);
    }

    public static getAdsConfiguration(): AdsConfiguration {
        const json = JSON.parse(ConfigurationAuctionPlc);
        return AdsConfigurationParser.parse(json);
    }

    public static getCacheDiagnostics(): ICacheDiagnostics {
        return {
            creativeType: 'TEST',
            targetGameId: 5678,
            targetCampaignId: '123456abcdef'
        };
    }

    public static getSession(): Session {
        return new Session('12345');
    }

    public static getPackageInfo(): IPackageInfo {
        return {
            installer: 'com.install.er',
            firstInstallTime: 12345,
            lastUpdateTime: 67890,
            versionCode: 123,
            versionName: '1.2.3',
            packageName: 'com.package.name'
        };
    }

    public static getDisplayMarkup(): string {
        const json = JSON.parse(DummyDisplayInterstitialCampaign);
        return decodeURIComponent(json.display.markup);
    }

    public static getFakeNativeDeviceInfo(): any {
        return {
            getConnectionType: sinon.stub().returns(Promise.resolve('wifi')),
            getNetworkType: sinon.stub().returns(Promise.resolve(0)),
            getAdvertisingTrackingId: sinon.stub().returns(Promise.resolve('12345')),
            getLimitAdTrackingFlag: sinon.stub().returns(Promise.resolve(true)),
            getOsVersion: sinon.stub().returns(Promise.resolve('testVersion')),
            getModel: sinon.stub().returns(Promise.resolve('testModel')),
            getScreenHeight: sinon.stub().returns(Promise.resolve(1200)),
            getScreenWidth: sinon.stub().returns(Promise.resolve(800)),
            getSystemLanguage: sinon.stub().returns(Promise.resolve('fi')),
            isRooted: sinon.stub().returns(Promise.resolve(true)),
            getTimeZone: sinon.stub().returns(Promise.resolve('+0100')),
            getTotalMemory: sinon.stub().returns(Promise.resolve(1024)),
            getHeadset: sinon.stub().returns(Promise.resolve(true)),
            getScreenBrightness: sinon.stub().returns(Promise.resolve(0.7)),
            getBatteryLevel: sinon.stub().returns(Promise.resolve(0.3)),
            getBatteryStatus: sinon.stub().returns(Promise.resolve(1)),
            getFreeMemory: sinon.stub().returns(Promise.resolve(1024)),
            getNetworkOperatorName: sinon.stub().returns(Promise.resolve('operatorName')),
            getNetworkOperator: sinon.stub().returns(Promise.resolve('operator')),
            getCPUCount: sinon.stub().returns(Promise.resolve(1)),
            getGLVersion: sinon.stub().returns(Promise.resolve('2.0'))
        };
    }

    public static getFakeNativeAndroidDeviceInfo(): any {
        return {
            getAndroidId: sinon.stub().returns(Promise.resolve('17')),
            getApiLevel: sinon.stub().returns(Promise.resolve(16)),
            getManufacturer: sinon.stub().returns(Promise.resolve('N')),
            getScreenDensity: sinon.stub().returns(Promise.resolve(2)),
            getScreenLayout: sinon.stub().returns(Promise.resolve(1)),
            getTotalSpace: sinon.stub().returns(Promise.resolve(2048)),
            getRingerMode: sinon.stub().returns(Promise.resolve(RingerMode.RINGER_MODE_NORMAL)),
            getDeviceVolume: sinon.stub().returns(Promise.resolve(0.5)),
            getFreeSpace: sinon.stub().returns(Promise.resolve(16)),
            isAppInstalled: sinon.stub().returns(Promise.resolve(true)),
            getDeviceMaxVolume: sinon.stub().returns(Promise.resolve(1)),
            getApkDigest: sinon.stub().returns(Promise.resolve('apkDigest')),
            getCertificateFingerprint: sinon.stub().returns(Promise.resolve('certificateFingerPrint')),
            getBoard: sinon.stub().returns(Promise.resolve('board')),
            getBootloader: sinon.stub().returns(Promise.resolve('bootLoader')),
            getBrand: sinon.stub().returns(Promise.resolve('brand')),
            getDevice: sinon.stub().returns(Promise.resolve('device')),
            getHardware: sinon.stub().returns(Promise.resolve('hardware')),
            getHost: sinon.stub().returns(Promise.resolve('host')),
            getProduct: sinon.stub().returns(Promise.resolve('product')),
            getFingerprint: sinon.stub().returns(Promise.resolve('fingerPrint')),
            getSupportedAbis: sinon.stub().returns(Promise.resolve(['supported_abi_1', 'supported_abi_2'])),
            getSensorList: sinon.stub().returns(Promise.resolve([])),
            isUSBConnected: sinon.stub().returns(Promise.resolve(false)),
            getUptime: sinon.stub().returns(Promise.resolve(10000)),
            getElapsedRealtime: sinon.stub().returns(Promise.resolve(10000))
        };
    }

    public static getFakeNativeIosDeviceInfo(): any {
        return {
            getUserInterfaceIdiom: sinon.stub().returns(Promise.resolve(UIUserInterfaceIdiom.UIUserInterfaceIdiomPad)),
            getScreenScale: sinon.stub().returns(Promise.resolve(2)),
            isSimulator: sinon.stub().returns(Promise.resolve(true)),
            getTotalSpace: sinon.stub().returns(Promise.resolve(1024)),
            getDeviceVolume: sinon.stub().returns(Promise.resolve(0.5)),
            getFreeSpace: sinon.stub().returns(Promise.resolve(16)),
            getStatusBarHeight: sinon.stub().returns(Promise.resolve(40)),
            getStatusBarWidth: sinon.stub().returns(Promise.resolve(768)),
            getDeviceMaxVolume: sinon.stub().returns(Promise.resolve(1)),
            getSensorList: sinon.stub().returns(Promise.resolve([]))
        };
    }

}
