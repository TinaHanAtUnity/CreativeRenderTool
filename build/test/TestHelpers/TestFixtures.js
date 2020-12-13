import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { HTML } from 'Ads/Models/Assets/HTML';
import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
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
import { AnalyticsApi } from 'Analytics/Native/Analytics';
import { Backend } from 'Backend/Backend';
import { BannerApi } from 'Banners/Native/BannerApi';
import { BannerListenerApi } from 'Banners/Native/BannerListenerApi';
import { RingerMode } from 'Core/Constants/Android/RingerMode';
import { UIUserInterfaceIdiom } from 'Core/Constants/iOS/UIUserInterfaceIdiom';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { BroadcastApi } from 'Core/Native/Android/Broadcast';
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
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
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
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import * as sinon from 'sinon';
import { FakeAndroidDeviceInfo } from 'TestHelpers/FakeAndroidDeviceInfo';
import { FakeIosDeviceInfo } from 'TestHelpers/FakeIosDeviceInfo';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
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
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { AndroidARApi } from 'AR/Native/Android/AndroidARApi';
import { ARApi } from 'AR/Native/AR';
import { IosARApi } from 'AR/Native/iOS/IosARApi';
import { XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
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
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';
import { Privacy } from 'Ads/Views/Privacy';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
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
import { BannerCampaignManager } from 'Banners/Managers/BannerCampaignManager';
import { BannerPlacementManager } from 'Banners/Managers/BannerPlacementManager';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import OnProgrammaticBannerCampaign from 'json/OnProgrammaticBannerCampaign.json';
import { BannerAdUnitFactory } from 'Banners/AdUnits/BannerAdUnitFactory';
import { AndroidStoreApi } from 'Store/Native/Android/Store';
import { ProductsApi } from 'Store/Native/iOS/Products';
import { NativeErrorApi } from 'Core/Api/NativeErrorApi';
import { BannerAdContextManager } from 'Banners/Managers/BannerAdContextManager';
import { LoadApi } from 'Core/Native/LoadApi';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AdMobView } from 'AdMob/Views/AdMobView';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { Analytics } from 'Analytics/Analytics';
import { Store } from 'Store/Store';
import { ClassDetectionApi } from 'Core/Native/ClassDetection';
import { SdkDetectionInfo } from 'Core/Models/SdkDetectionInfo';
import { MonetizationListenerApi } from 'Monetization/Native/MonetizationListener';
import { PlacementContentsApi } from 'Monetization/Native/PlacementContents';
import { TrackingManagerApi } from 'Core/Native/iOS/TrackingManager';
import { SKAdNetworkApi } from 'Core/Native/iOS/SKAdNetwork';
const TestMediaID = 'beefcace-abcdefg-deadbeef';
export class TestFixtures {
    static getPlacement() {
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
    static getAdmobCampaignBaseParams() {
        const session = sinon.createStubInstance(Session);
        return Object.assign({}, this.getCampaignBaseParams(session, 'fakeCampaignId', undefined), { dynamicMarkup: 'foo', useWebViewUserAgentForTracking: false, isOMEnabled: false, omVendors: [], shouldMuteByDefault: false });
    }
    static getCampaignBaseParams(session, campaignId, meta, adType) {
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
    static getPerformanceCampaignParams(json, storeName, session) {
        if (!session) {
            session = this.getSession();
        }
        const parameters = Object.assign({}, this.getCampaignBaseParams(session, json.id, undefined), { appStoreId: json.appStoreId, gameId: json.gameId, gameName: json.gameName, gameIcon: new Image(json.gameIcon, session), rating: json.rating, ratingCount: json.ratingCount, landscapeImage: json.endScreenLandscape ? new Image(json.endScreenLandscape, session) : undefined, portraitImage: json.endScreenPortrait ? new Image(json.endScreenPortrait, session) : undefined, squareImage: json.endScreen ? new Image(json.endScreen, session) : undefined, clickAttributionUrl: json.clickAttributionUrl, clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects, clickUrl: json.clickUrl, videoEventUrls: json.videoEventUrls, bypassAppSheet: json.bypassAppSheet, store: storeName, adUnitStyle: new AdUnitStyle(json.adUnitStyle), appDownloadUrl: json.appDownloadUrl, endScreenSettings: undefined });
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
    static getXPromoCampaignParams(json, storeName, creativeId, session) {
        if (!session) {
            session = this.getSession();
        }
        const baseParams = this.getCampaignBaseParams(session, json.id, undefined);
        baseParams.creativeId = creativeId;
        const parameters = Object.assign({}, baseParams, { appStoreId: json.appStoreId, gameId: json.gameId, gameName: json.gameName, gameIcon: new Image(json.gameIcon, session), rating: json.rating, ratingCount: json.ratingCount, landscapeImage: new Image(json.endScreenLandscape, session), portraitImage: new Image(json.endScreenPortrait, session), clickAttributionUrl: json.clickAttributionUrl, clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects, bypassAppSheet: json.bypassAppSheet, store: storeName, videoEventUrls: json.videoEventUrls });
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
    static getExtendedMRAIDCampaignParams(json, storeName, session) {
        if (!session) {
            session = this.getSession();
        }
        const mraidContentJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        const mraidJson = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
        return Object.assign({}, this.getCampaignBaseParams(session, mraidContentJson.id, undefined, 'PLAYABLE'), { useWebViewUserAgentForTracking: mraidJson.useWebViewUserAgentForTracking, resourceAsset: mraidContentJson.resourceUrl ? new HTML(mraidContentJson.resourceUrl, session, mraidContentJson.creativeId) : undefined, resource: undefined, dynamicMarkup: mraidContentJson.dynamicMarkup, trackingUrls: {}, clickAttributionUrl: mraidContentJson.clickAttributionUrl, clickAttributionUrlFollowsRedirects: mraidContentJson.clickAttributionUrlFollowsRedirects, clickUrl: mraidContentJson.clickUrl ? mraidContentJson.clickUrl : undefined, videoEventUrls: mraidContentJson.videoEventUrls ? mraidContentJson.videoEventUrls : undefined, gameName: mraidContentJson.gameName, gameIcon: mraidContentJson.gameIcon ? new Image(mraidContentJson.gameIcon, session) : undefined, rating: mraidContentJson.rating, ratingCount: mraidContentJson.ratingCount, landscapeImage: mraidContentJson.endScreenLandscape ? new Image(mraidContentJson.endScreenLandscape, session) : undefined, portraitImage: mraidContentJson.endScreenPortrait ? new Image(mraidContentJson.endScreenPortrait, session) : undefined, bypassAppSheet: mraidContentJson.bypassAppSheet, store: storeName, appStoreId: mraidContentJson.appStoreId, playableConfiguration: undefined, targetGameId: mraidContentJson.gameId, isCustomCloseEnabled: false });
    }
    static getProgrammaticMRAIDCampaignBaseParams(session, campaignId, json) {
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
    static getProgrammaticMRAIDCampaignParams(json, cacheTTL, campaignId, customParams = {}) {
        const mraidContentJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        const mraidJson = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
        const session = this.getSession();
        return Object.assign({}, this.getProgrammaticMRAIDCampaignBaseParams(this.getSession(), campaignId, json), customParams, { willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined, resourceAsset: mraidContentJson.inlinedUrl ? new HTML(mraidContentJson.inlinedUrl, session) : undefined, resource: '<div>resource</div>', dynamicMarkup: mraidContentJson.dynamicMarkup, trackingUrls: mraidJson.trackingUrls, clickAttributionUrl: mraidContentJson.clickAttributionUrl, clickAttributionUrlFollowsRedirects: mraidContentJson.clickAttributionUrlFollowsRedirects, clickUrl: mraidContentJson.clickUrl ? mraidContentJson.clickAttributionUrl : undefined, videoEventUrls: mraidContentJson.videoEventUrls ? mraidContentJson.videoEventUrls : undefined, gameName: mraidContentJson.gameName, gameIcon: mraidContentJson.gameIcon ? new Image(mraidContentJson.gameIcon, session) : undefined, rating: mraidContentJson.rating, ratingCount: mraidContentJson.ratingCount, landscapeImage: mraidContentJson.endScreenLandscape ? new Image(mraidContentJson.endScreenLandscape, session) : undefined, portraitImage: mraidContentJson.endScreenPortrait ? new Image(mraidContentJson.endScreenPortrait, session) : undefined, bypassAppSheet: mraidContentJson.bypassAppSheet, store: undefined, appStoreId: mraidContentJson.appStoreId, useWebViewUserAgentForTracking: mraidJson.useWebViewUserAgentForTracking, playableConfiguration: undefined, targetGameId: mraidContentJson.gameId, isCustomCloseEnabled: false });
    }
    static getVASTCampaignBaseParams(session, campaignId) {
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
    static getVastCampaignParams(vast, cacheTTL, campaignId, session) {
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
        return Object.assign({}, this.getVASTCampaignBaseParams(session, campaignId), { willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined, vast: vast, video: new Video(vast.getVideoUrl(), session), hasStaticEndscreen: hasStaticEndscreenFlag, hasIframeEndscreen: hasIframeEndscreenFlag, hasHtmlEndscreen: hasHtmlEndscreenFlag, staticPortrait: staticPortraitAsset, staticLandscape: staticLandscapeAsset, appCategory: 'appCategory', appSubcategory: 'appSubCategory', advertiserDomain: 'advertiserDomain', advertiserCampaignId: 'advertiserCampaignId', advertiserBundleId: 'advertiserBundleId', useWebViewUserAgentForTracking: false, buyerId: 'buyerId', trackingUrls: {}, impressionUrls: vast.getImpressionUrls(), isMoatEnabled: true, isOMEnabled: false, omVendors: [] });
    }
    static getDisplayInterstitialCampaignBaseParams(json, storeName, campaignId, session) {
        if (!session) {
            session = this.getSession();
        }
        const baseCampaignParams = {
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
        return Object.assign({}, baseCampaignParams, { dynamicMarkup: json.content, trackingUrls: json.display.tracking || {}, useWebViewUserAgentForTracking: false, width: json.display.width || undefined, height: json.display.height || undefined });
    }
    static getVPAIDCampaignBaseParams(json) {
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
    static getVPAIDCampaignParams(json, vpaid) {
        return Object.assign({}, this.getVPAIDCampaignBaseParams(json), { vpaid: vpaid, trackingUrls: json.trackingUrls, appCategory: json.appCategory || undefined, appSubcategory: json.appSubCategory || undefined, advertiserDomain: json.advertiserDomain || undefined, advertiserCampaignId: json.advertiserCampaignId || undefined, advertiserBundleId: json.advertiserBundleId || undefined, useWebViewUserAgentForTracking: false, buyerId: json.buyerId || undefined });
    }
    static getBannerCampaignParams(json) {
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
    static getCampaignFollowsRedirects() {
        const json = OnCometVideoPlcCampaignFollowsRedirects;
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.GOOGLE));
    }
    static getCampaignStandaloneAndroid() {
        const json = OnCometVideoPlcCampaignStandaloneAndroid;
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.STANDALONE_ANDROID));
    }
    static getCampaign(session) {
        const json = OnCometVideoPlcCampaign;
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.GOOGLE, session));
    }
    static getCampaignWithSquareEndScreenAsset() {
        const json = OnCometVideoPlcCampaignWithSquareEndScreenAsset;
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.GOOGLE));
    }
    static getXPromoCampaign(session) {
        const json = OnXPromoPlcCampaign;
        const xPromoJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        const creativeId = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].creativeId;
        return new XPromoCampaign(this.getXPromoCampaignParams(xPromoJson, StoreName.GOOGLE, creativeId, session));
    }
    static getExtendedMRAIDCampaignFollowsRedirects() {
        const json = OnCometMraidPlcCampaignFollowsRedirects;
        return new MRAIDCampaign(this.getExtendedMRAIDCampaignParams(json, StoreName.GOOGLE));
    }
    static getExtendedMRAIDCampaign(session) {
        const json = OnCometMraidPlcCampaign;
        return new MRAIDCampaign(this.getExtendedMRAIDCampaignParams(json, StoreName.GOOGLE, session));
    }
    static getProgrammaticMRAIDCampaign(customParams = {}) {
        const json = OnProgrammaticMraidUrlPlcCampaign;
        return new MRAIDCampaign(this.getProgrammaticMRAIDCampaignParams(json, 3600, 'testId', customParams));
    }
    static getPerformanceMRAIDCampaign(session) {
        const json = OnCometMraidPlcCampaign;
        return new PerformanceMRAIDCampaign(this.getExtendedMRAIDCampaignParams(json, StoreName.GOOGLE, session));
    }
    static getCompanionStaticVastCampaign() {
        const vastParser = TestFixtures.getVastParserStrict();
        const vast = vastParser.parseVast(VastStaticCompanionXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }
    static getCompanionIframeVastCampaign() {
        const vastParser = TestFixtures.getVastParserStrict();
        const vast = vastParser.parseVast(VastIframeCompanionXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }
    static getCompanionHtmlVastCampaign() {
        const vastParser = TestFixtures.getVastParserStrict();
        const vast = vastParser.parseVast(VastHTMLCompanionXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }
    static getCompanionVPAIDCampaign() {
        const vpaidParser = new VPAIDParser();
        const vpaid = vpaidParser.parse(VPAIDCompanionAdWithAdParameters);
        const json = OnProgrammaticVPAIDPlcCampaign;
        return new VPAIDCampaign(this.getVPAIDCampaignParams(json, vpaid));
    }
    static getEventVastCampaign(session) {
        const vastParser = TestFixtures.getVastParserStrict();
        const vastXml = EventTestVast;
        const vast = vastParser.parseVast(vastXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345', session));
    }
    static getAdVerificationsVastCampaign() {
        const vastParser = TestFixtures.getVastParserStrict();
        const vastXml = VastAdVerificationAsExtension;
        const vast = vastParser.parseVast(vastXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }
    static getCompanionVastCampaignWithoutImages() {
        const vastParser = TestFixtures.getVastParserStrict();
        const vastXml = VastCompanionAdWithoutImagesXml;
        const vast = vastParser.parseVast(vastXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }
    static getCompanionVastCampaignWithoutCompanionAd() {
        const vastParser = TestFixtures.getVastParserStrict();
        const vastXml = VastAdWithoutCompanionAdXml;
        const vast = vastParser.parseVast(vastXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
    }
    static getDisplayInterstitialCampaign(session) {
        const json = DummyDisplayInterstitialCampaign;
        const displayInterstitialParams = Object.assign({}, this.getDisplayInterstitialCampaignBaseParams(json, StoreName.GOOGLE, '12345', session), { dynamicMarkup: json.content });
        return new DisplayInterstitialCampaign(displayInterstitialParams);
    }
    static getWebPlayerContainer() {
        const player = sinon.createStubInstance(WebPlayerContainer);
        player.onPageStarted = sinon.createStubInstance(Observable1);
        player.onPageFinished = sinon.createStubInstance(Observable1);
        player.onWebPlayerEvent = sinon.createStubInstance(Observable1);
        player.onCreateWindow = sinon.createStubInstance(Observable1);
        player.shouldOverrideUrlLoading = sinon.createStubInstance(Observable2);
        player.onCreateWebView = sinon.createStubInstance(Observable1);
        player.setUrl.returns(Promise.resolve());
        player.setData.returns(Promise.resolve());
        player.setDataWithUrl.returns(Promise.resolve());
        player.setSettings.returns(Promise.resolve());
        player.clearSettings.returns(Promise.resolve());
        player.setEventSettings.returns(Promise.resolve());
        player.sendEvent.returns(Promise.resolve());
        return player;
    }
    static getOperativeEventManager(platform, core, ads, campaign) {
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
            sinon.stub(operativeEventManager, 'sendHttpKafkaEvent').returns(resolvedPromise);
        }
        return operativeEventManager;
    }
    static getPrivacy(platform, campaign) {
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        const core = TestFixtures.getCoreApi(TestFixtures.getNativeBridge(platform, TestFixtures.getBackend(platform)));
        return new Privacy(platform, campaign, privacyManager, TestFixtures.getPrivacySDK(core).isGDPREnabled(), TestFixtures.getCoreConfiguration().isCoppaCompliant(), TestFixtures.getAndroidDeviceInfo(core).getLanguage());
    }
    static getEndScreenParameters(platform, core, campaign, privacy) {
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
    static getPerformanceEndScreen(platform, core, campaign, privacy) {
        return new PerformanceEndScreen(this.getEndScreenParameters(platform, core, campaign, privacy), campaign);
    }
    static getXPromoEndScreen(platform, core, campaign, privacy) {
        return new XPromoEndScreen(this.getEndScreenParameters(platform, core, campaign, privacy), campaign);
    }
    static getVideoOverlay(platform, core, ads, campaign) {
        const overlayParams = {
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
    static getPerformanceOverlayEventHandler(platform, core, ads, store, ar, campaign, adUnit, thirdPartyEventManager, nativeBridge) {
        return new PerformanceOverlayEventHandler(adUnit, TestFixtures.getPerformanceAdUnitParameters(platform, core, ads, store, ar), TestFixtures.getStoreHandler(platform, core, ads, store, campaign, adUnit, thirdPartyEventManager, nativeBridge));
    }
    static getXPromoAdUnitParameters(platform, core, ads, store, ar) {
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
            operativeEventManager: TestFixtures.getOperativeEventManager(platform, core, ads, campaign),
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
    static getPerformanceAdUnitParameters(platform, core, ads, store, ar) {
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
            operativeEventManager: TestFixtures.getOperativeEventManager(platform, core, ads, campaign),
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
    static getAdmobAdUnitParameters(platform, core, ads) {
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
    static getXPromoAdUnit(platform, core, ads, store, ar) {
        return new XPromoAdUnit(TestFixtures.getXPromoAdUnitParameters(platform, core, ads, store, ar));
    }
    static getPerformanceAdUnit(platform, core, ads, store, ar) {
        return new PerformanceAdUnit(TestFixtures.getPerformanceAdUnitParameters(platform, core, ads, store, ar));
    }
    static getStoreHandlerDownloadParameters(campaign) {
        return {
            clickAttributionUrl: campaign.getClickAttributionUrl(),
            clickAttributionUrlFollowsRedirects: campaign.getClickAttributionUrlFollowsRedirects(),
            bypassAppSheet: campaign.getBypassAppSheet(),
            appStoreId: campaign.getAppStoreId(),
            store: campaign.getStore()
        };
    }
    static getStoreHandler(platform, core, ads, store, campaign, adUnit, thirdPartyEventManager, nativeBridge) {
        const storeHandlerParameters = {
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
    static getClientInfo(platform, gameId) {
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
    static getAndroidDeviceInfo(core) {
        return new FakeAndroidDeviceInfo(core);
    }
    static getIosDeviceInfo(core) {
        return new FakeIosDeviceInfo(core);
    }
    static getOkNativeResponse() {
        return {
            url: 'http://foo.url.com',
            response: '{}',
            responseCode: 200,
            headers: [['location', 'http://foobar.com']]
        };
    }
    static getVastParserStrict() {
        let vastParser;
        const domParser = new DOMParser();
        vastParser = new VastParserStrict(domParser);
        return vastParser;
    }
    static getBackend(platform) {
        return new Backend(platform);
    }
    static getNativeBridge(platform, backend) {
        const nativeBridge = new NativeBridge(backend, platform, false);
        backend.setNativeBridge(nativeBridge);
        return nativeBridge;
    }
    static getCoreModule(nativeBridge) {
        const platform = nativeBridge.getPlatform();
        const api = this.getCoreApi(nativeBridge);
        const core = {
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
            core.RequestManager = new RequestManager(platform, api, core.WakeUpManager, core.DeviceInfo);
        }
        else if (platform === Platform.IOS) {
            core.DeviceInfo = new IosDeviceInfo(api);
            core.RequestManager = new RequestManager(platform, api, core.WakeUpManager);
        }
        core.CacheManager = new CacheManager(api, core.WakeUpManager, core.RequestManager, core.CacheBookkeeping);
        return core;
    }
    static getAdsModule(core) {
        const platform = core.NativeBridge.getPlatform();
        const api = this.getAdsApi(core.NativeBridge);
        const privacySDK = this.getPrivacySDK(core.Api);
        const ads = {
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
        ads.PrivacyManager = new UserPrivacyManager(platform, core.Api, core.Config, ads.Config, core.ClientInfo, core.DeviceInfo, core.RequestManager, privacySDK);
        ads.PlacementManager = new PlacementManager(api, ads.Config);
        ads.AssetManager = new AssetManager(platform, core.Api, core.CacheManager, CacheMode.DISABLED, core.DeviceInfo, core.CacheBookkeeping);
        ads.CampaignManager = new LegacyCampaignManager(platform, core, core.Config, ads.Config, ads.AssetManager, ads.SessionManager, ads.AdMobSignalFactory, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.MetaDataManager, core.CacheBookkeeping, ads.ContentTypeHandlerManager, privacySDK, ads.PrivacyManager);
        ads.RefreshManager = new CampaignRefreshManager(platform, core.Api, core.Config, api, core.WakeUpManager, ads.CampaignManager, ads.Config, core.FocusManager, ads.SessionManager, core.ClientInfo, core.RequestManager, core.CacheManager);
        ads.Analytics = new Analytics(core, ads.PrivacySDK);
        ads.Store = new Store(core, ads.Analytics.AnalyticsManager);
        return ads;
    }
    static getTestContainer(core, ads) {
        switch (core.NativeBridge.getPlatform()) {
            case Platform.IOS:
                return new ViewController(core.Api, ads, core.DeviceInfo, core.FocusManager, core.ClientInfo);
            case Platform.ANDROID:
            default:
                return new Activity(core.Api, ads, core.DeviceInfo);
        }
    }
    static getBannerModule(ads, core) {
        const platform = core.NativeBridge.getPlatform();
        const api = this.getBannerNativeApi(core.NativeBridge);
        const banners = {
            Api: api,
            PlacementManager: new BannerPlacementManager(ads.Api, ads.Config, api),
            CampaignManager: new BannerCampaignManager(core.NativeBridge.getPlatform(), core.Api, core.Config, ads.Config, ads.SessionManager, ads.AdMobSignalFactory, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.MetaDataManager, ads.PrivacySDK, ads.PrivacyManager),
            AdUnitFactory: new BannerAdUnitFactory()
        };
        banners.AdUnitParametersFactory = new BannerAdUnitParametersFactory(banners, ads, core);
        banners.BannerAdContextManager = new BannerAdContextManager(core, ads, banners);
        return banners;
    }
    static getBannerCampaign() {
        const json = OnProgrammaticBannerCampaign;
        const params = this.getBannerCampaignParams(json);
        return new BannerCampaign(params);
    }
    static getCoreApi(nativeBridge) {
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
                TrackingManager: new TrackingManagerApi(nativeBridge),
                SKAdNetwork: new SKAdNetworkApi(nativeBridge)
            } : undefined
        };
    }
    static getAdsApi(nativeBridge) {
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
    static getStoreApi(nativeBridge) {
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
    static getAnalyticsApi(nativeBridge) {
        return {
            Analytics: new AnalyticsApi(nativeBridge)
        };
    }
    static getBannerNativeApi(nativeBridge) {
        return {
            BannerApi: new BannerApi(nativeBridge),
            BannerListenerApi: new BannerListenerApi(nativeBridge)
        };
    }
    static getMonetizationApi(nativeBridge) {
        return {
            Listener: new MonetizationListenerApi(nativeBridge),
            PlacementContents: new PlacementContentsApi(nativeBridge)
        };
    }
    static getARApi(nativeBridge) {
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
    static getCoreConfiguration() {
        const json = ConfigurationAuctionPlc;
        return CoreConfigurationParser.parse(json);
    }
    static getAdsConfiguration() {
        const json = ConfigurationAuctionPlc;
        return AdsConfigurationParser.parse(json);
    }
    static getPrivacySDK(core) {
        const json = ConfigurationAuctionPlc;
        const clientInfo = this.getClientInfo();
        const deviceInfo = this.getAndroidDeviceInfo(core);
        return PrivacyParser.parse(json, clientInfo, deviceInfo);
    }
    static getCacheDiagnostics() {
        return {
            creativeType: 'TEST',
            targetGameId: 5678,
            targetCampaignId: '123456abcdef'
        };
    }
    static getSession() {
        return new Session('12345');
    }
    static getPackageInfo() {
        return {
            installer: 'com.install.er',
            firstInstallTime: 12345,
            lastUpdateTime: 67890,
            versionCode: 123,
            versionName: '1.2.3',
            packageName: 'com.package.name'
        };
    }
    static getDisplayMarkup() {
        const json = DummyDisplayInterstitialCampaign;
        return decodeURIComponent(json.display.markup);
    }
    static getFakeNativeDeviceInfo() {
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
    static getFakeNativeAndroidDeviceInfo() {
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
    static getFakeNativeIosDeviceInfo() {
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
            getSensorList: sinon.stub().returns(Promise.resolve([])),
            getDeviceName: sinon.stub().returns(Promise.resolve('fakeDeviceName')),
            getVendorIdentifier: sinon.stub().returns(Promise.resolve('fakeVendor')),
            getCurrentUITheme: sinon.stub().returns(Promise.resolve(1)),
            getLocaleList: sinon.stub().returns(Promise.resolve(['en', 'fi'])),
            getAdNetworkIdsPlist: sinon.stub().returns(Promise.resolve(['adNetwork'])),
            getSystemBootTime: sinon.stub().returns(Promise.resolve(1)),
            getTrackingAuthorizationStatus: sinon.stub().returns(Promise.resolve(0))
        };
    }
    static getGameSessionCounters() {
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
    static getUnityInfo(platform, core) {
        return new UnityInfo(platform, core);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdEZpeHR1cmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9UZXN0SGVscGVycy9UZXN0Rml4dHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRWhELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDN0QsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdkUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN4RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDcEQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFHNUUsT0FBTyxFQUFFLFlBQVksRUFBRSxN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