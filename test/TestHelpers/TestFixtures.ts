import { IAdsApi, IAds } from 'Ads/IAds';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { HTML } from 'Ads/Models/Assets/HTML';
import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { ICampaign, Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { AdsPropertiesApi } from 'Ads/Native/AdsProperties';
import { AndroidAdUnitApi } from 'Ads/Native/Android/AdUnit';
import { AndroidVideoPlayerApi } from 'Ads/Native/Android/VideoPlayer';
import { IosAdUnitApi } from 'Ads/Native/iOS/AdUnit';
import { AppSheetApi } from 'Store/Native/iOS/AppSheet';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/VideoPlayer';
import { ListenerApi } from 'Ads/Native/Listener';
import { PlacementApi } from 'Ads/Native/Placement';
import { VideoPlayerApi } from 'Ads/Native/VideoPlayer';
import { WebPlayerApi } from 'Ads/Native/WebPlayer';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { ICacheDiagnostics } from 'Ads/Utilities/CacheDiagnostics';
import { IAnalyticsApi } from 'Analytics/IAnalytics';
import { AnalyticsApi } from 'Analytics/Native/Analytics';
import { Backend } from 'Backend/Backend';
import { IBannerNativeApi, IBannerModule } from 'Banners/IBannerModule';
import { BannerApi } from 'Banners/Native/BannerApi';
import { BannerListenerApi } from 'Banners/Native/BannerListenerApi';
import { RingerMode } from 'Core/Constants/Android/RingerMode';
import { UIUserInterfaceIdiom } from 'Core/Constants/iOS/UIUserInterfaceIdiom';
import { Platform } from 'Core/Constants/Platform';
import { ICore, ICoreApi } from 'Core/ICore';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration, CacheMode } from 'Core/Models/CoreConfiguration';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { BroadcastApi } from 'Core/Native/Android/Broadcast';
import { IPackageInfo } from 'Core/Native/Android/DeviceInfo';
import { IntentApi } from 'Core/Native/Android/Intent';
import { LifecycleApi } from 'Core/Native/Android/Lifecycle';
import { AndroidPreferencesApi } from 'Core/Native/Android/Preferences';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CacheApi } from 'Core/Native/Cache';
import { ConnectivityApi } from 'Core/Native/Connectivity';
import { DeviceInfoApi } from 'Core/Native/DeviceInfo';
import { MainBundleApi } from 'Core/Native/iOS/MainBundle';
import { NotificationApi } from 'Core/Native/iOS/Notification';
import { IosPreferencesApi } from 'Core/Native/iOS/Preferences';
import { UrlSchemeApi } from 'Core/Native/iOS/UrlScheme';
import { ListenerApi as CoreListenerApi } from 'Core/Native/Listener';
import { PermissionsApi } from 'Core/Native/Permissions';
import { RequestApi } from 'Core/Native/Request';
import { ResolveApi } from 'Core/Native/Resolve';
import { SdkApi } from 'Core/Native/Sdk';
import { SensorInfoApi } from 'Core/Native/SensorInfo';
import { StorageApi } from 'Core/Native/Storage';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import DummyDisplayInterstitialCampaign from 'json/DummyDisplayInterstitialCampaign.json';

import OnCometMraidPlcCampaign from 'json/OnCometMraidPlcCampaign.json';
import OnCometMraidPlcCampaignFollowsRedirects from 'json/OnCometMraidPlcCampaignFollowsRedirects.json';
import OnCometVideoPlcCampaign from 'json/OnCometVideoPlcCampaign.json';
import OnCometVideoPlcCampaignFollowsRedirects from 'json/OnCometVideoPlcCampaignFollowsRedirects.json';
import OnCometVideoPlcCampaignStandaloneAndroid from 'json/OnCometVideoPlcCampaignStandaloneAndroid.json';
import OnProgrammaticMraidUrlPlcCampaign from 'json/OnProgrammaticMraidUrlPlcCampaign.json';
import OnProgrammaticVPAIDPlcCampaign from 'json/OnProgrammaticVPAIDPlcCampaign.json';
import OnXPromoPlcCampaign from 'json/OnXPromoPlcCampaign.json';
import OnCometVideoPlcCampaignWithSquareEndScreenAsset from 'json/OnCometVideoPlcCampaignWithSquareEndScreenAsset.json';
import { IMRAIDCampaign, MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { IPerformanceCampaign, PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';

import * as sinon from 'sinon';
import { FakeAndroidDeviceInfo } from 'TestHelpers/FakeAndroidDeviceInfo';
import { FakeIosDeviceInfo } from 'TestHelpers/FakeIosDeviceInfo';
import { Vast } from 'VAST/Models/Vast';
import { IVastCampaign, VastCampaign } from 'VAST/Models/VastCampaign';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { VPAID } from 'VPAID/Models/VPAID';
import { IVPAIDCampaign, VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';
import { VPAIDParser } from 'VPAID/Utilities/VPAIDParser';
import EventTestVast from 'xml/EventTestVast.xml';
import VastStaticCompanionXml from 'xml/VastCompanionAd.xml';
import VastIframeCompanionXml from 'xml/VastCompanionAdIFrame.xml';
import VastHTMLCompanionXml from 'xml/VastCompanionAdHTML.xml';
import VastAdWithoutCompanionAdXml from 'xml/VastAdWithoutCompanionAd.xml';
import VastCompanionAdWithoutImagesXml from 'xml/VastCompanionAdWithoutImages.xml';
import VPAIDCompanionAdWithAdParameters from 'xml/VPAIDCompanionAdWithAdParameters.xml';
import VastAdVerificationAsExtension from 'xml/VastWithExtensionAdVerification.xml';
import { IXPromoCampaign, XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { IARApi } from 'AR/AR';
import { AndroidARApi } from 'AR/Native/Android/AndroidARApi';
import { ARApi } from 'AR/Native/AR';
import { IosARApi } from 'AR/Native/iOS/IosARApi';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { ThirdPartyEventManagerFactory } from 'Ads/Managers/ThirdPartyEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';
import { Privacy } from 'Ads/Views/Privacy';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { VideoOverlay, IVideoOverlayParameters } from 'Ads/Views/VideoOverlay';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { StoreHandler, IStoreHandlerDownloadParameters, IStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';
import { VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { PerformanceOperativeEventManager } from 'Ads/Managers/PerformanceOperativeEventManager';
import { PerformanceAdUnit, IPerformanceAdUnitParameters } from 'Performance/AdUnits/PerformanceAdUnit';
import { VastParserStrict } from 'VAST/Utilities/VastParserStrict';
import { UnityInfo } from 'Core/Models/UnityInfo';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { ResolveManager } from 'Core/Managers/ResolveManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { MissedImpressionManager } from 'Ads/Managers/MissedImpressionManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignRefreshManager } from 'Ads/Managers/CampaignRefreshManager';
import { BannerWebPlayerContainer } from 'Ads/Utilities/WebPlayer/BannerWebPlayerContainer';
import { BannerCampaignManager } from 'Banners/Managers/BannerCampaignManager';
import { BannerPlacementManager } from 'Banners/Managers/BannerPlacementManager';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
import { BannerCampaign, IBannerCampaign } from 'Banners/Models/BannerCampaign';
import OnProgrammaticBannerCampaign from 'json/OnProgrammaticBannerCampaign.json';
import { BannerAdUnitFactory } from 'Banners/AdUnits/BannerAdUnitFactory';
import { IStoreApi, IStore } from 'Store/IStore';
import { AndroidStoreApi } from 'Store/Native/Android/Store';
import { ProductsApi } from 'Store/Native/iOS/Products';
import { NativeErrorApi } from 'Core/Api/NativeErrorApi';
import { BannerAdContextManager } from 'Banners/Managers/BannerAdContextManager';
import { LoadApi } from 'Core/Native/LoadApi';
import { IAdMobCampaign, AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AdMobView } from 'AdMob/Views/AdMobView';
import { IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { Analytics } from 'Analytics/Analytics';
import { Store } from 'Store/Store';
import { ClassDetectionApi } from 'Core/Native/ClassDetection';
import { SdkDetectionInfo } from 'Core/Models/SdkDetectionInfo';
import { IMonetizationApi } from 'Monetization/IMonetization';
import { MonetizationListenerApi } from 'Monetization/Native/MonetizationListener';
import { PlacementContentsApi } from 'Monetization/Native/PlacementContents';
import { TrackingManagerApi } from 'Core/Native/iOS/TrackingManager';

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
            skipEndCardOnClose: false,
            useCloseIconInsteadOfSkipIcon: false,
            disableVideoControlsFade: false,
            refreshDelay: 1000,
            muteVideo: false,
            adTypes: ['TEST'],
            banner: { refreshRate: 30 }
        });
    }

    public static getAdmobCampaignBaseParams(): IAdMobCampaign {
        const session = sinon.createStubInstance(Session);
        return {
            ... this.getCampaignBaseParams(session, 'fakeCampaignId', undefined),
            dynamicMarkup: 'foo',
            useWebViewUserAgentForTracking: false,
            isOMEnabled: false,
            omVendors: [],
            shouldMuteByDefault: false
        };
    }

    public static getCampaignBaseParams(session: Session, campaignId: string, meta: string | undefined, adType?: string): ICampaign {
        return {
            id: campaignId,
            willExpireAt: undefined,
            contentType: CometCampaignParser.ContentType,
            adType: adType || undefined,
            correlationId: undefined,
            creativeId: undefined,
            seatId: undefined,
            meta: meta,
            session: session,
            mediaId: TestMediaID,
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
            },
            isLoadEnabled: false
        };
    }

    public static getPerformanceCampaignParams(json: any, storeName: StoreName, session?: Session): IPerformanceCampaign {
        if (!session) {
            session = this.getSession();
        }
        const parameters: IPerformanceCampaign = {
            ... this.getCampaignBaseParams(session, json.id, undefined),
            appStoreId: json.appStoreId,
            gameId: json.gameId,
            gameName: json.gameName,
            gameIcon: new Image(json.gameIcon, session),
            rating: json.rating,
            ratingCount: json.ratingCount,
            landscapeImage: json.endScreenLandscape ? new Image(json.endScreenLandscape, session) : undefined,
            portraitImage: json.endScreenPortrait ? new Image(json.endScreenPortrait, session) : undefined,
            squareImage: json.endScreen ? new Image(json.endScreen, session) : undefined,
            clickAttributionUrl: json.clickAttributionUrl,
            clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects,
            clickUrl: json.clickUrl,
            videoEventUrls: json.videoEventUrls,
            bypassAppSheet: json.bypassAppSheet,
            store: storeName,
            adUnitStyle: new AdUnitStyle(json.adUnitStyle),
            appDownloadUrl: json.appDownloadUrl
        };

        if (json.trailerDownloadable && json.trailerDownloadableSize && json.trailerStreaming) {
            parameters.video = new Video(json.trailerDownloadable, session, json.trailerDownloadableSize, json.creativeId);
            parameters.streamingVideo = new Video(json.trailerStreaming, session, undefined, json.creativeId);
        }

        if (json.trailerPortraitDownloadable && json.trailerPortraitDownloadableSize && json.trailerPortraitStreaming) {
            parameters.videoPortrait = new Video(json.trailerPortraitDownloadable, session, json.trailerPortraitDownloadableSize, json.portraitCreativeId);
            parameters.streamingPortraitVideo = new Video(json.trailerPortraitStreaming, session, undefined, json.portraitCreativeId);
        }

        return parameters;
    }

    public static getXPromoCampaignParams(json: any, storeName: StoreName, creativeId: string, session?: Session): IXPromoCampaign {
        if (!session) {
            session = this.getSession();
        }
        const baseParams = this.getCampaignBaseParams(session, json.id, undefined);
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
            videoEventUrls: json.videoEventUrls
        };

        if (json.trailerDownloadable && json.trailerDownloadableSize && json.trailerStreaming) {
            parameters.video = new Video(json.trailerDownloadable, session, json.trailerDownloadableSize);
            parameters.streamingVideo = new Video(json.trailerStreaming, session);
        }

        if (json.trailerPortraitDownloadable && json.trailerPortraitDownloadableSize && json.trailerPortraitStreaming) {
            parameters.videoPortrait = new Video(json.trailerPortraitDownloadable, session, json.trailerPortraitDownloadableSize);
            parameters.streamingPortraitVideo = new Video(json.trailerPortraitStreaming, session);
        }

        return parameters;
    }

    public static getExtendedMRAIDCampaignParams(json: any, storeName: StoreName, session?: Session): IMRAIDCampaign {
        if (!session) {
            session = this.getSession();
        }
        const mraidContentJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        const mraidJson = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
        return {
            ... this.getCampaignBaseParams(session, mraidContentJson.id, undefined, 'PLAYABLE'),
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
            playableConfiguration: undefined,
            targetGameId: mraidContentJson.gameId,
            isCustomCloseEnabled: false
        };
    }

    public static getProgrammaticMRAIDCampaignBaseParams(session: Session, campaignId: string, json: any): ICampaign {
        const mraidJson = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
        return {
            id: campaignId,
            willExpireAt: undefined,
            contentType: ProgrammaticMraidParser.ContentType,
            adType: mraidJson.adType || undefined,
            correlationId: json.correlationId || undefined,
            creativeId: mraidJson.creativeId || undefined,
            seatId: mraidJson.seatId || undefined,
            meta: mraidJson.meta || undefined,
            session: session,
            mediaId: TestMediaID,
            trackingUrls: {},
            isLoadEnabled: false
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
            playableConfiguration: undefined,
            targetGameId: mraidContentJson.gameId,
            isCustomCloseEnabled: false
        };
    }

    public static getVASTCampaignBaseParams(session: Session, campaignId: string): ICampaign {
        return {
            id: campaignId,
            willExpireAt: undefined,
            contentType: ProgrammaticVastParser.ContentType,
            adType: 'adType',
            correlationId: 'correlationId',
            creativeId: 'creativeId',
            seatId: 12345,
            meta: undefined,
            session: session,
            mediaId: TestMediaID,
            trackingUrls: {},
            isLoadEnabled: false
        };
    }

    public static getVastCampaignParams(vast: Vast, cacheTTL: number, campaignId: string, session?: Session): IVastCampaign {
        if (!session) {
            session = this.getSession();
        }
        let hasStaticEndscreenFlag = false;
        const staticPortraitUrl = vast.getStaticCompanionPortraitUrl();
        const staticLandscapeUrl = vast.getStaticCompanionLandscapeUrl();
        let staticPortraitAsset;
        let staticLandscapeAsset;
        if (staticPortraitUrl) {
            hasStaticEndscreenFlag = true;
            staticPortraitAsset = new Image(staticPortraitUrl, session);
        }
        if (staticLandscapeUrl) {
            hasStaticEndscreenFlag = true;
            staticLandscapeAsset = new Image(staticLandscapeUrl, session);
        }

        const hasIframeEndscreenFlag = !!vast.getIframeCompanionResourceUrl();

        const hasHtmlEndscreenFlag = !!vast.getHtmlCompanionResourceContent();

        return {
            ... this.getVASTCampaignBaseParams(session, campaignId),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            vast: vast,
            video: new Video(vast.getVideoUrl(), session),
            hasStaticEndscreen: hasStaticEndscreenFlag,
            hasIframeEndscreen: hasIframeEndscreenFlag,
            hasHtmlEndscreen: hasHtmlEndscreenFlag,
            staticPortrait: staticPortraitAsset,
            staticLandscape: staticLandscapeAsset,
            appCategory: 'appCategory',
            appSubcategory: 'appSubCategory',
            advertiserDomain: 'advertiserDomain',
            advertiserCampaignId: 'advertiserCampaignId',
            advertiserBundleId: 'advertiserBundleId',
            useWebViewUserAgentForTracking: false,
            buyerId: 'buyerId',
            trackingUrls: {},
            impressionUrls: vast.getImpressionUrls(),
            isMoatEnabled: true,
            isOMEnabled: false,
            omVendors: []
        };
    }

    public static getDisplayInterstitialCampaignBaseParams(json: any, storeName: StoreName, campaignId: string, session?: Session): IDisplayInterstitialCampaign {
        if (!session) {
            session = this.getSession();
        }
        const baseCampaignParams: ICampaign = {
            id: campaignId,
            willExpireAt: json.cacheTTL ? Date.now() + json.cacheTTL * 1000 : undefined,
            contentType: ProgrammaticStaticInterstitialParser.ContentTypeHtml,
            adType: json.adType || undefined,
            correlationId: json.correlationId || undefined,
            creativeId: json.creativeId || undefined,
            seatId: json.seatId || undefined,
            meta: json.meta,
            session: session,
            mediaId: TestMediaID,
            trackingUrls: {},
            isLoadEnabled: false
        };

        return {
            ... baseCampaignParams,
            dynamicMarkup: json.content,
            trackingUrls: json.display.tracking || {},
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
            contentType: ProgrammaticVPAIDParser.ContentType,
            adType: json.adType || undefined,
            correlationId: json.correlationId || undefined,
            creativeId: json.creativeId || undefined,
            seatId: json.seatId || undefined,
            meta: undefined,
            session: session,
            mediaId: TestMediaID,
            trackingUrls: {},
            isLoadEnabled: false
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

    public static getBannerCampaignParams(json: any): IBannerCampaign {
        return {
            markup: json.content,
            contentType: json.contentType,
            width: json.width,
            height: json.height,
            trackingUrls: json.trackingUrls,
            useWebViewUserAgentForTracking: false,
            id: json.campaignId,
            session: this.getSession(),
            mediaId: '000000000000000000000003',
            willExpireAt: json.cacheTTL ? Date.now() + json.cacheTTL * 1000 : undefined,
            adType: json.adType,
            correlationId: json.correlationId || undefined,
            creativeId: json.creativeId || undefined,
            seatId: json.seatId || undefined,
            meta: undefined,
            isLoadEnabled: false
        };
    }

    public static getCampaignFollowsRedirects(): PerformanceCampaign {
        const json = OnCometVideoPlcCampaignFollowsRedirects;
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.GOOGLE));
    }

    public static getCampaignStandaloneAndroid(): PerformanceCampaign {
        const json = OnCometVideoPlcCampaignStandaloneAndroid;
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.STANDALONE_ANDROID));
    }

    public static getCampaign(session?: Session): PerformanceCampaign {
        const json = OnCometVideoPlcCampaign;
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.GOOGLE, session));
    }

    public static getCampaignWithSquareEndScreenAsset(): PerformanceCampaign {
        const json = OnCometVideoPlcCampaignWithSquareEndScreenAsset;
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.GOOGLE));
    }

    public static getXPromoCampaign(session?: Session): XPromoCampaign {
        const json = OnXPromoPlcCampaign;
        const xPromoJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        const creativeId = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].creativeId;
        return new XPromoCampaign(this.getXPromoCampaignParams(xPromoJson, StoreName.GOOGLE, creativeId, session));
    }

    public static getExtendedMRAIDCampaignFollowsRedirects(): MRAIDCampaign {
        const json = OnCometMraidPlcCampaignFollowsRedirects;
        return new MRAIDCampaign(this.getExtendedMRAIDCampaignParams(json, StoreName.GOOGLE));
    }

    public static getExtendedMRAIDCampaign(session?: Session): MRAIDCampaign {
        const json = OnCometMraidPlcCampaign;
        return new MRAIDCampaign(this.getExtendedMRAIDCampaignParams(json, StoreName.GOOGLE, session));
    }

    public static getProgrammaticMRAIDCampaign(customParams: Partial<ICampaign> = {}): MRAIDCampaign {
        const json = OnProgrammaticMraidUrlPlcCampaign;
        return new MRAIDCampaign(this.getProgrammaticMRAIDCampaignParams(json, 3600, 'testId', customParams));
    }

    public static getPerformanceMRAIDCampaign(session?: Session): PerformanceMRAIDCampaign {
        const json = OnCometMraidPlcCampaign;
        return new PerformanceMRAIDCampaign(this.getExtendedMRAIDCampaignParams(json, StoreName.GOOGLE, session));
    }

    public static getCompanionStaticVastCampaign(): VastCampaign {
        const vastParser = TestFixtures.getVastParserStrict();
        const vast = vastParser.parseVast(VastStaticCompanionXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }

    public static getCompanionIframeVastCampaign(): VastCampaign {
        const vastParser = TestFixtures.getVastParserStrict();
        const vast = vastParser.parseVast(VastIframeCompanionXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }

    public static getCompanionHtmlVastCampaign(): VastCampaign {
        const vastParser = TestFixtures.getVastParserStrict();
        const vast = vastParser.parseVast(VastHTMLCompanionXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }

    public static getCompanionVPAIDCampaign(): VPAIDCampaign {
        const vpaidParser = new VPAIDParser();
        const vpaid = vpaidParser.parse(VPAIDCompanionAdWithAdParameters);
        const json = OnProgrammaticVPAIDPlcCampaign;
        return new VPAIDCampaign(this.getVPAIDCampaignParams(json, vpaid));
    }

    public static getEventVastCampaign(session?: Session): VastCampaign {
        const vastParser = TestFixtures.getVastParserStrict();
        const vastXml = EventTestVast;
        const vast = vastParser.parseVast(vastXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345', session));
    }

    public static getAdVerificationsVastCampaign(): VastCampaign {
        const vastParser = TestFixtures.getVastParserStrict();
        const vastXml = VastAdVerificationAsExtension;
        const vast = vastParser.parseVast(vastXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }

    public static getCompanionVastCampaignWithoutImages(): VastCampaign {
        const vastParser = TestFixtures.getVastParserStrict();
        const vastXml = VastCompanionAdWithoutImagesXml;
        const vast = vastParser.parseVast(vastXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }

    public static getCompanionVastCampaignWithoutCompanionAd(): VastCampaign {
        const vastParser = TestFixtures.getVastParserStrict();
        const vastXml = VastAdWithoutCompanionAdXml;
        const vast = vastParser.parseVast(vastXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }

    public static getDisplayInterstitialCampaign(session?: Session): DisplayInterstitialCampaign {
        const json = DummyDisplayInterstitialCampaign;
        const displayInterstitialParams: IDisplayInterstitialCampaign = {
            ... this.getDisplayInterstitialCampaignBaseParams(json, StoreName.GOOGLE, '12345', session),
            dynamicMarkup: json.content
        };
        return new DisplayInterstitialCampaign(displayInterstitialParams);
    }

    public static getWebPlayerContainer(): WebPlayerContainer {
        const player: WebPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        (<any>player).onPageStarted = sinon.createStubInstance(Observable1);
        (<any>player).onPageFinished = sinon.createStubInstance(Observable1);
        (<any>player).onWebPlayerEvent = sinon.createStubInstance(Observable1);
        (<any>player).onCreateWindow = sinon.createStubInstance(Observable1);
        (<any>player).shouldOverrideUrlLoading = sinon.createStubInstance(Observable2);
        (<any>player).onCreateWebView = sinon.createStubInstance(Observable1);
        (<sinon.SinonStub>player.setUrl).returns(Promise.resolve());
        (<sinon.SinonStub>player.setData).returns(Promise.resolve());
        (<sinon.SinonStub>player.setDataWithUrl).returns(Promise.resolve());
        (<sinon.SinonStub>player.setSettings).returns(Promise.resolve());
        (<sinon.SinonStub>player.clearSettings).returns(Promise.resolve());
        (<sinon.SinonStub>player.setEventSettings).returns(Promise.resolve());
        (<sinon.SinonStub>player.sendEvent).returns(Promise.resolve());
        return player;
    }

    public static getOperativeEventManager<T extends Campaign>(platform: Platform, core: ICoreApi, ads: IAdsApi, campaign: T) {
        const wakeUpManager = new WakeUpManager(core);
        const storageBridge = new StorageBridge(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

        const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            platform,
            core,
            ads,
            request: request,
            metaDataManager: new MetaDataManager(core),
            sessionManager: new SessionManager(core, request, storageBridge),
            deviceInfo: TestFixtures.getAndroidDeviceInfo(core),
            clientInfo: TestFixtures.getClientInfo(Platform.ANDROID),
            coreConfig: TestFixtures.getCoreConfiguration(),
            adsConfig: TestFixtures.getAdsConfiguration(),
            storageBridge: storageBridge,
            campaign: campaign,
            playerMetadataServerId: 'test-gamerSid',
            privacySDK: sinon.createStubInstance(PrivacySDK),
            userPrivacyManager: sinon.createStubInstance(UserPrivacyManager)
        });

        if (campaign instanceof XPromoCampaign) {
            sinon.stub(<XPromoOperativeEventManager>operativeEventManager, 'sendHttpKafkaEvent').returns(resolvedPromise);
        }

        return operativeEventManager;
    }

    public static getPrivacy(platform: Platform, campaign: Campaign): Privacy {
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        const core = TestFixtures.getCoreApi(TestFixtures.getNativeBridge(platform, TestFixtures.getBackend(platform)));
        return new Privacy(platform, campaign, privacyManager, TestFixtures.getPrivacySDK(core).isGDPREnabled(), TestFixtures.getCoreConfiguration().isCoppaCompliant(), TestFixtures.getAndroidDeviceInfo(core).getLanguage());
    }

    public static getEndScreenParameters(platform: Platform, core: ICoreApi, campaign: PerformanceCampaign|XPromoCampaign, privacy: Privacy): IEndScreenParameters {
        const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        return {
            platform,
            core,
            language: deviceInfo.getLanguage(),
            gameId: clientInfo.getGameId(),
            privacy: privacy,
            showGDPRBanner: false,
            abGroup: TestFixtures.getCoreConfiguration().getAbGroup(),
            targetGameName: campaign.getGameName()
        };
    }

    public static getPerformanceEndScreen(platform: Platform, core: ICoreApi, campaign: PerformanceCampaign, privacy: Privacy): PerformanceEndScreen {
        return new PerformanceEndScreen(this.getEndScreenParameters(platform, core, campaign, privacy), campaign);
    }

    public static getXPromoEndScreen(platform: Platform, core: ICoreApi, campaign: XPromoCampaign, privacy: Privacy): XPromoEndScreen {
        return new XPromoEndScreen(this.getEndScreenParameters(platform, core, campaign, privacy), campaign);
    }

    public static getVideoOverlay<T extends Campaign>(platform: Platform, core: ICoreApi, ads: IAdsApi, campaign: T): VideoOverlay {
        const overlayParams: IVideoOverlayParameters<T> = {
            platform,
            ads,
            deviceInfo: TestFixtures.getAndroidDeviceInfo(core),
            clientInfo: TestFixtures.getClientInfo(Platform.ANDROID),
            campaign: campaign,
            coreConfig: TestFixtures.getCoreConfiguration(),
            placement: TestFixtures.getPlacement()
        };
        return new VideoOverlay(overlayParams, TestFixtures.getPrivacy(platform, campaign), false, false);
    }

    public static getPerformanceOverlayEventHandler(platform: Platform, core: ICoreApi, ads: IAdsApi, store: IStoreApi, ar: IARApi, campaign: Campaign, adUnit: PerformanceAdUnit, thirdPartyEventManager: ThirdPartyEventManager, nativeBridge: NativeBridge): PerformanceOverlayEventHandler {
        return new PerformanceOverlayEventHandler(
            adUnit,
            TestFixtures.getPerformanceAdUnitParameters(platform, core, ads, store, ar),
            TestFixtures.getStoreHandler(platform, core, ads, store, campaign, adUnit, thirdPartyEventManager, nativeBridge)
        );
    }

    public static getXPromoAdUnitParameters(platform: Platform, core: ICoreApi, ads: IAdsApi, store: IStoreApi, ar: IARApi): IXPromoAdUnitParameters {
        const wakeUpManager = new WakeUpManager(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const campaign = TestFixtures.getXPromoCampaign();
        const privacy = TestFixtures.getPrivacy(platform, campaign);

        return {
            platform,
            core,
            ads,
            store,
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: new FocusManager(platform, core),
            container: new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core)),
            deviceInfo: TestFixtures.getAndroidDeviceInfo(core),
            clientInfo: TestFixtures.getClientInfo(Platform.ANDROID),
            thirdPartyEventManager: new ThirdPartyEventManager(core, request),
            operativeEventManager: <XPromoOperativeEventManager>TestFixtures.getOperativeEventManager(platform, core, ads, campaign),
            placement: TestFixtures.getPlacement(),
            campaign: TestFixtures.getXPromoCampaign(),
            coreConfig: TestFixtures.getCoreConfiguration(),
            adsConfig: TestFixtures.getAdsConfiguration(),
            request: request,
            options: {},
            endScreen: TestFixtures.getXPromoEndScreen(platform, core, campaign, privacy),
            overlay: TestFixtures.getVideoOverlay(platform, core, ads, campaign),
            video: new Video('', TestFixtures.getSession()),
            privacy: privacy,
            privacyManager: sinon.createStubInstance(UserPrivacyManager),
            privacySDK: sinon.createStubInstance(PrivacySDK)
        };
    }

    public static getPerformanceAdUnitParameters(platform: Platform, core: ICoreApi, ads: IAdsApi, store: IStoreApi, ar: IARApi): IPerformanceAdUnitParameters {
        const campaign = TestFixtures.getCampaign();
        const wakeUpManager = new WakeUpManager(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const privacy = TestFixtures.getPrivacy(platform, campaign);

        return {
            platform,
            core,
            ads,
            store,
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: new FocusManager(platform, core),
            container: new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core)),
            deviceInfo: TestFixtures.getAndroidDeviceInfo(core),
            clientInfo: TestFixtures.getClientInfo(Platform.ANDROID),
            thirdPartyEventManager: new ThirdPartyEventManager(core, request),
            operativeEventManager: <PerformanceOperativeEventManager>TestFixtures.getOperativeEventManager(platform, core, ads, campaign),
            placement: TestFixtures.getPlacement(),
            campaign: campaign,
            coreConfig: TestFixtures.getCoreConfiguration(),
            adsConfig: TestFixtures.getAdsConfiguration(),
            request: request,
            options: {},
            endScreen: TestFixtures.getPerformanceEndScreen(platform, core, campaign, privacy),
            overlay: TestFixtures.getVideoOverlay(platform, core, ads, campaign),
            video: new Video('', TestFixtures.getSession()),
            privacy: privacy,
            privacyManager: sinon.createStubInstance(UserPrivacyManager),
            privacySDK: sinon.createStubInstance(PrivacySDK)
        };
    }

    public static getAdmobAdUnitParameters(platform: Platform, core: ICore, ads: IAds): IAdMobAdUnitParameters {
        const campaign = new AdMobCampaign(TestFixtures.getAdmobCampaignBaseParams());
        const privacy = TestFixtures.getPrivacy(platform, campaign);

        return {
            platform: platform,
            core: core.Api,
            ads: ads.Api,
            store: ads.Store.Api,
            forceOrientation: Orientation.PORTRAIT,
            focusManager: core.FocusManager,
            container: ads.Container,
            deviceInfo: core.DeviceInfo,
            clientInfo: core.ClientInfo,
            thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager),
            operativeEventManager: TestFixtures.getOperativeEventManager(platform, core.Api, ads.Api, campaign),
            placement: TestFixtures.getPlacement(),
            campaign: campaign,
            coreConfig: core.Config,
            adsConfig: ads.Config,
            request: core.RequestManager,
            privacyManager: ads.PrivacyManager,
            gameSessionId: ads.SessionManager.getGameSessionId(),
            options: {},
            privacy: privacy,
            view: sinon.createStubInstance(AdMobView),
            adMobSignalFactory: sinon.createStubInstance(AdMobSignalFactory),
            privacySDK: sinon.createStubInstance(PrivacySDK)
        };
    }

    public static getXPromoAdUnit(platform: Platform, core: ICoreApi, ads: IAdsApi, store: IStoreApi, ar: IARApi): XPromoAdUnit {
        return new XPromoAdUnit(TestFixtures.getXPromoAdUnitParameters(platform, core, ads, store, ar));
    }

    public static getPerformanceAdUnit(platform: Platform, core: ICoreApi, ads: IAdsApi, store: IStoreApi, ar: IARApi): PerformanceAdUnit {
        return new PerformanceAdUnit(TestFixtures.getPerformanceAdUnitParameters(platform, core, ads, store, ar));
    }

    public static getStoreHandlerDownloadParameters(campaign: PerformanceCampaign|XPromoCampaign): IStoreHandlerDownloadParameters {
        return <IStoreHandlerDownloadParameters>{
            clickAttributionUrl: campaign.getClickAttributionUrl(),
            clickAttributionUrlFollowsRedirects: campaign.getClickAttributionUrlFollowsRedirects(),
            bypassAppSheet: campaign.getBypassAppSheet(),
            appStoreId: campaign.getAppStoreId(),
            store: campaign.getStore()
        };
    }

    public static getStoreHandler(platform: Platform, core: ICoreApi, ads: IAdsApi, store: IStoreApi, campaign: Campaign, adUnit: VideoAdUnit, thirdPartyEventManager: ThirdPartyEventManager, nativeBridge: NativeBridge): StoreHandler {
        const storeHandlerParameters: IStoreHandlerParameters = {
            platform,
            core,
            ads,
            store,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: TestFixtures.getOperativeEventManager(platform, core, ads, campaign),
            deviceInfo: TestFixtures.getAndroidDeviceInfo(core),
            clientInfo: TestFixtures.getClientInfo(Platform.ANDROID),
            placement: TestFixtures.getPlacement(),
            adUnit: adUnit,
            campaign: campaign,
            coreConfig: TestFixtures.getCoreConfiguration()
        };
        return StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
    }

    public static getClientInfo(platform?: Platform, gameId?: string): ClientInfo {
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
            false,
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
            response: '{}',
            responseCode: 200,
            headers: [['location', 'http://foobar.com']]
        };
    }

    public static getVastParserStrict(): VastParserStrict {
        let vastParser: VastParserStrict;
        const domParser = new DOMParser();
        vastParser = new VastParserStrict(domParser);
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

    public static getCoreModule(nativeBridge: NativeBridge): ICore {
        const platform = nativeBridge.getPlatform();
        const api = this.getCoreApi(nativeBridge);

        const core: Partial<ICore> = {
            NativeBridge: nativeBridge,
            Api: api,
            FocusManager: new FocusManager(platform, api),
            WakeUpManager: new WakeUpManager(api),
            CacheBookkeeping: new CacheBookkeepingManager(api),
            ResolveManager: new ResolveManager(api),
            MetaDataManager: new MetaDataManager(api),
            StorageBridge: new StorageBridge(api),
            ClientInfo: this.getClientInfo(platform),
            Config: this.getCoreConfiguration(),
            SdkDetectionInfo: new SdkDetectionInfo(platform, api)
        };
        if (platform === Platform.ANDROID) {
            core.DeviceInfo = new AndroidDeviceInfo(api);
            core.RequestManager = new RequestManager(platform, api, core.WakeUpManager!, <AndroidDeviceInfo>core.DeviceInfo);
        } else if (platform === Platform.IOS) {
            core.DeviceInfo = new IosDeviceInfo(api);
            core.RequestManager = new RequestManager(platform, api, core.WakeUpManager!);
        }
        core.CacheManager = new CacheManager(api, core.WakeUpManager!, core.RequestManager!, core.CacheBookkeeping!);

        return <ICore>core;
    }

    public static getAdsModule(core: ICore): IAds {
        const platform = core.NativeBridge.getPlatform();
        const api = this.getAdsApi(core.NativeBridge);
        const privacySDK = this.getPrivacySDK(core.Api);
        const ads: Partial<IAds> = {
            Api: api,
            AdMobSignalFactory: new AdMobSignalFactory(platform, core.Api, api, core.ClientInfo, core.DeviceInfo, core.FocusManager),
            InterstitialWebPlayerContainer: new InterstitialWebPlayerContainer(platform, api),
            SessionManager: new SessionManager(core.Api, core.RequestManager, core.StorageBridge),
            MissedImpressionManager: new MissedImpressionManager(core.Api),
            ContentTypeHandlerManager: new ContentTypeHandlerManager(),
            Config: TestFixtures.getAdsConfiguration(),
            Container: TestFixtures.getTestContainer(core, api),
            ThirdPartyEventManagerFactory: new ThirdPartyEventManagerFactory(core.Api, core.RequestManager, core.StorageBridge),
            PrivacySDK: privacySDK
        };
        ads.PrivacyManager = new UserPrivacyManager(platform, core.Api, core.Config, ads.Config!, core.ClientInfo, core.DeviceInfo, core.RequestManager, privacySDK);
        ads.PlacementManager = new PlacementManager(api, ads.Config!);
        ads.AssetManager = new AssetManager(platform, core.Api, core.CacheManager, CacheMode.DISABLED, core.DeviceInfo, core.CacheBookkeeping);
        ads.CampaignManager = new LegacyCampaignManager(platform, core, core.Config, ads.Config!, ads.AssetManager, ads.SessionManager!, ads.AdMobSignalFactory!, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.MetaDataManager, core.CacheBookkeeping, ads.ContentTypeHandlerManager!, privacySDK, ads.PrivacyManager);
        ads.RefreshManager = new CampaignRefreshManager(platform, core.Api, core.Config, api, core.WakeUpManager, ads.CampaignManager, ads.Config!, core.FocusManager, ads.SessionManager!, core.ClientInfo, core.RequestManager, core.CacheManager);
        ads.Analytics = new Analytics(core, ads.PrivacySDK!);
        ads.Store = new Store(core, ads.Analytics.AnalyticsManager);
        return <IAds>ads;
    }

    private static getTestContainer(core: ICore, ads: IAdsApi) {
        switch (core.NativeBridge.getPlatform()) {
            case Platform.IOS:
                return new ViewController(core.Api, ads, <IosDeviceInfo>core.DeviceInfo, core.FocusManager, core.ClientInfo);
            case Platform.ANDROID:
            default:
                return new Activity(core.Api, ads, <AndroidDeviceInfo>core.DeviceInfo);
        }
    }

    public static getBannerModule(ads: IAds, core: ICore) {
        const platform = core.NativeBridge.getPlatform();
        const api = this.getBannerNativeApi(core.NativeBridge);
        const banners: Partial<IBannerModule> = {
            Api: api,
            PlacementManager: new BannerPlacementManager(ads.Api, ads.Config, api),
            CampaignManager: new BannerCampaignManager(core.NativeBridge.getPlatform(), core.Api, core.Config, ads.Config, ads.SessionManager, ads.AdMobSignalFactory, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.MetaDataManager, ads.PrivacySDK, ads.PrivacyManager),
            AdUnitFactory: new BannerAdUnitFactory()
        };
        banners.AdUnitParametersFactory = new BannerAdUnitParametersFactory(<IBannerModule>banners, ads, core);
        banners.BannerAdContextManager = new BannerAdContextManager(core, ads, <IBannerModule>banners);
        return <IBannerModule>banners;
    }

    public static getBannerCampaign() {
        const json = OnProgrammaticBannerCampaign;
        const params = this.getBannerCampaignParams(json);
        return new BannerCampaign(params);
    }

    public static getCoreApi(nativeBridge: NativeBridge): ICoreApi {
        const platform = nativeBridge.getPlatform();
        return {
            Cache: new CacheApi(nativeBridge),
            Connectivity: new ConnectivityApi(nativeBridge),
            DeviceInfo: new DeviceInfoApi(nativeBridge),
            ClassDetection: new ClassDetectionApi(nativeBridge),
            Listener: new CoreListenerApi(nativeBridge),
            Permissions: new PermissionsApi(nativeBridge),
            Request: new RequestApi(nativeBridge),
            Resolve: new ResolveApi(nativeBridge),
            Sdk: new SdkApi(nativeBridge),
            SensorInfo: new SensorInfoApi(nativeBridge),
            NativeError: new NativeErrorApi(nativeBridge),
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
                UrlScheme: new UrlSchemeApi(nativeBridge),
                TrackingManager: new TrackingManagerApi(nativeBridge)
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
                AdUnit: new IosAdUnitApi(nativeBridge),
                VideoPlayer: new IosVideoPlayerApi(nativeBridge)
            } : undefined,
            LoadApi: new LoadApi(nativeBridge)
        };
    }

    public static getStoreApi(nativeBridge: NativeBridge): IStoreApi {
        const platform = nativeBridge.getPlatform();
        return {
            Android: platform === Platform.ANDROID ? {
                Store: new AndroidStoreApi(nativeBridge)
            } : undefined,
            iOS: platform === Platform.IOS ? {
                Products: new ProductsApi(nativeBridge),
                AppSheet: new AppSheetApi(nativeBridge)
            } : undefined
        };
    }

    public static getAnalyticsApi(nativeBridge: NativeBridge): IAnalyticsApi {
        return {
            Analytics: new AnalyticsApi(nativeBridge)
        };
    }

    public static getBannerNativeApi(nativeBridge: NativeBridge): IBannerNativeApi {
        return {
            BannerApi: new BannerApi(nativeBridge),
            BannerListenerApi: new BannerListenerApi(nativeBridge)
        };
    }

    public static getMonetizationApi(nativeBridge: NativeBridge): IMonetizationApi {
        return {
            Listener: new MonetizationListenerApi(nativeBridge),
            PlacementContents: new PlacementContentsApi(nativeBridge)
        };
    }

    public static getARApi(nativeBridge: NativeBridge): IARApi {
        const platform = nativeBridge.getPlatform();
        return {
            AR: new ARApi(nativeBridge),
            Android: platform === Platform.ANDROID ? {
                AR: new AndroidARApi(nativeBridge)
            } : undefined,
            iOS: platform === Platform.IOS ? {
                AR: new IosARApi(nativeBridge)
            } : undefined
        };
    }

    public static getCoreConfiguration(): CoreConfiguration {
        const json = ConfigurationAuctionPlc;
        return CoreConfigurationParser.parse(json);
    }

    public static getAdsConfiguration(): AdsConfiguration {
        const json = ConfigurationAuctionPlc;
        return AdsConfigurationParser.parse(json);
    }

    public static getPrivacySDK(core: ICoreApi): PrivacySDK {
        const json = ConfigurationAuctionPlc;
        const clientInfo = this.getClientInfo();
        const deviceInfo = this.getAndroidDeviceInfo(core);
        return PrivacyParser.parse(json, clientInfo, deviceInfo);
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
        const json = DummyDisplayInterstitialCampaign;
        return decodeURIComponent(json.display.markup);
    }

    public static getFakeNativeDeviceInfo(): any {
        return {
            getConnectionType: sinon.stub().returns(Promise.resolve('wifi')),
            getNetworkType: sinon.stub().returns(Promise.resolve(0)),
            getAdvertisingTrackingId: sinon.stub().returns(Promise.resolve('12345')),
            getLimitAdTrackingFlag: sinon.stub().returns(Promise.resolve(true)),
            getOsVersion: sinon.stub().returns(Promise.resolve('testVersion')),
            isMadeWithUnity: sinon.stub().returns(Promise.resolve(false)),
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
            getDisplayMetricDensity: sinon.stub().returns(Promise.resolve(1)),
            getScreenDensity: sinon.stub().returns(Promise.resolve(2)),
            getScreenLayout: sinon.stub().returns(Promise.resolve(1)),
            getTotalSpace: sinon.stub().returns(Promise.resolve(2048)),
            getRingerMode: sinon.stub().returns(Promise.resolve(RingerMode.RINGER_MODE_NORMAL)),
            getDeviceVolume: sinon.stub().returns(Promise.resolve(0.5)),
            getFreeSpace: sinon.stub().returns(Promise.resolve(16)),
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
            getElapsedRealtime: sinon.stub().returns(Promise.resolve(10000)),
            getNetworkMetered: sinon.stub().returns(Promise.resolve(false))
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

    public static getGameSessionCounters(): any {
        return {
            adRequests: 1,
            starts: 0,
            views: 0,
            startsPerCampaign: {},
            startsPerTarget: {},
            viewsPerCampaign: {},
            viewsPerTarget: {},
            latestCampaignsStarts: {}
        };
    }

    public static getUnityInfo(platform: Platform, core: ICoreApi): UnityInfo {
        return new UnityInfo(platform, core);
    }
}
