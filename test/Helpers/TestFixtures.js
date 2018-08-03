System.register(["tslib", "Models/Placement", "Models/ClientInfo", "Constants/Platform", "Utilities/VastParser", "Native/NativeBridge", "Models/Campaigns/PerformanceCampaign", "Models/Campaigns/XPromoCampaign", "Models/Campaigns/MRAIDCampaign", "Parsers/ConfigurationParser", "Models/Campaigns/DisplayInterstitialCampaign", "Models/Session", "Models/Vast/VastCampaign", "Models/Assets/Image", "Models/Assets/HTML", "Models/Assets/Video", "Models/Campaigns/PromoCampaign", "Test/Unit/TestHelpers/FakeAndroidDeviceInfo", "Constants/Android/RingerMode", "Constants/iOS/UIUserInterfaceIdiom", "Test/Unit/TestHelpers/FakeIosDeviceInfo", "Models/AdUnitStyle", "json/DummyPromoCampaign.json", "json/OnCometMraidPlcCampaignFollowsRedirects.json", "json/OnCometMraidPlcCampaign.json", "json/OnCometVideoPlcCampaignFollowsRedirects.json", "json/OnCometVideoPlcCampaign.json", "json/OnXPromoPlcCampaign.json", "json/OnProgrammaticMraidUrlPlcCampaign.json", "json/ConfigurationAuctionPlc.json", "json/DummyDisplayInterstitialCampaign.json", "xml/VastCompanionAd.xml", "xml/EventTestVast.xml", "xml/VastCompanionAdWithoutImages.xml", "sinon"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, Placement_1, ClientInfo_1, Platform_1, VastParser_1, NativeBridge_1, PerformanceCampaign_1, XPromoCampaign_1, MRAIDCampaign_1, ConfigurationParser_1, DisplayInterstitialCampaign_1, Session_1, VastCampaign_1, Image_1, HTML_1, Video_1, PromoCampaign_1, FakeAndroidDeviceInfo_1, RingerMode_1, UIUserInterfaceIdiom_1, FakeIosDeviceInfo_1, AdUnitStyle_1, DummyPromoCampaign_json_1, OnCometMraidPlcCampaignFollowsRedirects_json_1, OnCometMraidPlcCampaign_json_1, OnCometVideoPlcCampaignFollowsRedirects_json_1, OnCometVideoPlcCampaign_json_1, OnXPromoPlcCampaign_json_1, OnProgrammaticMraidUrlPlcCampaign_json_1, ConfigurationAuctionPlc_json_1, DummyDisplayInterstitialCampaign_json_1, VastCompanionAd_xml_1, EventTestVast_xml_1, VastCompanionAdWithoutImages_xml_1, sinon, TestMediaID, TestFixtures;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (tslib_1_1) {
                tslib_1 = tslib_1_1;
            },
            function (Placement_1_1) {
                Placement_1 = Placement_1_1;
            },
            function (ClientInfo_1_1) {
                ClientInfo_1 = ClientInfo_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (VastParser_1_1) {
                VastParser_1 = VastParser_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (PerformanceCampaign_1_1) {
                PerformanceCampaign_1 = PerformanceCampaign_1_1;
            },
            function (XPromoCampaign_1_1) {
                XPromoCampaign_1 = XPromoCampaign_1_1;
            },
            function (MRAIDCampaign_1_1) {
                MRAIDCampaign_1 = MRAIDCampaign_1_1;
            },
            function (ConfigurationParser_1_1) {
                ConfigurationParser_1 = ConfigurationParser_1_1;
            },
            function (DisplayInterstitialCampaign_1_1) {
                DisplayInterstitialCampaign_1 = DisplayInterstitialCampaign_1_1;
            },
            function (Session_1_1) {
                Session_1 = Session_1_1;
            },
            function (VastCampaign_1_1) {
                VastCampaign_1 = VastCampaign_1_1;
            },
            function (Image_1_1) {
                Image_1 = Image_1_1;
            },
            function (HTML_1_1) {
                HTML_1 = HTML_1_1;
            },
            function (Video_1_1) {
                Video_1 = Video_1_1;
            },
            function (PromoCampaign_1_1) {
                PromoCampaign_1 = PromoCampaign_1_1;
            },
            function (FakeAndroidDeviceInfo_1_1) {
                FakeAndroidDeviceInfo_1 = FakeAndroidDeviceInfo_1_1;
            },
            function (RingerMode_1_1) {
                RingerMode_1 = RingerMode_1_1;
            },
            function (UIUserInterfaceIdiom_1_1) {
                UIUserInterfaceIdiom_1 = UIUserInterfaceIdiom_1_1;
            },
            function (FakeIosDeviceInfo_1_1) {
                FakeIosDeviceInfo_1 = FakeIosDeviceInfo_1_1;
            },
            function (AdUnitStyle_1_1) {
                AdUnitStyle_1 = AdUnitStyle_1_1;
            },
            function (DummyPromoCampaign_json_1_1) {
                DummyPromoCampaign_json_1 = DummyPromoCampaign_json_1_1;
            },
            function (OnCometMraidPlcCampaignFollowsRedirects_json_1_1) {
                OnCometMraidPlcCampaignFollowsRedirects_json_1 = OnCometMraidPlcCampaignFollowsRedirects_json_1_1;
            },
            function (OnCometMraidPlcCampaign_json_1_1) {
                OnCometMraidPlcCampaign_json_1 = OnCometMraidPlcCampaign_json_1_1;
            },
            function (OnCometVideoPlcCampaignFollowsRedirects_json_1_1) {
                OnCometVideoPlcCampaignFollowsRedirects_json_1 = OnCometVideoPlcCampaignFollowsRedirects_json_1_1;
            },
            function (OnCometVideoPlcCampaign_json_1_1) {
                OnCometVideoPlcCampaign_json_1 = OnCometVideoPlcCampaign_json_1_1;
            },
            function (OnXPromoPlcCampaign_json_1_1) {
                OnXPromoPlcCampaign_json_1 = OnXPromoPlcCampaign_json_1_1;
            },
            function (OnProgrammaticMraidUrlPlcCampaign_json_1_1) {
                OnProgrammaticMraidUrlPlcCampaign_json_1 = OnProgrammaticMraidUrlPlcCampaign_json_1_1;
            },
            function (ConfigurationAuctionPlc_json_1_1) {
                ConfigurationAuctionPlc_json_1 = ConfigurationAuctionPlc_json_1_1;
            },
            function (DummyDisplayInterstitialCampaign_json_1_1) {
                DummyDisplayInterstitialCampaign_json_1 = DummyDisplayInterstitialCampaign_json_1_1;
            },
            function (VastCompanionAd_xml_1_1) {
                VastCompanionAd_xml_1 = VastCompanionAd_xml_1_1;
            },
            function (EventTestVast_xml_1_1) {
                EventTestVast_xml_1 = EventTestVast_xml_1_1;
            },
            function (VastCompanionAdWithoutImages_xml_1_1) {
                VastCompanionAdWithoutImages_xml_1 = VastCompanionAdWithoutImages_xml_1_1;
            },
            function (sinon_1) {
                sinon = sinon_1;
            }
        ],
        execute: function () {
            TestMediaID = 'beefcace-abcdefg-deadbeef';
            TestFixtures = /** @class */ (function () {
                function TestFixtures() {
                }
                TestFixtures.getPlacement = function () {
                    return new Placement_1.Placement({
                        id: 'fooId',
                        name: 'fooName',
                        'default': false,
                        allowSkip: false,
                        skipInSeconds: 0,
                        disableBackButton: false,
                        useDeviceOrientationForVideo: false,
                        muteVideo: false
                    });
                };
                TestFixtures.getCometCampaignBaseParams = function (session, campaignId, meta, adType) {
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
                };
                TestFixtures.getPerformanceCampaignParams = function (json, storeName) {
                    var session = this.getSession();
                    var parameters = tslib_1.__assign({}, this.getCometCampaignBaseParams(session, json.id, undefined), { appStoreId: json.appStoreId, gameId: json.gameId, gameName: json.gameName, gameIcon: new Image_1.Image(json.gameIcon, session), rating: json.rating, ratingCount: json.ratingCount, landscapeImage: new Image_1.Image(json.endScreenLandscape, session), portraitImage: new Image_1.Image(json.endScreenPortrait, session), clickAttributionUrl: json.clickAttributionUrl, clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects, clickUrl: json.clickUrl, videoEventUrls: json.videoEventUrls, bypassAppSheet: json.bypassAppSheet, store: storeName, adUnitStyle: new AdUnitStyle_1.AdUnitStyle(json.adUnitStyle) });
                    if (json.trailerDownloadable && json.trailerDownloadableSize && json.trailerStreaming) {
                        parameters.video = new Video_1.Video(json.trailerDownloadable, session, json.trailerDownloadableSize, json.creativeId);
                        parameters.streamingVideo = new Video_1.Video(json.trailerStreaming, session, undefined, json.creativeId);
                    }
                    if (json.trailerPortraitDownloadable && json.trailerPortraitDownloadableSize && json.trailerPortraitStreaming) {
                        parameters.videoPortrait = new Video_1.Video(json.trailerPortraitDownloadable, session, json.trailerPortraitDownloadableSize, json.portraitCreativeId);
                        parameters.streamingPortraitVideo = new Video_1.Video(json.trailerPortraitStreaming, session, undefined, json.portraitCreativeId);
                    }
                    return parameters;
                };
                TestFixtures.getXPromoCampaignParams = function (json, storeName) {
                    var session = this.getSession();
                    var parameters = tslib_1.__assign({}, this.getCometCampaignBaseParams(session, json.id, undefined), { appStoreId: json.appStoreId, gameId: json.gameId, gameName: json.gameName, gameIcon: new Image_1.Image(json.gameIcon, session), rating: json.rating, ratingCount: json.ratingCount, landscapeImage: new Image_1.Image(json.endScreenLandscape, session), portraitImage: new Image_1.Image(json.endScreenPortrait, session), clickAttributionUrl: json.clickAttributionUrl, clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects, bypassAppSheet: json.bypassAppSheet, store: storeName, trackingUrls: json.trackingUrls, videoEventUrls: json.videoEventUrls });
                    if (json.trailerDownloadable && json.trailerDownloadableSize && json.trailerStreaming) {
                        parameters.video = new Video_1.Video(json.trailerDownloadable, session, json.trailerDownloadableSize);
                        parameters.streamingVideo = new Video_1.Video(json.trailerStreaming, session);
                    }
                    if (json.trailerPortraitDownloadable && json.trailerPortraitDownloadableSize && json.trailerPortraitStreaming) {
                        parameters.videoPortrait = new Video_1.Video(json.trailerPortraitDownloadable, session, json.trailerPortraitDownloadableSize);
                        parameters.streamingPortraitVideo = new Video_1.Video(json.trailerPortraitStreaming, session);
                    }
                    return parameters;
                };
                TestFixtures.getPlayableMRAIDCampaignParams = function (json, storeName) {
                    var mraidContentJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
                    var mraidJson = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
                    var session = this.getSession();
                    return tslib_1.__assign({}, this.getCometCampaignBaseParams(session, mraidContentJson.id, undefined), { useWebViewUserAgentForTracking: mraidJson.useWebViewUserAgentForTracking, resourceAsset: mraidContentJson.resourceUrl ? new HTML_1.HTML(mraidContentJson.resourceUrl, session, mraidContentJson.creativeId) : undefined, resource: undefined, dynamicMarkup: mraidContentJson.dynamicMarkup, trackingUrls: {}, clickAttributionUrl: mraidContentJson.clickAttributionUrl, clickAttributionUrlFollowsRedirects: mraidContentJson.clickAttributionUrlFollowsRedirects, clickUrl: mraidContentJson.clickUrl ? mraidContentJson.clickUrl : undefined, videoEventUrls: mraidContentJson.videoEventUrls ? mraidContentJson.videoEventUrls : undefined, gameName: mraidContentJson.gameName, gameIcon: mraidContentJson.gameIcon ? new Image_1.Image(mraidContentJson.gameIcon, session) : undefined, rating: mraidContentJson.rating, ratingCount: mraidContentJson.ratingCount, landscapeImage: mraidContentJson.endScreenLandscape ? new Image_1.Image(mraidContentJson.endScreenLandscape, session) : undefined, portraitImage: mraidContentJson.endScreenPortrait ? new Image_1.Image(mraidContentJson.endScreenPortrait, session) : undefined, bypassAppSheet: mraidContentJson.bypassAppSheet, store: storeName, appStoreId: mraidContentJson.appStoreId, playableConfiguration: undefined });
                };
                TestFixtures.getProgrammaticMRAIDCampaignBaseParams = function (session, campaignId, json) {
                    var mraidJson = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
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
                };
                TestFixtures.getProgrammaticMRAIDCampaignParams = function (json, cacheTTL, campaignId) {
                    var mraidContentJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
                    var mraidJson = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
                    var session = this.getSession();
                    return tslib_1.__assign({}, this.getProgrammaticMRAIDCampaignBaseParams(this.getSession(), campaignId, json), { willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined, resourceAsset: mraidContentJson.inlinedUrl ? new HTML_1.HTML(mraidContentJson.inlinedUrl, session) : undefined, resource: '<div>resource</div>', dynamicMarkup: mraidContentJson.dynamicMarkup, trackingUrls: mraidJson.trackingUrls, clickAttributionUrl: mraidContentJson.clickAttributionUrl, clickAttributionUrlFollowsRedirects: mraidContentJson.clickAttributionUrlFollowsRedirects, clickUrl: mraidContentJson.clickUrl ? mraidContentJson.clickAttributionUrl : undefined, videoEventUrls: mraidContentJson.videoEventUrls ? mraidContentJson.videoEventUrls : undefined, gameName: mraidContentJson.gameName, gameIcon: mraidContentJson.gameIcon ? new Image_1.Image(mraidContentJson.gameIcon, session) : undefined, rating: mraidContentJson.rating, ratingCount: mraidContentJson.ratingCount, landscapeImage: mraidContentJson.endScreenLandscape ? new Image_1.Image(mraidContentJson.endScreenLandscape, session) : undefined, portraitImage: mraidContentJson.endScreenPortrait ? new Image_1.Image(mraidContentJson.endScreenPortrait, session) : undefined, bypassAppSheet: mraidContentJson.bypassAppSheet, store: undefined, appStoreId: mraidContentJson.appStoreId, useWebViewUserAgentForTracking: mraidJson.useWebViewUserAgentForTracking, playableConfiguration: undefined });
                };
                TestFixtures.getVASTCampaignBaseParams = function (session, campaignId) {
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
                };
                TestFixtures.getVastCampaignParams = function (vast, cacheTTL, campaignId) {
                    var session = this.getSession();
                    var portraitUrl = vast.getCompanionPortraitUrl();
                    var portraitAsset;
                    if (portraitUrl) {
                        portraitAsset = new Image_1.Image(portraitUrl, session);
                    }
                    var landscapeUrl = vast.getCompanionLandscapeUrl();
                    var landscapeAsset;
                    if (landscapeUrl) {
                        landscapeAsset = new Image_1.Image(landscapeUrl, session);
                    }
                    return tslib_1.__assign({}, this.getVASTCampaignBaseParams(session, campaignId), { willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined, vast: vast, video: new Video_1.Video(vast.getVideoUrl(), session), hasEndscreen: !!vast.getCompanionPortraitUrl() || !!vast.getCompanionLandscapeUrl(), portrait: portraitAsset, landscape: landscapeAsset, appCategory: 'appCategory', appSubcategory: 'appSubCategory', advertiserDomain: 'advertiserDomain', advertiserCampaignId: 'advertiserCampaignId', advertiserBundleId: 'advertiserBundleId', useWebViewUserAgentForTracking: false, buyerId: 'buyerId', trackingUrls: {}, impressionUrls: vast.getImpressionUrls(), isMoatEnabled: true });
                };
                TestFixtures.getDisplayInterstitialCampaignBaseParams = function (json, storeName, campaignId) {
                    var session = this.getSession();
                    var baseCampaignParams = {
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
                    return tslib_1.__assign({}, baseCampaignParams, { dynamicMarkup: json.content, trackingUrls: json.display.tracking || undefined, useWebViewUserAgentForTracking: false, width: json.display.width || undefined, height: json.display.height || undefined });
                };
                TestFixtures.getVPAIDCampaignBaseParams = function (json) {
                    var session = this.getSession();
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
                };
                TestFixtures.getVPAIDCampaignParams = function (json, vpaid) {
                    return tslib_1.__assign({}, this.getVPAIDCampaignBaseParams(json), { vpaid: vpaid, trackingUrls: json.trackingUrls, appCategory: json.appCategory || undefined, appSubcategory: json.appSubCategory || undefined, advertiserDomain: json.advertiserDomain || undefined, advertiserCampaignId: json.advertiserCampaignId || undefined, advertiserBundleId: json.advertiserBundleId || undefined, useWebViewUserAgentForTracking: false, buyerId: json.buyerId || undefined });
                };
                TestFixtures.getPromoCampaignParams = function (json, adType, rewardedPromo) {
                    var session = this.getSession();
                    var isRewardedPromo = (rewardedPromo !== undefined) ? rewardedPromo : false;
                    return tslib_1.__assign({}, this.getCometCampaignBaseParams(session, json.promo.id, json.meta, adType), { iapProductId: json.promo.iapProductId, additionalTrackingEvents: json.promo.tracking ? json.promo.tracking : undefined, dynamicMarkup: json.promo.dynamicMarkup, creativeAsset: new HTML_1.HTML(json.promo.creativeUrl, session), rewardedPromo: isRewardedPromo });
                };
                TestFixtures.getPromoCampaign = function (adType, rewardedPromo) {
                    var json = JSON.parse(DummyPromoCampaign_json_1.default);
                    return new PromoCampaign_1.PromoCampaign(this.getPromoCampaignParams(json, adType, rewardedPromo));
                };
                TestFixtures.getCampaignFollowsRedirects = function () {
                    var json = JSON.parse(OnCometVideoPlcCampaignFollowsRedirects_json_1.default);
                    var performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
                    return new PerformanceCampaign_1.PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, PerformanceCampaign_1.StoreName.GOOGLE));
                };
                TestFixtures.getCampaign = function () {
                    var json = JSON.parse(OnCometVideoPlcCampaign_json_1.default);
                    var performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
                    return new PerformanceCampaign_1.PerformanceCampaign(this.getPerformanceCampaignParams(performanceJson, PerformanceCampaign_1.StoreName.GOOGLE));
                };
                TestFixtures.getXPromoCampaign = function () {
                    var json = JSON.parse(OnXPromoPlcCampaign_json_1.default);
                    var xPromoJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
                    return new XPromoCampaign_1.XPromoCampaign(this.getXPromoCampaignParams(xPromoJson, PerformanceCampaign_1.StoreName.GOOGLE));
                };
                TestFixtures.getPlayableMRAIDCampaignFollowsRedirects = function () {
                    var json = JSON.parse(OnCometMraidPlcCampaignFollowsRedirects_json_1.default);
                    return new MRAIDCampaign_1.MRAIDCampaign(this.getPlayableMRAIDCampaignParams(json, PerformanceCampaign_1.StoreName.GOOGLE));
                };
                TestFixtures.getPlayableMRAIDCampaign = function () {
                    var json = JSON.parse(OnCometMraidPlcCampaign_json_1.default);
                    return new MRAIDCampaign_1.MRAIDCampaign(this.getPlayableMRAIDCampaignParams(json, PerformanceCampaign_1.StoreName.GOOGLE));
                };
                TestFixtures.getProgrammaticMRAIDCampaign = function () {
                    var json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign_json_1.default);
                    return new MRAIDCampaign_1.MRAIDCampaign(this.getProgrammaticMRAIDCampaignParams(json, 3600, 'testId'));
                };
                TestFixtures.getCompanionVastCampaign = function () {
                    var vastParser = TestFixtures.getVastParser();
                    var vast = vastParser.parseVast(VastCompanionAd_xml_1.default);
                    return new VastCampaign_1.VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
                };
                TestFixtures.getEventVastCampaign = function () {
                    var vastParser = TestFixtures.getVastParser();
                    var vastXml = EventTestVast_xml_1.default;
                    var vast = vastParser.parseVast(vastXml);
                    return new VastCampaign_1.VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
                };
                TestFixtures.getCompanionVastCampaignWihoutImages = function () {
                    var vastParser = TestFixtures.getVastParser();
                    var vastXml = VastCompanionAdWithoutImages_xml_1.default;
                    var vast = vastParser.parseVast(vastXml);
                    return new VastCampaign_1.VastCampaign(this.getVastCampaignParams(vast, 3600, '12345'));
                };
                TestFixtures.getDisplayInterstitialCampaign = function () {
                    var json = JSON.parse(DummyDisplayInterstitialCampaign_json_1.default);
                    var displayInterstitialParams = tslib_1.__assign({}, this.getDisplayInterstitialCampaignBaseParams(json, PerformanceCampaign_1.StoreName.GOOGLE, '12345'), { dynamicMarkup: json.content });
                    return new DisplayInterstitialCampaign_1.DisplayInterstitialCampaign(displayInterstitialParams);
                };
                TestFixtures.getClientInfo = function (platform, gameId) {
                    if (typeof platform === 'undefined') {
                        platform = Platform_1.Platform.ANDROID;
                    }
                    return new ClientInfo_1.ClientInfo(platform, [
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
                };
                TestFixtures.getAndroidDeviceInfo = function () {
                    return new FakeAndroidDeviceInfo_1.FakeAndroidDeviceInfo(TestFixtures.getNativeBridge());
                };
                TestFixtures.getIosDeviceInfo = function () {
                    return new FakeIosDeviceInfo_1.FakeIosDeviceInfo(TestFixtures.getNativeBridge());
                };
                TestFixtures.getOkNativeResponse = function () {
                    return {
                        url: 'http://foo.url.com',
                        response: 'foo response',
                        responseCode: 200,
                        headers: [['location', 'http://foobar.com']]
                    };
                };
                TestFixtures.getVastParser = function () {
                    var vastParser;
                    var domParser = new DOMParser();
                    vastParser = new VastParser_1.VastParser(domParser);
                    return vastParser;
                };
                TestFixtures.getNativeBridge = function (platform) {
                    if (typeof platform === 'undefined') {
                        platform = Platform_1.Platform.TEST;
                    }
                    var backend = {
                        handleInvocation: function () {
                            // no-op
                        },
                        handleCallback: function () {
                            // no-op
                        }
                    };
                    return new NativeBridge_1.NativeBridge(backend, platform);
                };
                TestFixtures.getConfiguration = function () {
                    var json = JSON.parse(ConfigurationAuctionPlc_json_1.default);
                    return ConfigurationParser_1.ConfigurationParser.parse(json);
                };
                TestFixtures.getCacheDiagnostics = function () {
                    return {
                        creativeType: 'TEST',
                        targetGameId: 5678,
                        targetCampaignId: '123456abcdef'
                    };
                };
                TestFixtures.getSession = function () {
                    return new Session_1.Session('12345');
                };
                TestFixtures.getPackageInfo = function () {
                    return {
                        installer: 'com.install.er',
                        firstInstallTime: 12345,
                        lastUpdateTime: 67890,
                        versionCode: 123,
                        versionName: '1.2.3',
                        packageName: 'com.package.name'
                    };
                };
                TestFixtures.getDisplayMarkup = function () {
                    var json = JSON.parse(DummyDisplayInterstitialCampaign_json_1.default);
                    return decodeURIComponent(json.display.markup);
                };
                TestFixtures.getFakeNativeDeviceInfo = function () {
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
                };
                TestFixtures.getFakeNativeAndroidDeviceInfo = function () {
                    return {
                        getAndroidId: sinon.stub().returns(Promise.resolve('17')),
                        getApiLevel: sinon.stub().returns(Promise.resolve(16)),
                        getManufacturer: sinon.stub().returns(Promise.resolve('N')),
                        getScreenDensity: sinon.stub().returns(Promise.resolve(2)),
                        getScreenLayout: sinon.stub().returns(Promise.resolve(1)),
                        getTotalSpace: sinon.stub().returns(Promise.resolve(2048)),
                        getRingerMode: sinon.stub().returns(Promise.resolve(RingerMode_1.RingerMode.RINGER_MODE_NORMAL)),
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
                };
                TestFixtures.getFakeNativeIosDeviceInfo = function () {
                    return {
                        getUserInterfaceIdiom: sinon.stub().returns(Promise.resolve(UIUserInterfaceIdiom_1.UIUserInterfaceIdiom.UIUserInterfaceIdiomPad)),
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
                };
                return TestFixtures;
            }());
            exports_1("TestFixtures", TestFixtures);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdEZpeHR1cmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVGVzdEZpeHR1cmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBK0NNLFdBQVcsR0FBRywyQkFBMkIsQ0FBQztZQUNoRDtnQkFBQTtnQkFxZ0JBLENBQUM7Z0JBcGdCaUIseUJBQVksR0FBMUI7b0JBQ0ksT0FBTyxJQUFJLHFCQUFTLENBQUM7d0JBQ2pCLEVBQUUsRUFBRSxPQUFPO3dCQUNYLElBQUksRUFBRSxTQUFTO3dCQUNmLFNBQVMsRUFBRSxLQUFLO3dCQUNoQixTQUFTLEVBQUUsS0FBSzt3QkFDaEIsYUFBYSxFQUFFLENBQUM7d0JBQ2hCLGlCQUFpQixFQUFFLEtBQUs7d0JBQ3hCLDRCQUE0QixFQUFFLEtBQUs7d0JBQ25DLFNBQVMsRUFBRSxLQUFLO3FCQUNuQixDQUFDLENBQUM7Z0JBQ1AsQ0FBQztnQkFFYSx1Q0FBMEIsR0FBeEMsVUFBeUMsT0FBZ0IsRUFBRSxVQUFrQixFQUFFLElBQXdCLEVBQUUsTUFBZTtvQkFDcEgsT0FBTzt3QkFDSCxFQUFFLEVBQUUsVUFBVTt3QkFDZCxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsTUFBTSxFQUFFLE1BQU0sSUFBSSxTQUFTO3dCQUMzQixhQUFhLEVBQUUsU0FBUzt3QkFDeEIsVUFBVSxFQUFFLFNBQVM7d0JBQ3JCLE1BQU0sRUFBRSxTQUFTO3dCQUNqQixJQUFJLEVBQUUsSUFBSTt3QkFDVixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsT0FBTyxFQUFFLFdBQVc7cUJBQ3ZCLENBQUM7Z0JBQ04sQ0FBQztnQkFFYSx5Q0FBNEIsR0FBMUMsVUFBMkMsSUFBUyxFQUFFLFNBQW9CO29CQUN0RSxJQUFNLE9BQU8sR0FBRyxJQUFJLENB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