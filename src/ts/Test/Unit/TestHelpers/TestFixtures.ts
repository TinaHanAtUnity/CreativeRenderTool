import { Placement } from 'Models/Placement';
import { ClientInfo } from 'Models/ClientInfo';
import { INativeResponse } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';
import { VastParser } from 'Utilities/VastParser';
import { NativeBridge } from 'Native/NativeBridge';
import { IPerformanceCampaign, PerformanceCampaign, StoreName } from 'Models/Campaigns/PerformanceCampaign';
import { IXPromoCampaign, XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { IMRAIDCampaign, MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Configuration } from 'Models/Configuration';
import { ConfigurationParser } from 'Parsers/ConfigurationParser';
import { ICacheDiagnostics } from 'Utilities/Cache';
import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { Session } from 'Models/Session';
import { IVastCampaign, VastCampaign } from 'Models/Vast/VastCampaign';
import { IPackageInfo } from 'Native/Api/AndroidDeviceInfo';
import { ICampaign } from 'Models/Campaign';
import { Image } from 'Models/Assets/Image';
import { HTML } from 'Models/Assets/HTML';
import { Video } from 'Models/Assets/Video';
import { Vast } from 'Models/Vast/Vast';
import { IVPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { VPAID } from 'Models/VPAID/VPAID';
import { IPromoCampaign, PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Models/IosDeviceInfo';
import { FakeAndroidDeviceInfo } from 'Test/Unit/TestHelpers/FakeAndroidDeviceInfo';
import { RingerMode } from 'Constants/Android/RingerMode';
import { UIUserInterfaceIdiom } from 'Constants/iOS/UIUserInterfaceIdiom';
import { FakeIosDeviceInfo } from 'Test/Unit/TestHelpers/FakeIosDeviceInfo';

import DummyPromoCampaign from 'json/DummyPromoCampaign.json';
import OnCometMraidPlcCampaignFollowsRedirects from 'json/OnCometMraidPlcCampaignFollowsRedirects.json';
import OnCometMraidPlcCampaign from 'json/OnCometMraidPlcCampaign.json';
import OnCometVideoPlcCampaignFollowsRedirects from 'json/OnCometVideoPlcCampaignFollowsRedirects.json';
import OnCometVideoPlcCampaign from 'json/OnCometVideoPlcCampaign.json';
import OnXPromoPlcCampaign from 'json/OnXPromoPlcCampaign.json';
import OnProgrammaticMraidUrlPlcCampaign from 'json/OnProgrammaticMraidUrlPlcCampaign.json';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import DummyDisplayInterstitialCampaign from 'json/DummyDisplayInterstitialCampaign.json';
import VastCompanionXml from 'xml/VastCompanionAd.xml';
import EventTestVast from 'xml/EventTestVast.xml';
import VastCompanionAdWithoutImagesXml from 'xml/VastCompanionAdWithoutImages.xml';

import * as sinon from 'sinon';
import { ABGroup } from 'Models/ABGroup';

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
        });
    }

    public static getCometCampaignBaseParams(session: Session, campaignId: string, gamerId: string, abGroup: ABGroup, meta: string | undefined): ICampaign {
        return {
            id: campaignId,
            gamerId: gamerId,
            abGroup: abGroup,
            willExpireAt: undefined,
            adType: undefined,
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
            ... this.getCometCampaignBaseParams(session, json.id, this.getConfiguration().getGamerId(), this.getConfiguration().getAbGroup(), undefined),
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
            adUnitStyle: json.adUnitStyle,
            creativeId: json.creativeId,
            portraitCreativeId: json.portraitCreativeId
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

    public static getXPromoCampaignParams(json: any, storeName: StoreName): IXPromoCampaign {
        const session = this.getSession();
        const parameters: IXPromoCampaign = {
            ... this.getCometCampaignBaseParams(session, json.id, this.getConfiguration().getGamerId(), this.getConfiguration().getAbGroup(), undefined),
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
            trackingUrls: json.trackingUrls
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
            ... this.getCometCampaignBaseParams(session, mraidContentJson.id, this.getConfiguration().getGamerId(), this.getConfiguration().getAbGroup(), undefined),
            useWebViewUserAgentForTracking: mraidJson.useWebViewUserAgentForTracking,
            resourceAsset: mraidContentJson.resourceUrl ? new HTML(mraidContentJson.resourceUrl, session) : undefined,
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
            mraidCreativeId: undefined
        };
    }

    public static getProgrammaticMRAIDCampaignBaseParams(session: Session, campaignId: string, gamerId: string, abGroup: ABGroup, json: any): ICampaign {
        const mraidJson = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
        return {
            id: campaignId,
            gamerId: gamerId,
            abGroup: abGroup,
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

    public static getProgrammaticMRAIDCampaignParams(json: any, cacheTTL: number, campaignId: string): IMRAIDCampaign {
        const mraidContentJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        const mraidJson = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
        const session = this.getSession();

        return {
            ... this.getProgrammaticMRAIDCampaignBaseParams(this.getSession(), campaignId, this.getConfiguration().getGamerId(), this.getConfiguration().getAbGroup(), json),
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
            mraidCreativeId: undefined
        };
    }

    public static getVASTCampaignBaseParams(session: Session, campaignId: string, gamerId: string, abGroup: ABGroup): ICampaign {
        return {
            id: campaignId,
            gamerId: gamerId,
            abGroup: abGroup,
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
            ... this.getVASTCampaignBaseParams(session, campaignId, this.getConfiguration().getGamerId(), this.getConfiguration().getAbGroup()),
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
            isMoatEnabled: true
        };
    }

    public static getDisplayInterstitialCampaignBaseParams(json: any, storeName: StoreName, campaignId: string): IDisplayInterstitialCampaign {
        const configuration = this.getConfiguration();
        const session = this.getSession();
        const baseCampaignParams: ICampaign = {
            id: campaignId,
            gamerId: configuration.getGamerId(),
            abGroup: configuration.getAbGroup(),
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
            gamerId: json.gamerId,
            abGroup: json.abGroup,
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
            buyerId: json.buyerId || undefined,

        };
    }

    public static getPromoCampaignParams(json: any): IPromoCampaign {
        const session = this.getSession();
        return {
            ... this.getCometCampaignBaseParams(session, json.promo.id, json.gamerId, ABGroup.getAbGroup(json.abGroup), json.meta),
            iapProductId: json.promo.iapProductId,
            additionalTrackingEvents: json.promo.tracking ? json.promo.tracking : undefined,
            dynamicMarkup: json.promo.dynamicMarkup,
            creativeAsset: new HTML(json.promo.creativeUrl, session)
        };
    }

    public static getPromoCampaign(): PromoCampaign {
        const json = JSON.parse(DummyPromoCampaign);
        return new PromoCampaign(this.getPromoCampaignParams(json));
    }

    public static getCampaignFollowsRedirects(): PerformanceCampaign {
        const json = JSON.parse(OnCometVideoPlcCampaignFollowsRedirects);
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.GOOGLE));
    }

    public static getCampaign(): PerformanceCampaign {
        const json = JSON.parse(OnCometVideoPlcCampaign);
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, StoreName.GOOGLE));
    }

    public static getXPromoCampaign(): XPromoCampaign {
        const json = JSON.parse(OnXPromoPlcCampaign);
        const xPromoJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new XPromoCampaign(this.getXPromoCampaignParams(xPromoJson, StoreName.GOOGLE));
    }

    public static getPlayableMRAIDCampaignFollowsRedirects(): MRAIDCampaign {
        const json = JSON.parse(OnCometMraidPlcCampaignFollowsRedirects);
        return new MRAIDCampaign(this.getPlayableMRAIDCampaignParams(json, StoreName.GOOGLE));
    }

    public static getPlayableMRAIDCampaign(): MRAIDCampaign {
        const json = JSON.parse(OnCometMraidPlcCampaign);
        return new MRAIDCampaign(this.getPlayableMRAIDCampaignParams(json, StoreName.GOOGLE));
    }

    public static getProgrammaticMRAIDCampaign(): MRAIDCampaign {
        const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
        return new MRAIDCampaign(this.getProgrammaticMRAIDCampaignParams(json, 3600, 'testId'));
    }

    public static getCompanionVastCampaign(): VastCampaign {
        const vastParser = TestFixtures.getVastParser();
        const vast = vastParser.parseVast(VastCompanionXml);
        return new VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
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

    public static getClientInfo(platform?: Platform): ClientInfo {
        if(typeof platform === 'undefined') {
            platform = Platform.ANDROID;
        }

        return new ClientInfo(platform, [
            '12345',
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

    public static getAndroidDeviceInfo(): AndroidDeviceInfo {
        return new FakeAndroidDeviceInfo(TestFixtures.getNativeBridge());
    }

    public static getIosDeviceInfo(): IosDeviceInfo {
        return new FakeIosDeviceInfo(TestFixtures.getNativeBridge());
    }

    public static getOkNativeResponse(): INativeResponse {
        return {
            url: 'http://foo.url.com',
            response: 'foo response',
            responseCode: 200,
            headers: [['location', 'http://foobar.com']],
        };
    }

    public static getVastParser(): VastParser {
        let vastParser: VastParser;
        const domParser = new DOMParser();
        vastParser = new VastParser(domParser);
        return vastParser;
    }

    public static getNativeBridge(platform?: Platform): NativeBridge {
        if(typeof platform === 'undefined') {
            platform = Platform.TEST;
        }
        const backend = {
            handleInvocation: function() {
                // no-op
            },
            handleCallback: function() {
                // no-op
            }
        };
        return new NativeBridge(backend, platform);
    }

    public static getConfiguration(): Configuration {
        const json = JSON.parse(ConfigurationAuctionPlc);
        return ConfigurationParser.parse(json);
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
            getSupportedAbis: sinon.stub().returns(Promise.resolve( ['supported_abi_1', 'supported_abi_2'])),
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
            getSensorList: sinon.stub().returns(Promise.resolve([])),
        };
    }

}
