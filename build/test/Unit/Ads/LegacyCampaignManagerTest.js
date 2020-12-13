import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignal } from 'AdMob/Models/AdMobSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { HTML } from 'Ads/Models/Assets/HTML';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { WebViewError } from 'Core/Errors/WebViewError';
import { CacheManager } from 'Core/Managers/CacheManager';
import { RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import OnCometMraidPlcCampaignJson from 'json/OnCometMraidPlcCampaign.json';
import OnCometVideoPlcCampaignJson from 'json/OnCometVideoPlcCampaign.json';
import OnProgrammaticMraidPlcCampaignJson from 'json/OnProgrammaticMraidPlcCampaign.json';
import OnProgrammaticMraidPlcCampaignEmpty from 'json/OnProgrammaticMraidPlcCampaignEmpty.json';
import OnProgrammaticMraidPlcCampaignNull from 'json/OnProgrammaticMraidPlcCampaignNull.json';
import OnProgrammaticMraidUrlPlcCampaignJson from 'json/OnProgrammaticMraidUrlPlcCampaign.json';
import OnProgrammaticMraidUrlPlcCampaignEmpty from 'json/OnProgrammaticMraidUrlPlcCampaignEmpty.json';
import OnProgrammaticVastPlcCampaignJson from 'json/OnProgrammaticVastPlcCampaign.json';
import OnProgrammaticVastPlcCampaignCustomTracking from 'json/OnProgrammaticVastPlcCampaignCustomTracking.json';
import OnProgrammaticVastPlcCampaignFailing from 'json/OnProgrammaticVastPlcCampaignFailing.json';
import OnProgrammaticVastPlcCampaignIncorrect from 'json/OnProgrammaticVastPlcCampaignIncorrect.json';
import OnProgrammaticVastPlcCampaignInsideOutsideJson from 'json/OnProgrammaticVastPlcCampaignInsideOutside.json';
import OnProgrammaticVastPlcCampaignMaxDepth from 'json/OnProgrammaticVastPlcCampaignMaxDepth.json';
import OnProgrammaticVastPlcCampaignNoData from 'json/OnProgrammaticVastPlcCampaignNoData.json';
import OnProgrammaticVastPlcCampaignNoVideo from 'json/OnProgrammaticVastPlcCampaignNoVideo.json';
import OnProgrammaticVastPlcCampaignNoVideoWrapped from 'json/OnProgrammaticVastPlcCampaignNoVideoWrapped.json';
import OnProgrammaticVastPlcCampaignNullData from 'json/OnProgrammaticVastPlcCampaignNullData.json';
import OnProgrammaticVastPlcCampaignTooMuchWrapping from 'json/OnProgrammaticVastPlcCampaignTooMuchWrapping.json';
import OnProgrammaticVastPlcCampaignWrapped from 'json/OnProgrammaticVastPlcCampaignWrapped.json';
import OnStaticInterstitialDisplayHtmlCampaign from 'json/OnStaticInterstitialDisplayCampaign.json';
import OnStaticInterstitialDisplayJsCampaign from 'json/OnStaticInterstitialDisplayJsCampaign.json';
import OnProgrammaticVPAIDPlcCampaignJson from 'json/OnProgrammaticVPAIDPlcCampaign.json';
import OnXPromoPlcCampaignJson from 'json/OnXPromoPlcCampaign.json';
import 'mocha';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { ProgrammaticMraidUrlParser } from 'MRAID/Parsers/ProgrammaticMraidUrlParser';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import IncorrectWrappedVast from 'xml/IncorrectWrappedVast.xml';
import NonWrappedVast from 'xml/NonWrappedVast.xml';
import NoVideoWrappedVast from 'xml/NoVideoWrappedVast.xml';
import VastInlineLinear from 'xml/VastInlineLinear.xml';
import WrappedVast1 from 'xml/WrappedVast1.xml';
import WrappedVast2 from 'xml/WrappedVast2.xml';
import WrappedVast3 from 'xml/WrappedVast3.xml';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { Url } from 'Core/Utilities/Url';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { XPromoCampaignParser } from 'XPromo/Parsers/XPromoCampaignParser';
import { VastAdUnitFactory } from 'VAST/AdUnits/VastAdUnitFactory';
import { DisplayInterstitialAdUnitFactory } from 'Display/AdUnits/DisplayInterstitialAdUnitFactory';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { XPromoAdUnitFactory } from 'XPromo/AdUnits/XPromoAdUnitFactory';
import AuctionV5Response from 'json/AuctionV5Response.json';
import LoadedCampaignResponse from 'json/LoadedCampaignResponse.json';
import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';
import { VPAIDAdUnitFactory } from 'VPAID/AdUnits/VPAIDAdUnitFactory';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
describe('LegacyCampaignManager', () => {
    let deviceInfo;
    let clientInfo;
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let storageBridge;
    let wakeUpManager;
    let request;
    let vastParser;
    let coreConfig;
    let adsConfig;
    let metaDataManager;
    let sessionManager;
    let adMobSignalFactory;
    let cacheBookkeeping;
    let contentTypeHandlerManager;
    let adUnitParametersFactory;
    let privacySDK;
    let userPrivacyManager;
    const onShowTrackingUrls = {
        'start': [
            'www.testyboy.com',
            'www.scottwise.com'
        ]
    };
    beforeEach(() => {
        RequestManager.setTestAuctionProtocol(AuctionProtocol.V4);
        coreConfig = CoreConfigurationParser.parse(ConfigurationAuctionPlc);
        adsConfig = AdsConfigurationParser.parse(ConfigurationAuctionPlc);
        clientInfo = TestFixtures.getClientInfo();
        vastParser = TestFixtures.getVastParserStrict();
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        privacySDK = TestFixtures.getPrivacySDK(core.Api);
        storageBridge = core.StorageBridge;
        cacheBookkeeping = core.CacheBookkeeping;
        wakeUpManager = core.WakeUpManager;
        request = core.RequestManager;
        deviceInfo = core.DeviceInfo;
        metaDataManager = core.MetaDataManager;
        sessionManager = new SessionManager(core.Api, request, storageBridge);
        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        adMobSignalFactory.getAdRequestSignal.returns(Promise.resolve(new AdMobSignal()));
        adMobSignalFactory.getOptionalSignal.returns(Promise.resolve(new AdMobOptionalSignal()));
        sinon.stub(SDKMetrics, 'reportMetricEvent');
        sinon.stub(SDKMetrics, 'reportTimingEvent');
        sinon.stub(SDKMetrics, 'reportMetricEventWithTags');
        sinon.stub(SDKMetrics, 'reportTimingEventWithTags');
        contentTypeHandlerManager = new ContentTypeHandlerManager();
        adUnitParametersFactory = sinon.createStubInstance(AbstractAdUnitParametersFactory);
        userPrivacyManager = new UserPrivacyManager(platform, core.Api, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
    });
    describe('on VAST campaign', () => {
        it('should trigger onCampaign after requesting a valid vast placement', () => {
            // given a valid VAST placement
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(OnProgrammaticVastPlcCampaignJson)
            }));
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(core), factory: new VastAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredCampaign;
            let triggeredError;
            campaignManager.onCampaign.subscribe((placementId, campaign) => {
                triggeredCampaign = campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });
            // when the campaign manager requests the placement
            return campaignManager.request().then(() => {
                if (triggeredError) {
                    throw triggeredError;
                }
                // then the onVastCampaign observable is triggered with the correct campaign data
                mockRequest.verify();
                assert.equal(triggeredCampaign.getVideo().getUrl(), 'https://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
            });
        });
        it('should have data from inside and outside the wrapper for a wrapped VAST', (done) => {
            // given a valid wrapped VAST placement that points at a valid VAST with an inline ad
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(OnProgrammaticVastPlcCampaignInsideOutsideJson)
            }));
            mockRequest.expects('get').withArgs('http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml', [], { retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false }).returns(Promise.resolve({
                response: VastInlineLinear
            }));
            vastParser.setMaxWrapperDepth(1);
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(core), factory: new VastAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredCampaign;
            campaignManager.onCampaign.subscribe((placementId, campaign) => {
                if (!triggeredCampaign && campaign) {
                    triggeredCampaign = campaign;
                    // then the onVastCampaign observable is triggered with the correct campaign data
                    mockRequest.verify();
                    assert.equal(triggeredCampaign.getVideo().getUrl(), 'http://cdnp.tremormedia.com/video/acudeo/Carrot_400x300_500kb.mp4');
                    assert.deepEqual(triggeredCampaign.getVast().getAd().getErrorURLTemplates(), [
                        'http://myErrorURL/error',
                        'http://myErrorURL/wrapper/error'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getImpressionUrls(), [
                        'http://myTrackingURL/impression',
                        'http://myTrackingURL/wrapper/impression'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.CREATIVE_VIEW), [
                        'http://myTrackingURL/creativeView',
                        'http://myTrackingURL/wrapper/creativeView'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.START), [
                        'http://myTrackingURL/start',
                        'http://myTrackingURL/wrapper/start'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.FIRST_QUARTILE), [
                        'http://myTrackingURL/firstQuartile',
                        'http://myTrackingURL/wrapper/firstQuartile'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.MIDPOINT), [
                        'http://myTrackingURL/midpoint',
                        'http://myTrackingURL/wrapper/midpoint'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.THIRD_QUARTILE), [
                        'http://myTrackingURL/thirdQuartile',
                        'http://myTrackingURL/wrapper/thirdQuartile'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.COMPLETE), [
                        'http://myTrackingURL/complete',
                        'http://myTrackingURL/wrapper/complete'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.MUTE), [
                        'http://myTrackingURL/wrapper/mute'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.UNMUTE), [
                        'http://myTrackingURL/wrapper/unmute'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getVideoClickTrackingURLs(), [
                        'http://myTrackingURL/click'
                    ]);
                    assert.equal(triggeredCampaign.getVast().getVideoClickThroughURL(), 'http://www.tremormedia.com');
                    assert.equal(triggeredCampaign.getVast().getDuration(), 30);
                    done();
                }
            });
            // when the campaign manager requests the placement
            campaignManager.request();
        });
        it('should have data from both wrappers and the final wrapped vast for vast with 2 levels of wrapping', () => {
            // given a valid wrapped VAST placement that points at a valid VAST with an inline ad
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(OnProgrammaticVastPlcCampaignWrapped)
            }));
            mockRequest.expects('get').withArgs(Url.encodeUrlWithQueryParams('https://x.vindicosuite.com/?l=454826&t=x&rnd=[Cachebuster_If_Supported_In_Console]'), [], { retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false }).returns(Promise.resolve({
                response: JSON.stringify(WrappedVast1)
            }));
            mockRequest.expects('get').withArgs(Url.encodeUrlWithQueryParams('https://ads.pointroll.com/PortalServe/?pid=2810492V01420160323193924&pos=o&secure=1&r=1466475479'), [], { retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false }).returns(Promise.resolve({
                response: JSON.stringify(WrappedVast2)
            }));
            vastParser.setMaxWrapperDepth(2);
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(core), factory: new VastAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredCampaign;
            campaignManager.onError.subscribe((error) => {
                assert.equal(1, 2, error.message);
            });
            campaignManager.onCampaign.subscribe((placementId, campaign) => {
                triggeredCampaign = campaign;
                // then the onVastCampaign observable is triggered with the correct campaign data
                mockRequest.verify();
                assert.equal(triggeredCampaign.getVideo().getUrl(), 'https://speed-s.pointroll.com/pointroll/media/asset/Nissan/221746/Nissan_FY16_FTC_GM_Generic_Instream_1280x720_400kbps_15secs.mp4');
                assert.deepEqual(triggeredCampaign.getVast().getAd().getErrorURLTemplates(), [
                    'https://bid.g.doubleclick.net/xbbe/notify/tremorvideo?creative_id=17282869&usl_id=0&errorcode=[ERRORCODE]&asseturi=[ASSETURI]&ord=[CACHEBUSTING]&offset=[CONTENTPLAYHEAD]&d=APEucNX6AnAylHZpx52AcFEstrYbL-_q_2ud9qCaXyViLGR4yz7SDI0QjLTfTgW5N60hztCt5lwtX-qOtPbrEbEH7AkfRc7aI04dfJWGCQhTntCRkpOC6UUNuHBWGPhsjDpKl8_I-piRwwFMMkZSXe8jaPe6gsJMdwmNCBn8OfpcbVAS0bknPVh1KkaXOZY-wnjj6kR0_VFyzS1fPi5lD3kj3lnBaEliKv-aqtH6SRbhBZoP7J-M9hM',
                    'http://events.tremorhub.com/diag?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&rid=fd53cdbe934c44c68c57467d184160d7&rtype=VAST_ERR&vastError=[ERRORCODE]&sec=false&adcode=rwd19-1059849-video&seatId=60673&pbid=1585&brid=3418&sid=9755&sdom=demo.app.com&asid=5097&nid=3&lid=3&adom=nissanusa.com&crid=17282869&aid=13457'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getImpressionUrls(), [
                    'https://ads.pointroll.com/PortalServe/?secure=1&pid=2810492V01420160323193924&pos=o&oimp=C0350500-4E6E-9A6D-0314-A20018D20101&fcook=~&actid=-1206&cid=2183676&playmode=$PLAYMODE$&r=1466475479',
                    'https://ad.doubleclick.net/ddm/ad/N3340.1922318VIANTINC.COM/B9495003.129068239;sz=1x1;ord=1466475479;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=?',
                    'https://x.vindicosuite.com/dserve/t=d;l=454826;c=918974;b=3968433;ta=4981097;cr=497788800;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;a=82365;ts=1466475479',
                    'https://sb.scorecardresearch.com/p?c1=1&c2=3000027&c3=&c4=&c5=01&cA1=3&cA2=2101&cA3=918974&cA4=3968433&cA5=454826&cA6=1&rn=1466475479',
                    'https://sb.scorecardresearch.com/p?c1=1&c2=15796101&c3=&c4=&c5=01&cA1=3&cA2=2101&cA3=918974&cA4=3968433&cA5=454826&cA6=1&rn=1466475479',
                    'https://googleads4.g.doubleclick.net/pcs/view?xai=AKAOjstYlfbiBdblfXq6LMym7IC5jwoF21UXuGUDBRde_xEZcfAEOwcQjxvzCqZC5xoBrfhSWeKfI9Vz-D1j&sai=AMfl-YQb2HT6IsBYPlBStYINPJzmMSeKis_RCNPsUxYoiKpSFPeIiBL5vp5CBf3w5bw&sig=Cg0ArKJSzFyUVtx3UaXREAE&urlfix=1&adurl=',
                    'https://bid.g.doubleclick.net/xbbe/view?d=APEucNXGC7uCkDFg7_FYyowfGrx3gCKqhj3JqV93eVSng28OzYoBI8eE3HMmMaZotBjcJre8GVivuBgii_YOG0AJuoUi5TTrE7Zbb21k0RzF9urGsENZJLmfN1rU1WL1GJdWq5e-cfjN-RNzdogp_BDoCo7AbTtBNu9yXLyQZYjDjv9YQQm_9nJjbhG5s-lNtk8OxpEKZkS6qGU8UsI1Ox8YtPSXjIJ3obdROAlANqs5ptxYWId2hu8&pr=1.022',
                    'https://bid.g.doubleclick.net/xbbe/pixel?d=CPYDEKyCFxi17p4IIAE&v=APEucNVfdw4VBtAGiqhdQ4w6G19gKA3EINCPdqNCuaourBH1J2uL8UN6cqxVJdM0ostWINYYDJCq',
                    'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=IMP',
                    'http://b.scorecardresearch.com/b?C1=1&C2=6000001&C3=&C4=&C5=010000&rnd=8202933074266195079',
                    'http://adserver.unityads.unity3d.com/brands/1059849/%ZONE%/start?value=715&gm=1022&nm=715&cc=USD&seat=60673&pubId=1585&brandId=3418&supplyId=9755&unit=13457&code=rwd19-1059849-video&source=5097&demand=60004&nt=3&domain=nissanusa.com&cId=17282869&deal='
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.CREATIVE_VIEW), [
                    'https://x.vindicosuite.com/event/?e=11;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=95458;cr=2686135030;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href='
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.START), [
                    'https://x.vindicosuite.com/event/?e=12;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=91256;cr=2539347201;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=11;',
                    'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=start&vastcrtype=linear&crid=67817785'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.FIRST_QUARTILE), [
                    'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-201&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                    'https://x.vindicosuite.com/event/?e=13;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=52835;cr=3022585079;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=960584;',
                    'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=firstQuartile&vastcrtype=linear&crid=67817785'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.MIDPOINT), [
                    'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-202&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                    'https://x.vindicosuite.com/event/?e=14;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=23819;cr=99195890;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=18;',
                    'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=midpoint&vastcrtype=linear&crid=67817785'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.THIRD_QUARTILE), [
                    'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-203&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                    'https://x.vindicosuite.com/event/?e=15;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=9092;cr=1110035921;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=960585;',
                    'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=thirdQuartile&vastcrtype=linear&crid=67817785'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.COMPLETE), [
                    'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-204&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                    'https://x.vindicosuite.com/event/?e=16;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=93062;cr=3378288114;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=13;',
                    'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=complete&vastcrtype=linear&crid=67817785'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.MUTE), [
                    'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1004&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                    'https://x.vindicosuite.com/event/?e=17;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=45513;cr=483982038;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=16;'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.UNMUTE), [
                    'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1005&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                    'https://x.vindicosuite.com/event/?e=18;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=5138;cr=1883451934;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=149645;'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getVideoClickTrackingURLs(), [
                    'https://www.tremor.com/click-last-wrapped',
                    'https://x.vindicosuite.com/click/?v=5;m=3;l=454826;c=918974;b=3968433;ts=1466475479;ui=Mzxw7vcjJKIYUBr51X6qI4T75yHPBloC4oFyIzlnzuseNOCWolB7mBUvaYyxz5q64WKJSiV1f2Vkqdfz1Uc8_w;pc=1;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;ep=1',
                    'https://adclick.g.doubleclick.net/pcs/click?xai=AKAOjstYlfbiBdblfXq6LMym7IC5jwoF21UXuGUDBRde_xEZcfAEOwcQjxvzCqZC5xoBrfhSWeKfI9Vz-D1j&sai=AMfl-YT-yQK5ngqbHCt-MCth_f3g6Ql6PBVZa7-oecKkqrVqkSNK6jTjavZZXhulRKo&sig=Cg0ArKJSzI2sXx3KmnQbEAE&urlfix=1&adurl=',
                    'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=click&vastcrtype=linear&crid=67817785'
                ]);
                assert.equal(triggeredCampaign.getVast().getVideoClickThroughURL(), 'http://clk.pointroll.com/bc/?a=2183676&c=9001&i=C0350500-4E6E-9A6D-0314-A20018D20101&clickurl=https://ad.doubleclick.net/ddm/clk/302764234%3B129068239%3Bg%3Fhttp://www.choosenissan.com/altima/%3Fdcp=zmm.%25epid!.%26dcc=%25ecid!.%25eaid!%26utm_source=%25esid!%26utm_medium=%25epid!%26utm_content=%25ecid!.%25eaid!%26dcn=1');
                assert.equal(triggeredCampaign.getVast().getDuration(), 15);
                // when the campaign manager requests the placement
                campaignManager.request();
            });
        });
        it('should fail when max depth is exceeded', (done) => {
            // given a valid wrapped VAST placement that points at a valid VAST with a wrapper
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(OnProgrammaticVastPlcCampaignMaxDepth)
            }));
            const nonWrappedVAST = NonWrappedVast;
            const wrappedVAST = WrappedVast3;
            // create intermediate wrappers
            for (let i = 0; i < 8; i++) {
                mockRequest.expects('get').returns(Promise.resolve({
                    response: wrappedVAST
                }));
            }
            // return last non wrapped VAST
            mockRequest.expects('get').returns(Promise.resolve({
                response: nonWrappedVAST
            }));
            // mocks error urls from each Wrapped vast
            const errorURLs = ['http://myErrorURL/wrapper/error', 'http://myErrorURL/wrapper/error', 'http://myErrorURL/wrapper/error', 'http://myErrorURL/wrapper/error', 'http://myErrorURL/wrapper/error', 'http://myErrorURL/wrapper/error', 'http://myErrorURL/wrapper/error', 'http://myErrorURL/wrapper/error', 'http://myErrorURL/wrapper/error'];
            if (errorURLs) {
                for (const errorURL of errorURLs) {
                    mockRequest.expects('get').withArgs(errorURL, []).returns(Promise.resolve());
                }
            }
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(core), factory: new VastAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            campaignManager.onError.subscribe((err) => {
                assert.equal(err.message, VastErrorInfo.errorMap[VastErrorCode.WRAPPER_DEPTH_LIMIT_REACHED]);
                done();
            });
            // when the campaign manager requests the placement
            campaignManager.request();
        });
        const verifyErrorForResponse = (response, expectedErrorMessage) => {
            // given a VAST placement with invalid XML
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(core), factory: new VastAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredError;
            campaignManager.onError.subscribe((error) => {
                triggeredError = error;
            });
            // when the campaign manager requests the placement
            return campaignManager.request().then(() => {
                // then the onError observable is triggered with an appropriate error
                mockRequest.verify();
                assert.equal(triggeredError.message, expectedErrorMessage);
            });
        };
        const verifyErrorForWrappedResponse = (response, wrappedUrl, wrappedResponse, expectedErrorMessage, errorURLs, done) => {
            // given a VAST placement that wraps another VAST
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));
            mockRequest.expects('get').withArgs(wrappedUrl, [], { retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false }).returns(wrappedResponse);
            if (errorURLs) {
                for (const errorURL of errorURLs) {
                    mockRequest.expects('get').withArgs(errorURL, []).returns(Promise.resolve());
                }
            }
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(core), factory: new VastAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredError;
            const verify = () => {
                // then the onError observable is triggered with an appropriate error
                mockRequest.verify();
                if (triggeredError instanceof Error) {
                    assert.equal(triggeredError.message, expectedErrorMessage);
                }
                else if (triggeredError instanceof WebViewError) {
                    assert.equal(triggeredError.message, expectedErrorMessage);
                }
                else {
                    assert.equal(triggeredError, expectedErrorMessage);
                }
            };
            campaignManager.onError.subscribe((error) => {
                triggeredError = error;
                if (done) {
                    // then the onError observable is triggered with an appropriate error
                    verify();
                    done();
                }
            });
            // when the campaign manager requests the placement
            campaignManager.request();
        };
        describe('VAST error handling', () => {
            it('should trigger onError after requesting a vast placement without a video url', () => {
                const response = {
                    response: JSON.stringify(OnProgrammaticVastPlcCampaignNoVideo)
                };
                return verifyErrorForResponse(response, VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_URL_NOT_FOUND]);
            });
            it('should trigger onError after requesting a wrapped vast placement without a video url', (done) => {
                const response = {
                    response: JSON.stringify(OnProgrammaticVastPlcCampaignNoVideoWrapped)
                };
                const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
                const wrapperErrorUrls = ['http://myErrorURL/error', 'http://myErrorURL/wrapper/error'];
                const wrappedResponse = Promise.resolve({
                    response: NoVideoWrappedVast
                });
                return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_URL_NOT_FOUND], wrapperErrorUrls, done);
            });
            it('should trigger onError after requesting a vast placement with incorrect document element node name', () => {
                const response = {
                    response: JSON.stringify(OnProgrammaticVastPlcCampaignIncorrect)
                };
                return verifyErrorForResponse(response, 'VAST xml was not parseable:\n   This page contains the following errors:error on line 33 at column 12: Opening and ending tag mismatch: VASTy line 0 and VAST\nBelow is a rendering of the page up to the first error.');
            });
            it('should trigger onError after requesting a wrapped vast placement with incorrect document element node name', () => {
                const response = {
                    response: JSON.stringify(OnProgrammaticVastPlcCampaignIncorrect)
                };
                const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
                const wrappedResponse = Promise.resolve({
                    response: JSON.stringify(IncorrectWrappedVast)
                });
                return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, 'VAST xml is invalid - document element must be VAST but was foo');
            });
            it('should trigger onError after requesting a vast placement with no vast data', () => {
                const response = {
                    response: JSON.stringify(OnProgrammaticVastPlcCampaignNoData)
                };
                return verifyErrorForResponse(response, 'VAST xml was not parseable:\n   This page contains the following errors:error on line 1 at column 1: Document is empty\nBelow is a rendering of the page up to the first error.');
            });
            it('should trigger onError after requesting a wrapped vast placement when a failure occurred requesting the wrapped VAST', () => {
                const response = {
                    response: JSON.stringify(OnProgrammaticVastPlcCampaignFailing)
                };
                const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
                const wrappedResponse = Promise.reject(VastErrorInfo.errorMap[VastErrorCode.WRAPPER_GENERAL_ERROR]);
                return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, VastErrorInfo.errorMap[VastErrorCode.WRAPPER_GENERAL_ERROR]);
            });
            it('should trigger onError after requesting a vast placement with null vast data', () => {
                // given a VAST placement with null vast
                const response = {
                    response: JSON.stringify(OnProgrammaticVastPlcCampaignNullData)
                };
                const mockRequest = sinon.mock(request);
                mockRequest.expects('post').returns(Promise.resolve(response));
                const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
                const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
                let noFillTriggered = false;
                let triggeredError;
                campaignManager.onNoFill.subscribe(() => {
                    noFillTriggered = true;
                });
                campaignManager.onError.subscribe(error => {
                    triggeredError = error;
                });
                // when the campaign manager requests the placement
                return campaignManager.request().then(() => {
                    mockRequest.verify();
                    return verifyErrorForResponse(response, 'model: AuctionResponse key: content with value: null: null is not in: string');
                });
            });
            it('should bail out when max wrapper depth is reached for a wrapped VAST', () => {
                // given a valid VAST response containing a wrapper
                const response = {
                    response: JSON.stringify(OnProgrammaticVastPlcCampaignTooMuchWrapping)
                };
                // when the parser's max wrapper depth is set to 0 to disallow wrapping
                ProgrammaticVastParser.setVastParserMaxDepth(0);
                // then we should get an error because there was no video URL,
                // because the video url would have been in the wrapped xml
                return verifyErrorForResponse(response, VastErrorInfo.errorMap[VastErrorCode.WRAPPER_DEPTH_LIMIT_REACHED]);
            });
        });
        const verifyCampaignForResponse = (response) => {
            // given a valid VAST placement
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(core), factory: new VastAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredCampaign;
            let triggeredError;
            campaignManager.onCampaign.subscribe((placementId, campaign) => {
                triggeredCampaign = campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });
            // when the campaign manager requests the placement
            return campaignManager.request().then(() => {
                if (triggeredError) {
                    throw triggeredError;
                }
                // then the onVastCampaign observable is triggered with the correct campaign data
                mockRequest.verify();
                assert.equal(triggeredCampaign.getVideo().getUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
            });
        };
        it('should process custom tracking urls', () => {
            // given a valid VAST placement
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(OnProgrammaticVastPlcCampaignCustomTracking)
            }));
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(core), factory: new VastAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredCampaign;
            let triggeredError;
            campaignManager.onCampaign.subscribe((placementId, campaign) => {
                triggeredCampaign = campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });
            // when the campaign manager requests the placement
            return campaignManager.request().then(() => {
                if (triggeredError) {
                    throw triggeredError;
                }
                // then the onVastCampaign observable is triggered with the correct campaign data
                mockRequest.verify();
                assert.equal(triggeredCampaign.getVideo().getUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.START), [
                    'http://customTrackingUrl/start',
                    'http://customTrackingUrl/start2',
                    'http://customTrackingUrl/start3/%ZONE%/blah?sdkVersion=?%SDK_VERSION%'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.FIRST_QUARTILE), [
                    'http://customTrackingUrl/firstQuartile'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.MIDPOINT), [
                    'http://customTrackingUrl/midpoint'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.THIRD_QUARTILE), [
                    'http://customTrackingUrl/thirdQuartile'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.COMPLETE), [
                    'http://customTrackingUrl/complete'
                ]);
            });
        });
    });
    describe('on MRAID campaign', () => {
        it('should trigger onMRAIDCampaign after receiving a MRAID campaign inlined', () => {
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(OnProgrammaticMraidUrlPlcCampaignJson)
            }));
            const json = OnProgrammaticMraidUrlPlcCampaignJson;
            const content = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticMraidUrlParser.ContentType, { parser: new ProgrammaticMraidUrlParser(platform), factory: new MRAIDAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredCampaign;
            let triggeredError;
            campaignManager.onCampaign.subscribe((placementId, campaign) => {
                triggeredCampaign = campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });
            return campaignManager.request().then(() => {
                if (triggeredError) {
                    throw triggeredError;
                }
                mockRequest.verify();
                assert.equal(triggeredCampaign.getId(), '005472656d6f7220416e6472');
                const asset = new HTML(content.inlinedUrl, triggeredCampaign.getSession());
                assert.deepEqual(triggeredCampaign.getResourceUrl(), asset);
                assert.deepEqual(triggeredCampaign.getRequiredAssets(), [asset]);
                assert.deepEqual(triggeredCampaign.getOptionalAssets(), []);
                assert.equal(triggeredCampaign.getDynamicMarkup(), content.dynamicMarkup);
                const willExpireAt = triggeredCampaign.getWillExpireAt();
                assert.isDefined(willExpireAt, 'Will expire at should be defined');
                if (willExpireAt) {
                    const timeDiff = willExpireAt - (Date.now() + json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].cacheTTL * 1000);
                    assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
                }
            });
        });
        it('should trigger onMRAIDCampaign after receiving a MRAID campaign non-inlined', () => {
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(OnProgrammaticMraidPlcCampaignJson)
            }));
            const json = OnProgrammaticMraidPlcCampaignJson;
            const content = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticMraidParser.ContentType, { parser: new ProgrammaticMraidParser(platform), factory: new MRAIDAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredCampaign;
            let triggeredError;
            campaignManager.onCampaign.subscribe((placementId, campaign) => {
                triggeredCampaign = campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });
            return campaignManager.request().then(() => {
                if (triggeredError) {
                    throw triggeredError;
                }
                mockRequest.verify();
                assert.equal(triggeredCampaign.getId(), '005472656d6f7220416e6472');
                assert.deepEqual(triggeredCampaign.getOptionalAssets(), []);
                assert.equal(triggeredCampaign.getResource(), content.markup);
                const willExpireAt = triggeredCampaign.getWillExpireAt();
                assert.isDefined(willExpireAt, 'Will expire at should be defined');
                if (willExpireAt) {
                    const timeDiff = willExpireAt - (Date.now() + json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].cacheTTL * 1000);
                    assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
                }
            });
        });
        it('should trigger onError if mraid property is null', (done) => {
            const response = {
                response: JSON.stringify(OnProgrammaticMraidPlcCampaignNull)
            };
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));
            let doneCalled = false;
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticMraidParser.ContentType, { parser: new ProgrammaticMraidParser(platform), factory: new MRAIDAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredError;
            campaignManager.onNoFill.subscribe(() => {
                if (!doneCalled) {
                    doneCalled = true;
                    done();
                }
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });
            campaignManager.request().then(() => {
                mockRequest.verify();
                assert.equal(triggeredError.message, 'model: AuctionResponse key: content with value: null: null is not in: string');
            });
        });
        it('should trigger onError if there is no markup', () => {
            const response = {
                response: JSON.stringify(OnProgrammaticMraidPlcCampaignEmpty)
            };
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticMraidParser.ContentType, { parser: new ProgrammaticMraidParser(platform), factory: new MRAIDAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredError;
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });
            return campaignManager.request().then(() => {
                mockRequest.verify();
                assert.equal(triggeredError.message, 'MRAID Campaign missing markup');
            });
        });
        it('should trigger onError if there is no inlinedUrl', () => {
            const response = {
                response: JSON.stringify(OnProgrammaticMraidUrlPlcCampaignEmpty)
            };
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticMraidUrlParser.ContentType, { parser: new ProgrammaticMraidUrlParser(platform), factory: new MRAIDAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredError;
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });
            return campaignManager.request().then(() => {
                mockRequest.verify();
                assert.equal(triggeredError.message, 'MRAID Campaign missing inlinedUrl');
            });
        });
    });
    describe('static interstitial display html', () => {
        it('should process the programmatic/static-interstitial-html', () => {
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(OnStaticInterstitialDisplayHtmlCampaign)
            }));
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticStaticInterstitialParser.ContentTypeHtml, { parser: new ProgrammaticStaticInterstitialParser(platform), factory: new DisplayInterstitialAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredCampaign;
            let triggeredError;
            campaignManager.onCampaign.subscribe((placementId, campaign) => {
                triggeredCampaign = campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });
            return campaignManager.request().then(() => {
                if (triggeredError) {
                    throw triggeredError;
                }
                mockRequest.verify();
                assert.deepEqual(triggeredCampaign.getOptionalAssets(), []);
            });
        });
    });
    describe('static interstitial display js', () => {
        it('should process the programmatic/static-interstitial-js', () => {
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(OnStaticInterstitialDisplayJsCampaign)
            }));
            const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager.addHandler(ProgrammaticStaticInterstitialParser.ContentTypeJs, { parser: new ProgrammaticStaticInterstitialParser(platform), factory: new DisplayInterstitialAdUnitFactory(adUnitParametersFactory) });
            const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            let triggeredCampaign;
            let triggeredError;
            campaignManager.onCampaign.subscribe((placementId, campaign) => {
                triggeredCampaign = campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });
            return campaignManager.request().then(() => {
                mockRequest.verify();
                assert.equal(triggeredError.message, ProgrammaticStaticInterstitialParser.ErrorMessage, 'Should trigger error when the content of display ad is not in HTML format');
            });
        });
    });
    describe('on PLC', () => {
        let assetManager;
        let campaignManager;
        let triggeredCampaign;
        let triggeredError;
        let triggeredPlacement;
        let mockRequest;
        beforeEach(() => {
            assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            contentTypeHandlerManager = new ContentTypeHandlerManager();
            contentTypeHandlerManager.addHandler(CometCampaignParser.ContentType, { parser: new CometCampaignParser(core), factory: new PerformanceAdUnitFactory(adUnitParametersFactory) });
            contentTypeHandlerManager.addHandler(XPromoCampaignParser.ContentType, { parser: new XPromoCampaignParser(platform), factory: new XPromoAdUnitFactory(adUnitParametersFactory) });
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(core), factory: new VastAdUnitFactory(adUnitParametersFactory) });
            contentTypeHandlerManager.addHandler(ProgrammaticMraidUrlParser.ContentType, { parser: new ProgrammaticMraidUrlParser(platform), factory: new MRAIDAdUnitFactory(adUnitParametersFactory) });
            contentTypeHandlerManager.addHandler(ProgrammaticMraidParser.ContentType, { parser: new ProgrammaticMraidParser(platform), factory: new MRAIDAdUnitFactory(adUnitParametersFactory) });
            contentTypeHandlerManager.addHandler(ProgrammaticVPAIDParser.ContentType, { parser: new ProgrammaticVPAIDParser(core), factory: new VPAIDAdUnitFactory(adUnitParametersFactory) });
            campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            campaignManager.onCampaign.subscribe((placement, campaign) => {
                triggeredCampaign = campaign;
                triggeredPlacement = placement;
            });
            campaignManager.onError.subscribe((error) => {
                triggeredError = error;
            });
            mockRequest = sinon.mock(request);
        });
        describe('performance campaign', () => {
            it('should process correct Auction comet/performance Campaign content type', () => {
                mockRequest.expects('post').returns(Promise.resolve({
                    response: JSON.stringify(OnCometVideoPlcCampaignJson)
                }));
                return campaignManager.request().then(() => {
                    if (triggeredError) {
                        throw triggeredError;
                    }
                    mockRequest.verify();
                    assert.isTrue(triggeredCampaign instanceof PerformanceCampaign);
                    assert.equal(triggeredPlacement, 'video');
                });
            });
            it('should process correct Auction comet/performance Campaign content type with mraidUrl', () => {
                mockRequest.expects('post').returns(Promise.resolve({
                    response: JSON.stringify(OnCometMraidPlcCampaignJson)
                }));
                return campaignManager.request().then(() => {
                    if (triggeredError) {
                        throw triggeredError;
                    }
                    mockRequest.verify();
                    assert.isTrue(triggeredCampaign instanceof MRAIDCampaign);
                    assert.equal(triggeredPlacement, 'mraid');
                    assert.deepEqual(triggeredCampaign.getResourceUrl(), new HTML('https://cdn.unityads.unity3d.com/playables/sma_re2.0.0_ios/index.html', triggeredCampaign.getSession(), 'mraid-test-creative-id'));
                });
            });
        });
        describe('XPromo campaign', () => {
            it('should process correct Auction xpromo/video Campaign content type', () => {
                mockRequest.expects('post').returns(Promise.resolve({
                    response: JSON.stringify(OnXPromoPlcCampaignJson)
                }));
                return campaignManager.request().then(() => {
                    if (triggeredError) {
                        throw triggeredError;
                    }
                    mockRequest.verify();
                    assert.isTrue(triggeredCampaign instanceof XPromoCampaign);
                    assert.equal(triggeredPlacement, 'video');
                });
            });
        });
        describe('VPAID campaign', () => {
            it('should process custom tracking urls for Auction programmatic/vpaid Campaign', () => {
                mockRequest.expects('post').returns(Promise.resolve({
                    response: JSON.stringify(OnProgrammaticVPAIDPlcCampaignJson)
                }));
                return campaignManager.request().then(() => {
                    if (triggeredError) {
                        throw triggeredError;
                    }
                    mockRequest.verify();
                    triggeredCampaign.setTrackingUrls(onShowTrackingUrls);
                    assert.isTrue(triggeredCampaign instanceof VPAIDCampaign);
                    assert.equal(triggeredPlacement, 'video');
                    assert.equal(triggeredCampaign.getAdType(), 'vpaid-sample-ad-type');
                    assert.equal(triggeredCampaign.getCreativeId(), 'vpaid-sample-creative-id');
                    assert.equal(triggeredCampaign.getSeatId(), 900);
                    assert.equal(triggeredCampaign.getCorrelationId(), '885a17ef11f05deb34b72b');
                    assert.deepEqual(triggeredCampaign.getVPAID().getTrackingEventUrls(TrackingEvent.START), [
                        'https://fake-ads-backend.unityads.unity3d.com/ack/333?event=vast-tracking-url',
                        'www.testyboy.com',
                        'www.scottwise.com'
                    ]);
                });
            });
        });
        describe('programmatic campaign', () => {
            it('should process custom tracking urls for Auction programmatic/vast Campaign', () => {
                mockRequest.expects('post').returns(Promise.resolve({
                    response: JSON.stringify(OnProgrammaticVastPlcCampaignJson)
                }));
                return campaignManager.request().then(() => {
                    if (triggeredError) {
                        throw triggeredError;
                    }
                    mockRequest.verify();
                    triggeredCampaign.setTrackingUrls(onShowTrackingUrls);
                    assert.isTrue(triggeredCampaign instanceof VastCampaign);
                    assert.equal(triggeredPlacement, 'video');
                    assert.equal(triggeredCampaign.getAdType(), 'vast-sample-ad-type');
                    assert.equal(triggeredCampaign.getCreativeId(), 'vast-sample-creative-id');
                    assert.equal(triggeredCampaign.getSeatId(), 900);
                    assert.equal(triggeredCampaign.getCorrelationId(), 'zzzz');
                    assert.equal(triggeredCampaign.getVideo().getUrl(), 'https://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls(TrackingEvent.START), [
                        'https://ads-brand-postback.unityads.unity3d.com/brands/2000/%ZONE%/impression/common?data=HriweFDQPzT1jnyWbt-UA8UKb9IOsNlB9YIUyM9eE5ujdz4eYZgsoFvzcfOR0945o8vsJZHvyi000XO4SVoOkgxlWcUpHRArDKtM16J5jLAhZkWxULyJ0JywIVC3Tebds1o5ZYQ5_KsbpqCbO-q56Jd3AKgbIlTgIDjATlSFf8AiOl96Y81UkZutA8jx4E2sQTCKg1ar6uXQvuXV6KG4IYdx8Jr5e9ZFvgjy6kxbgbuyuEw2_SKzmBCsj3Q2qOM_YxDzaxd5xa2kJ5H9udVwtLUs8OnndWj-k0f__xj958kx6pBvcCwm-xfQiP8zA0DuMq7IHqGt9uvzuvcSN8XX3klwoaYNjZGcggH_AvNoJMPM2lfBidn6cPGOk9IXNNdvT7s42Ss05RSVVqIm87eGmWWVfoSut_UIMTMes1JtxuSuBKCk3abJdUm1GhdJ8OTF3mOVJ1vKj7M%3D',
                        'https://www.dummy-url.com',
                        'www.testyboy.com',
                        'www.scottwise.com'
                    ]);
                });
            });
            it('should process correct Auction programmatic/mraid-url Campaign content type', () => {
                mockRequest.expects('post').returns(Promise.resolve({
                    response: JSON.stringify(OnProgrammaticMraidUrlPlcCampaignJson)
                }));
                return campaignManager.request().then(() => {
                    if (triggeredError) {
                        throw triggeredError;
                    }
                    mockRequest.verify();
                    assert.isTrue(triggeredCampaign instanceof MRAIDCampaign);
                    assert.equal(triggeredPlacement, 'mraid');
                    assert.equal(triggeredCampaign.getAdType(), 'mraid-url-sample-ad-type');
                    assert.equal(triggeredCampaign.getCreativeId(), 'mraid-url-sample-creative-id');
                    assert.equal(triggeredCampaign.getSeatId(), 901);
                    assert.equal(triggeredCampaign.getCorrelationId(), '0zGg2TfRsBNbqlc7AVdhLAw');
                    assert.deepEqual(triggeredCampaign.getResourceUrl(), new HTML('https://localhost', triggeredCampaign.getSession()));
                    assert.deepEqual(triggeredCampaign.getDynamicMarkup(), 'var markup = \'dynamic\';');
                    assert.deepEqual(triggeredCampaign.getTrackingUrls(), {
                        'impression': [
                            'http://test.impression.com/blah1',
                            'http://test.impression.com/blah2',
                            'http://test.impression.com/%ZONE%/blah?sdkVersion=%SDK_VERSION%'
                        ],
                        'complete': [
                            'http://test.complete.com/complete1'
                        ],
                        'click': [
                            'http://test.complete.com/click1'
                        ]
                    });
                });
            });
            it('should process correct Auction programmatic/mraid Campaign content type', () => {
                mockRequest.expects('post').returns(Promise.resolve({
                    response: JSON.stringify(OnProgrammaticMraidPlcCampaignJson)
                }));
                return campaignManager.request().then(() => {
                    if (triggeredError) {
                        throw triggeredError;
                    }
                    mockRequest.verify();
                    assert.isTrue(triggeredCampaign instanceof MRAIDCampaign);
                    assert.equal(triggeredPlacement, 'mraid');
                    assert.equal(triggeredCampaign.getAdType(), 'mraid-sample-ad-type');
                    assert.equal(triggeredCampaign.getCreativeId(), 'mraid-sample-creative-id');
                    assert.equal(triggeredCampaign.getSeatId(), 902);
                    assert.equal(triggeredCampaign.getCorrelationId(), 'zGg2TfRsBNbqlc7AVdhLAw');
                    assert.deepEqual(triggeredCampaign.getResource(), '<div>markup</div>');
                    assert.deepEqual(triggeredCampaign.getTrackingUrls(), { impression: ['https://ads-brand-postback.unityads.unity3d.com/brands/2000/%ZONE%/impression/common?data=Kz2J'] });
                });
            });
            it('should correct programmatic campaign id for android', () => {
                nativeBridge.getPlatform = () => {
                    return Platform.ANDROID;
                };
                assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
                campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
                campaignManager.onCampaign.subscribe((placement, campaign) => {
                    triggeredCampaign = campaign;
                    triggeredPlacement = placement;
                });
                campaignManager.onError.subscribe((error) => {
                    triggeredError = error;
                });
                mockRequest.expects('post').returns(Promise.resolve({
                    response: JSON.stringify(OnProgrammaticMraidPlcCampaignJson)
                }));
                return campaignManager.request().then(() => {
                    if (triggeredError) {
                        throw triggeredError;
                    }
                    mockRequest.verify();
                    assert.equal(triggeredCampaign.getId(), '005472656d6f7220416e6472');
                });
            });
            it('should correct programmatic campaign id for ios', () => {
                platform = Platform.IOS;
                backend = TestFixtures.getBackend(platform);
                nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                core = TestFixtures.getCoreModule(nativeBridge);
                // bad idea to do this, but need to update the platform inside the parser.
                const parser = contentTypeHandlerManager.getParser(ProgrammaticMraidParser.ContentType);
                parser._platform = platform;
                assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
                campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
                campaignManager.onCampaign.subscribe((placement, campaign) => {
                    triggeredCampaign = campaign;
                    triggeredPlacement = placement;
                });
                campaignManager.onError.subscribe((error) => {
                    triggeredError = error;
                });
                mockRequest.expects('post').returns(Promise.resolve({
                    response: JSON.stringify(OnProgrammaticMraidPlcCampaignJson)
                }));
                return campaignManager.request().then(() => {
                    if (triggeredError) {
                        throw triggeredError;
                    }
                    mockRequest.verify();
                    assert.equal(triggeredCampaign.getId(), '00005472656d6f7220694f53');
                });
            });
        });
    });
    it('test previous campaign', () => {
        const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
        const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
        let previousCampaign = campaignManager.getPreviousPlacementId();
        assert.equal(previousCampaign, undefined);
        campaignManager.setPreviousPlacementId('defaultPlacement');
        previousCampaign = campaignManager.getPreviousPlacementId();
        assert.equal(previousCampaign, 'defaultPlacement');
    });
    describe('the organizationId-property', () => {
        let requestData = '{}';
        let assetManager;
        let campaignManager;
        beforeEach(() => {
            sinon.stub(request, 'post').callsFake((url, data = '', headers = [], options) => {
                requestData = data;
                return Promise.resolve();
            });
            assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
        });
        it('should be in request body when defined in config response', () => {
            return campaignManager.request().then(() => {
                const requestBody = JSON.parse(requestData);
                assert.equal(5552368, requestBody.organizationId, 'organizationId should be in ad request body when it was defined in the config response');
            });
        });
        it('should not be in request body when not defined in config response', () => {
            sinon.stub(coreConfig, 'getOrganizationId').returns(undefined);
            return campaignManager.request().then(() => {
                const requestBody = JSON.parse(requestData);
                assert.isUndefined(requestBody.organizationId, 'organizationId should NOT be in ad request body when it was NOT defined in the config response');
            });
        });
    });
    describe('auction v5', () => {
        let assetManager;
        let campaignManager;
        let mockRequest;
        const ConfigurationAuctionPlcJson = ConfigurationAuctionPlc;
        beforeEach(() => {
            sinon.stub(RequestManager, 'getAuctionProtocol').returns(AuctionProtocol.V5);
            contentTypeHandlerManager.addHandler(CometCampaignParser.ContentType, { parser: new CometCampaignParser(core), factory: new PerformanceAdUnitFactory(adUnitParametersFactory) });
            assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            campaignManager = new LegacyCampaignManager(platform, core, CoreConfigurationParser.parse(ConfigurationAuctionPlcJson), AdsConfigurationParser.parse(ConfigurationAuctionPlcJson), assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            mockRequest = sinon.mock(request);
        });
        it('should handle auction v5 ad response', () => {
            let premiumCampaign;
            let premiumTrackingUrls;
            let videoCampaign;
            let videoTrackingUrls;
            let mraidCampaign;
            let mraidTrackingUrls;
            let rewardedCampaign;
            let rewardedTrackingUrls;
            const noFillPlacements = [];
            let triggeredError;
            let triggeredRefreshDelay;
            let triggeredCampaignCount;
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(AuctionV5Response)
            }));
            campaignManager.onCampaign.subscribe((placement, campaign, trackingUrls) => {
                if (placement === 'premium') {
                    premiumCampaign = campaign;
                    premiumTrackingUrls = trackingUrls;
                }
                else if (placement === 'video') {
                    videoCampaign = campaign;
                    videoTrackingUrls = trackingUrls;
                }
                else if (placement === 'mraid') {
                    mraidCampaign = campaign;
                    mraidTrackingUrls = trackingUrls;
                }
                else if (placement === 'rewardedVideoZone') {
                    rewardedCampaign = campaign;
                    rewardedTrackingUrls = trackingUrls;
                }
            });
            campaignManager.onNoFill.subscribe((placement) => {
                noFillPlacements.push(placement);
            });
            campaignManager.onError.subscribe((error) => {
                triggeredError = error;
            });
            campaignManager.onAdPlanReceived.subscribe((refreshDelay, campaignCount) => {
                triggeredRefreshDelay = refreshDelay;
                triggeredCampaignCount = campaignCount;
            });
            return campaignManager.request().then(() => {
                if (triggeredError) {
                    throw triggeredError;
                }
                mockRequest.verify();
                assert.equal(triggeredRefreshDelay, 3600, 'refresh delay was incorrectly calculated, one placement with no fill should have one hour (3600 seconds) delay');
                assert.equal(triggeredCampaignCount, 1, 'incorrect campaign count for ad plan with one comet campaign');
                assert.isDefined(premiumCampaign, 'premium placement did not receive campaign');
                assert.isDefined(videoCampaign, 'video placement did not receive campaign');
                assert.isDefined(rewardedCampaign, 'rewardedVideoZone placement did not receive campaign');
                assert.isDefined(premiumTrackingUrls, 'premium placement did not receive tracking URLs');
                assert.isDefined(videoTrackingUrls, 'video placement did not receive tracking URLs');
                assert.isDefined(rewardedTrackingUrls, 'rewardedVideoZone placement did not receive tracking URLs');
                assert.deepEqual(noFillPlacements, ['mraid'], 'mraid placement did not properly receive no fill event');
                const startEvent = 'start';
                assert.deepEqual(premiumTrackingUrls[startEvent], ['https://tracking.stg.mz.internal.unity3d.com/impression/%ZONE%?data=randomData&test=0', 'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=start&test=0'], 'incorrect premium placement start tracking URLs');
                assert.deepEqual(videoTrackingUrls[startEvent], ['https://tracking.stg.mz.internal.unity3d.com/impression/%ZONE%?data=randomData&test=2', 'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=start&test=2'], 'incorrect video placement start tracking URLs');
                assert.deepEqual(rewardedTrackingUrls[startEvent], ['https://tracking.stg.mz.internal.unity3d.com/impression/%ZONE%?data=randomData&test=1', 'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=start&test=1'], 'incorrect rewardedVideoZone placement start tracking URLs');
                const clickEvent = 'click';
                assert.deepEqual(premiumTrackingUrls[clickEvent], ['https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=click&test=0'], 'incorrect premium placement click tracking URL');
                assert.deepEqual(videoTrackingUrls[clickEvent], ['https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=click&test=2'], 'incorrect video placement click tracking URL');
                assert.deepEqual(rewardedTrackingUrls[clickEvent], ['https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=click&test=1'], 'incorrect rewarded placement click tracking URL');
            });
        });
    });
    describe('loadCampaign', () => {
        let assetManager;
        let campaignManager;
        let mockRequest;
        const ConfigurationAuctionPlcJson = ConfigurationAuctionPlc;
        beforeEach(() => {
            contentTypeHandlerManager.addHandler(CometCampaignParser.ContentType, { parser: new CometCampaignParser(core), factory: new PerformanceAdUnitFactory(adUnitParametersFactory) });
            assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            campaignManager = new LegacyCampaignManager(platform, core, CoreConfigurationParser.parse(ConfigurationAuctionPlcJson), AdsConfigurationParser.parse(ConfigurationAuctionPlcJson), assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
            mockRequest = sinon.mock(request);
            sinon.stub(Diagnostics, 'trigger').callsFake(() => {
                return Promise.resolve({});
            });
        });
        it('should handle a response to a loaded campaign', () => {
            const placement = TestFixtures.getPlacement();
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(LoadedCampaignResponse)
            }));
            sinon.stub(assetManager, 'enableCaching');
            return campaignManager.loadCampaign(placement).then((loadedCampaign) => {
                mockRequest.verify();
                sinon.assert.called(assetManager.enableCaching);
                if (loadedCampaign) {
                    assert.isDefined(loadedCampaign.campaign);
                    assert.isTrue(loadedCampaign.campaign.isLoadEnabled(), 'isLoadEnabled was not set to true');
                    assert.isDefined(loadedCampaign.trackingUrls);
                    assert.deepEqual(loadedCampaign.trackingUrls[TrackingEvent.START], ['https://tracking.stg.mz.internal.unity3d.com/impression/%ZONE%?data=randomData&test=0', 'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=start&test=0']);
                }
                else {
                    assert.fail();
                }
            }).catch(() => {
                assert.fail();
            });
        });
        it('should resolve with undefined with an empty media Id', () => {
            const placement = TestFixtures.getPlacement();
            const mediaId = '5be40c5f602f4510ec583881';
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(LoadedCampaignResponse).replace(mediaId, '')
            }));
            sinon.stub(assetManager, 'enableCaching');
            return campaignManager.loadCampaign(placement).then((loadedCampaign) => {
                mockRequest.verify();
                sinon.assert.called(assetManager.enableCaching);
                sinon.assert.calledWith(Diagnostics.trigger, 'load_campaign_response_failure', {});
                assert.isUndefined(loadedCampaign, 'Campaign without mediaId should not exist');
            }).catch(() => {
                assert.fail();
            });
        });
        it('should return undefined without an auction Id', () => {
            const placement = TestFixtures.getPlacement();
            const auctionId = 'd301fd4c-4a9e-48e4-82aa-ad8b07977ca5';
            mockRequest.expects('post').returns(Promise.resolve({
                response: JSON.stringify(LoadedCampaignResponse).replace(auctionId, '')
            }));
            sinon.stub(assetManager, 'enableCaching');
            return campaignManager.loadCampaign(placement).then((loadedCampaign) => {
                mockRequest.verify();
                sinon.assert.called(assetManager.enableCaching);
                sinon.assert.calledWith(Diagnostics.trigger, 'load_campaign_auction_id_missing', {});
                assert.isUndefined(loadedCampaign, 'Response without auction Id should not return a defined value');
            }).catch(() => {
                assert.fail();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGVnYWN5Q2FtcGFpZ25NYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvTGVnYWN5Q2FtcGFpZ25NYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN2RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDeEUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzNFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ25GLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUU3RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFOUMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDNUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXRELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUd4RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFMUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQW1CLE1BQU0sOEJBQThCLENBQUM7QUFHaEcsT0FBTyxFQUFFLFNBQVMsRUFBcUIsTUFBTSwrQkFBK0IsQ0FBQztBQUk3RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxz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