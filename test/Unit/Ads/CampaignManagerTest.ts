import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignal } from 'AdMob/Models/AdMobSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { IAdsApi } from 'Ads/IAds';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { HTML } from 'Ads/Models/Assets/HTML';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { WebViewError } from 'Core/Errors/WebViewError';
import { ICoreApi } from 'Core/ICore';
import { JaegerSpan } from 'Core/Jaeger/JaegerSpan';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { JaegerManager } from 'Core/Managers/JaegerManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { AuctionV5Test } from 'Core/Models/ABGroup';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode, CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import OnCometMraidPlcCampaignJson from 'json/OnCometMraidPlcCampaign.json';
import OnCometVideoPlcCampaignJson from 'json/OnCometVideoPlcCampaign.json';
import OnProgrammaticMraidPlcCampaignJson from 'json/OnProgrammaticMraidPlcCampaign.json';
import OnProgrammaticMraidPlcCampaignEmpty from 'json/OnProgrammaticMraidPlcCampaignEmpty.json';
import OnProgrammaticMraidPlcCampaignNull from 'json/OnProgrammaticMraidPlcCampaignNull.json';
import OnProgrammaticMraidPlcTwoMedia from 'json/OnProgrammaticMraidPlcTwoMedia.json';
import OnProgrammaticMraidUrlPlcCampaignJson from 'json/OnProgrammaticMraidUrlPlcCampaign.json';
import OnProgrammaticMraidUrlPlcCampaignEmpty from 'json/OnProgrammaticMraidUrlPlcCampaignEmpty.json';
import OnProgrammaticVastPlcCampaignJson from 'json/OnProgrammaticVastPlcCampaign.json';
import OnProgrammaticVastPlcCampaignCustomTracking from 'json/OnProgrammaticVastPlcCampaignCustomTracking.json';
import OnProgrammaticVastPlcCampaignFailing from 'json/OnProgrammaticVastPlcCampaignFailing.json';
import OnProgrammaticVastPlcCampaignIncorrect from 'json/OnProgrammaticVastPlcCampaignIncorrect.json';
import OnProgrammaticVastPlcCampaignIncorrectWrapped from 'json/OnProgrammaticVastPlcCampaignIncorrectWrapped.json';
import OnProgrammaticVastPlcCampaignInsideOutsideJson from 'json/OnProgrammaticVastPlcCampaignInsideOutside.json';
import OnProgrammaticVastPlcCampaignMaxDepth from 'json/OnProgrammaticVastPlcCampaignMaxDepth.json';
import OnProgrammaticVastPlcCampaignNoData from 'json/OnProgrammaticVastPlcCampaignNoData.json';
import OnProgrammaticVastPlcCampaignNoImpression from 'json/OnProgrammaticVastPlcCampaignNoImpression.json';
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
import { VastParser } from 'VAST/Utilities/VastParser';
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
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';
import { VPAIDAdUnitFactory } from 'VPAID/AdUnits/VPAIDAdUnitFactory';

describe('CampaignManager', () => {
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let storageBridge: StorageBridge;
    let wakeUpManager: WakeUpManager;
    let request: RequestManager;
    let vastParser: VastParser;
    let warningSpy: sinon.SinonSpy;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
    let metaDataManager: MetaDataManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let sessionManager: SessionManager;
    let focusManager: FocusManager;
    let adMobSignalFactory: AdMobSignalFactory;
    let cacheBookkeeping: CacheBookkeepingManager;
    let jaegerManager: JaegerManager;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let placementManager: PlacementManager;
    let backupCampaignManager: BackupCampaignManager;
    let contentTypeHandlerManager: ContentTypeHandlerManager;

    const onShowTrackingUrls: ICampaignTrackingUrls = {
        'start': [
            'www.testyboy.com',
            'www.scottwise.com'
        ]
    };

    beforeEach(() => {
        coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
        adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));

        clientInfo = TestFixtures.getClientInfo();
        vastParser = TestFixtures.getVastParser();
        warningSpy = sinon.spy();
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);

        storageBridge = new StorageBridge(core);
        cacheBookkeeping = new CacheBookkeepingManager(core);
        focusManager = new FocusManager(platform, core);
        wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        deviceInfo = new AndroidDeviceInfo(core);
        metaDataManager = new MetaDataManager(core);
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        sessionManager = new SessionManager(core, request, storageBridge);
        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        jaegerManager = sinon.createStubInstance(JaegerManager);
        jaegerManager.isJaegerTracingEnabled = sinon.stub().returns(false);
        jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan('test'));
        (<sinon.SinonStub>adMobSignalFactory.getAdRequestSignal).returns(Promise.resolve(new AdMobSignal()));
        (<sinon.SinonStub>adMobSignalFactory.getOptionalSignal).returns(Promise.resolve(new AdMobOptionalSignal()));
        placementManager = sinon.createStubInstance(PlacementManager);
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        backupCampaignManager = new BackupCampaignManager(core, storageBridge, coreConfig, deviceInfo);
        contentTypeHandlerManager = new ContentTypeHandlerManager();
    });

    describe('on VAST campaign', () => {
        it('should trigger onCampaign after requesting a valid vast placement', () => {

            // given a valid VAST placement
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: OnProgrammaticVastPlcCampaignJson
            }));

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(), factory: new VastAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredCampaign: Campaign;
            let triggeredError: any;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: Campaign) => {
                triggeredCampaign = campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });

            // when the campaign manager requests the placement
            return campaignManager.request().then(() => {
                if(triggeredError) {
                    throw triggeredError;
                }

                // then the onVastCampaign observable is triggered with the correct campaign data
                mockRequest.verify();
                assert.equal((<VastCampaign>triggeredCampaign).getVideo().getUrl(), 'https://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
            });
        });

        it('should have data from inside and outside the wrapper for a wrapped VAST', (done) => {

            // given a valid wrapped VAST placement that points at a valid VAST with an inline ad
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: OnProgrammaticVastPlcCampaignInsideOutsideJson
            }));
            mockRequest.expects('get').withArgs('http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml', [], {retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false}).returns(Promise.resolve({
                response: VastInlineLinear
            }));

            vastParser.setMaxWrapperDepth(1);

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(), factory: new VastAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredCampaign: VastCampaign;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: Campaign) => {
                if (!triggeredCampaign && campaign) {
                    triggeredCampaign = <VastCampaign>campaign;
                    // then the onVastCampaign observable is triggered with the correct campaign data
                    mockRequest.verify();

                    assert.equal(triggeredCampaign.getVideo().getUrl(), 'http://cdnp.tremormedia.com/video/acudeo/Carrot_400x300_500kb.mp4');

                    assert.deepEqual(triggeredCampaign.getVast().getAd()!.getErrorURLTemplates(), [
                        'http://myErrorURL/error',
                        'http://myErrorURL/wrapper/error'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getImpressionUrls(), [
                        'http://myTrackingURL/impression',
                        'http://myTrackingURL/wrapper/impression'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('creativeView'), [
                        'http://myTrackingURL/creativeView',
                        'http://myTrackingURL/wrapper/creativeView'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('start'), [
                        'http://myTrackingURL/start',
                        'http://myTrackingURL/wrapper/start'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('firstQuartile'), [
                        'http://myTrackingURL/firstQuartile',
                        'http://myTrackingURL/wrapper/firstQuartile'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('midpoint'), [
                        'http://myTrackingURL/midpoint',
                        'http://myTrackingURL/wrapper/midpoint'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('thirdQuartile'), [
                        'http://myTrackingURL/thirdQuartile',
                        'http://myTrackingURL/wrapper/thirdQuartile'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('complete'), [
                        'http://myTrackingURL/complete',
                        'http://myTrackingURL/wrapper/complete'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('mute'), [
                        'http://myTrackingURL/wrapper/mute'
                    ]);
                    assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('unmute'), [
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

        it('should have data from both wrappers and the final wrapped vast for vast with 2 levels of wrapping', (done) => {

            // given a valid wrapped VAST placement that points at a valid VAST with an inline ad
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: OnProgrammaticVastPlcCampaignWrapped
            }));
            mockRequest.expects('get').withArgs(Url.encodeUrlWithQueryParams('https://x.vindicosuite.com/?l=454826&t=x&rnd=[Cachebuster_If_Supported_In_Console]'), [], {retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false}).returns(Promise.resolve({
                response: WrappedVast1
            }));
            mockRequest.expects('get').withArgs(Url.encodeUrlWithQueryParams('https://ads.pointroll.com/PortalServe/?pid=2810492V01420160323193924&pos=o&secure=1&r=1466475479'), [], {retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false}).returns(Promise.resolve({
                response: WrappedVast2
            }));

            vastParser.setMaxWrapperDepth(2);

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(), factory: new VastAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredCampaign: VastCampaign;
            campaignManager.onError.subscribe((error) => {
                assert.equal(1, 2, (<{ message: string }>error).message);
            });
            campaignManager.onCampaign.subscribe((placementId: string, campaign: Campaign) => {
                triggeredCampaign = <VastCampaign>campaign;
                // then the onVastCampaign observable is triggered with the correct campaign data
                mockRequest.verify();

                assert.equal(triggeredCampaign.getVideo().getUrl(), 'https://speed-s.pointroll.com/pointroll/media/asset/Nissan/221746/Nissan_FY16_FTC_GM_Generic_Instream_1280x720_400kbps_15secs.mp4');
                assert.deepEqual(triggeredCampaign.getVast().getAd()!.getErrorURLTemplates(), [
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
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('creativeView'), [
                    'https://x.vindicosuite.com/event/?e=11;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=95458;cr=2686135030;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href='
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('start'), [
                    'https://x.vindicosuite.com/event/?e=12;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=91256;cr=2539347201;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=11;',
                    'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=start&vastcrtype=linear&crid=67817785'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('firstQuartile'), [
                    'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-201&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                    'https://x.vindicosuite.com/event/?e=13;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=52835;cr=3022585079;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=960584;',
                    'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=firstQuartile&vastcrtype=linear&crid=67817785'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('midpoint'), [
                    'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-202&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                    'https://x.vindicosuite.com/event/?e=14;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=23819;cr=99195890;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=18;',
                    'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=midpoint&vastcrtype=linear&crid=67817785'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('thirdQuartile'), [
                    'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-203&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                    'https://x.vindicosuite.com/event/?e=15;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=9092;cr=1110035921;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=960585;',
                    'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=thirdQuartile&vastcrtype=linear&crid=67817785'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('complete'), [
                    'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-204&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                    'https://x.vindicosuite.com/event/?e=16;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=93062;cr=3378288114;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=13;',
                    'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=complete&vastcrtype=linear&crid=67817785'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('mute'), [
                    'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1004&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                    'https://x.vindicosuite.com/event/?e=17;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=45513;cr=483982038;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                    'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=16;'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('unmute'), [
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
                done();
            });

            // when the campaign manager requests the placement
            campaignManager.request();
        });

        it('should fail when max depth is exceeded', (done) => {

            // given a valid wrapped VAST placement that points at a valid VAST with a wrapper
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: OnProgrammaticVastPlcCampaignMaxDepth
            }));

            const nonWrappedVAST = NonWrappedVast;
            const wrappedVAST = WrappedVast3;

            // create intermediate wrappers
            for(let i = 0; i < 8; i++) {
                mockRequest.expects('get').returns(Promise.resolve({
                    response: wrappedVAST
                }));
            }

            // return last non wrapped VAST
            mockRequest.expects('get').returns(Promise.resolve({
                response: nonWrappedVAST
            }));

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(), factory: new VastAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            campaignManager.onError.subscribe((err) => {
                assert.equal((<{ message: string }>err).message, VastErrorInfo.errorMap[VastErrorCode.WRAPPER_DEPTH_LIMIT_REACHED]);
                done();
            });

            // when the campaign manager requests the placement
            campaignManager.request();
        });

        const verifyErrorForResponse = (response: any, expectedErrorMessage: string): Promise<void> => {
            // given a VAST placement with invalid XML
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(), factory: new VastAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredError: any;
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

        const verifyErrorForWrappedResponse = (response: any, wrappedUrl: string, wrappedResponse: Promise<any>, expectedErrorMessage: string, errorURL?: string, done?: () => void): void => {
            // given a VAST placement that wraps another VAST
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));
            mockRequest.expects('get').withArgs(wrappedUrl, [], {retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false}).returns(wrappedResponse);
            if(errorURL) {
                mockRequest.expects('get').withArgs(errorURL, []).returns(Promise.resolve());
            }

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(), factory: new VastAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredError: WebViewError | Error;
            const verify = () => {
                // then the onError observable is triggered with an appropriate error
                mockRequest.verify();
                if(triggeredError instanceof Error) {
                    assert.equal(triggeredError.message, expectedErrorMessage);
                } else if (triggeredError instanceof WebViewError) {
                    assert.equal(triggeredError.message, expectedErrorMessage);
                } else {
                    assert.equal(triggeredError, expectedErrorMessage);
                }
            };

            campaignManager.onError.subscribe((error) => {
                triggeredError = <WebViewError | Error>error;
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
                    response: OnProgrammaticVastPlcCampaignNoVideo
                };
                return verifyErrorForResponse(response, VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_URL_NOT_FOUND]);
            });

            it('should trigger onError after requesting a wrapped vast placement without a video url', (done) => {
                const response = {
                    response: OnProgrammaticVastPlcCampaignNoVideoWrapped
                };
                const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
                const wrapperErrorUrl = 'http://myErrorURL/error';
                const wrappedResponse = Promise.resolve({
                    response: NoVideoWrappedVast
                });
                return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_URL_NOT_FOUND], wrapperErrorUrl, done);
            });

            it('should trigger onError after requesting a vast placement with incorrect document element node name', () => {
                const response = {
                    response: OnProgrammaticVastPlcCampaignIncorrect
                };
                return verifyErrorForResponse(response, 'VAST xml data is missing');
            });

            it('should trigger onError after requesting a wrapped vast placement with incorrect document element node name', () => {
                const response = {
                    response: OnProgrammaticVastPlcCampaignIncorrectWrapped
                };
                const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
                const wrappedResponse = Promise.resolve({
                    response: IncorrectWrappedVast
                });

                return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, 'VAST xml is invalid - document element must be VAST but was foo');
            });

            it('should trigger onError after requesting a vast placement with no vast data', () => {
                const response = {
                    response: OnProgrammaticVastPlcCampaignNoData
                };
                return verifyErrorForResponse(response, VastErrorInfo.errorMap[VastErrorCode.XML_PARSER_ERROR]);
            });

            it('should trigger onError after requesting a wrapped vast placement when a failure occurred requesting the wrapped VAST', () => {
                const response = {
                    response: OnProgrammaticVastPlcCampaignFailing
                };
                const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
                const wrappedResponse = Promise.reject(VastErrorInfo.errorMap[VastErrorCode.WRAPPER_GENERAL_ERROR]);

                return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, VastErrorInfo.errorMap[VastErrorCode.WRAPPER_GENERAL_ERROR]);
            });

            it('should trigger onError after requesting a vast placement with null vast data', () => {
                // given a VAST placement with null vast
                const response = {
                    response: OnProgrammaticVastPlcCampaignNullData
                };

                const mockRequest = sinon.mock(request);
                mockRequest.expects('post').returns(Promise.resolve(response));

                const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
                const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
                let noFillTriggered = false;
                let triggeredError: any;
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
                    response: OnProgrammaticVastPlcCampaignTooMuchWrapping
                };

                // when the parser's max wrapper depth is set to 0 to disallow wrapping
                ProgrammaticVastParser.setVastParserMaxDepth(0);

                // then we should get an error because there was no video URL,
                // because the video url would have been in the wrapped xml
                return verifyErrorForResponse(response, VastErrorInfo.errorMap[VastErrorCode.WRAPPER_DEPTH_LIMIT_REACHED]);
            });
        });

        const verifyCampaignForResponse = (response: {response: any}) => {
            // given a valid VAST placement
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(), factory: new VastAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredCampaign: VastCampaign;
            let triggeredError: any;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: Campaign) => {
                triggeredCampaign = <VastCampaign>campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });

            // when the campaign manager requests the placement
            return campaignManager.request().then(() => {
                if(triggeredError) {
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
                response: OnProgrammaticVastPlcCampaignCustomTracking
            }));

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(), factory: new VastAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredCampaign: VastCampaign;
            let triggeredError: any;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: Campaign) => {
                triggeredCampaign = <VastCampaign>campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });

            // when the campaign manager requests the placement
            return campaignManager.request().then(() => {
                if(triggeredError) {
                    throw triggeredError;
                }

                // then the onVastCampaign observable is triggered with the correct campaign data
                mockRequest.verify();
                triggeredCampaign.setTrackingUrls(onShowTrackingUrls);
                assert.equal(triggeredCampaign.getVideo().getUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('start'), [
                    'http://customTrackingUrl/start',
                    'http://customTrackingUrl/start2',
                    'http://customTrackingUrl/start3/%ZONE%/blah?sdkVersion=?%SDK_VERSION%',
                    'www.testyboy.com',
                    'www.scottwise.com'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('firstQuartile'), [
                    'http://customTrackingUrl/firstQuartile'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('midpoint'), [
                    'http://customTrackingUrl/midpoint'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('thirdQuartile'), [
                    'http://customTrackingUrl/thirdQuartile'
                ]);
                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('complete'), [
                    'http://customTrackingUrl/complete'
                ]);
            });
        });
    });

    describe('on MRAID campaign', () => {
        it('should trigger onMRAIDCampaign after receiving a MRAID campaign inlined', () => {
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: OnProgrammaticMraidUrlPlcCampaignJson
            }));

            const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaignJson);
            const content = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticMraidUrlParser.ContentType, { parser: new ProgrammaticMraidUrlParser(), factory: new MRAIDAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredCampaign: MRAIDCampaign;
            let triggeredError: any;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: Campaign) => {
                triggeredCampaign = <MRAIDCampaign>campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });

            return campaignManager.request().then(() => {
                if(triggeredError) {
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
                if(willExpireAt) {
                    const timeDiff = willExpireAt - (Date.now() + json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].cacheTTL * 1000);
                    assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
                }
            });
        });

        it('should trigger onMRAIDCampaign after receiving a MRAID campaign non-inlined', () => {
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: OnProgrammaticMraidPlcCampaignJson
            }));

            const json = JSON.parse(OnProgrammaticMraidPlcCampaignJson);
            const content = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticMraidParser.ContentType, { parser: new ProgrammaticMraidParser(), factory: new MRAIDAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredCampaign: MRAIDCampaign;
            let triggeredError: any;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: Campaign) => {
                triggeredCampaign = <MRAIDCampaign>campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });

            return campaignManager.request().then(() => {
                if(triggeredError) {
                    throw triggeredError;
                }

                mockRequest.verify();

                assert.equal(triggeredCampaign.getId(), '005472656d6f7220416e6472');
                assert.deepEqual(triggeredCampaign.getOptionalAssets(), []);
                assert.equal(triggeredCampaign.getResource(), content.markup);
                const willExpireAt = triggeredCampaign.getWillExpireAt();
                assert.isDefined(willExpireAt, 'Will expire at should be defined');
                if(willExpireAt) {
                    const timeDiff = willExpireAt - (Date.now() + json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].cacheTTL * 1000);
                    assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
                }
            });
        });

        it('should trigger onError if mraid property is null', (done) => {
            const response = {
                response: OnProgrammaticMraidPlcCampaignNull
            };

            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));

            let doneCalled = false;

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticMraidParser.ContentType, { parser: new ProgrammaticMraidParser(), factory: new MRAIDAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredError: any;
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
                response: OnProgrammaticMraidPlcCampaignEmpty
            };

            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticMraidParser.ContentType, { parser: new ProgrammaticMraidParser(), factory: new MRAIDAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredError: any;

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
                response: OnProgrammaticMraidUrlPlcCampaignEmpty
            };

            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticMraidUrlParser.ContentType, { parser: new ProgrammaticMraidUrlParser(), factory: new MRAIDAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredError: any;

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
                response: OnStaticInterstitialDisplayHtmlCampaign
            }));

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticStaticInterstitialParser.ContentTypeHtml, { parser: new ProgrammaticStaticInterstitialParser(false), factory: new DisplayInterstitialAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredCampaign: DisplayInterstitialCampaign;
            let triggeredError: any;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: Campaign) => {
                triggeredCampaign = <DisplayInterstitialCampaign>campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });

            return campaignManager.request().then(() => {
                if(triggeredError) {
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
                response: OnStaticInterstitialDisplayJsCampaign
            }));

            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager.addHandler(ProgrammaticStaticInterstitialParser.ContentTypeJs, { parser: new ProgrammaticStaticInterstitialParser(true), factory: new DisplayInterstitialAdUnitFactory() });
            const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            let triggeredCampaign: DisplayInterstitialCampaign;
            let triggeredError: any;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: Campaign) => {
                triggeredCampaign = <DisplayInterstitialCampaign>campaign;
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

    describe('on PLC', () => {
        let assetManager;
        let campaignManager: any;
        let triggeredCampaign: Campaign;
        let triggeredError: any;
        let triggeredPlacement: string;
        let mockRequest: any;
        const ConfigurationAuctionPlcJson = JSON.parse(ConfigurationAuctionPlc);

        beforeEach(() => {
            assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            contentTypeHandlerManager = new ContentTypeHandlerManager();
            contentTypeHandlerManager.addHandler(CometCampaignParser.ContentType, { parser: new CometCampaignParser(), factory: new PerformanceAdUnitFactory() });
            contentTypeHandlerManager.addHandler(XPromoCampaignParser.ContentType, { parser: new XPromoCampaignParser(), factory: new XPromoAdUnitFactory() });
            contentTypeHandlerManager.addHandler(ProgrammaticVastParser.ContentType, { parser: new ProgrammaticVastParser(), factory: new VastAdUnitFactory() });
            contentTypeHandlerManager.addHandler(ProgrammaticMraidUrlParser.ContentType, { parser: new ProgrammaticMraidUrlParser(), factory: new MRAIDAdUnitFactory() });
            contentTypeHandlerManager.addHandler(ProgrammaticMraidParser.ContentType, { parser: new ProgrammaticMraidParser(), factory: new MRAIDAdUnitFactory() });
            contentTypeHandlerManager.addHandler(ProgrammaticVPAIDParser.ContentType, { parser: new ProgrammaticVPAIDParser(), factory: new VPAIDAdUnitFactory() });
            campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);

            campaignManager.onCampaign.subscribe((placement: string, campaign: Campaign) => {
                triggeredCampaign = campaign;
                triggeredPlacement = placement;
            });
            campaignManager.onError.subscribe((error: any) => {
                triggeredError = error;
            });
            mockRequest = sinon.mock(request);
        });

        describe('performance campaign', () => {
            it('should process correct Auction comet/performance Campaign content type', () => {
                mockRequest.expects('post').returns(Promise.resolve({
                    response: OnCometVideoPlcCampaignJson
                }));

                return campaignManager.request().then(() => {
                    if(triggeredError) {
                        throw triggeredError;
                    }

                    mockRequest.verify();
                    assert.isTrue(triggeredCampaign instanceof PerformanceCampaign);
                    assert.equal(triggeredPlacement, 'video');
                });
            });

            it('should process correct Auction comet/performance Campaign content type with mraidUrl', () => {
                mockRequest.expects('post').returns(Promise.resolve({
                    response: OnCometMraidPlcCampaignJson
                }));

                return campaignManager.request().then(() => {
                    if(triggeredError) {
                        throw triggeredError;
                    }

                    mockRequest.verify();
                    assert.isTrue(triggeredCampaign instanceof MRAIDCampaign);
                    assert.equal(triggeredPlacement, 'mraid');
                    assert.deepEqual((<MRAIDCampaign>triggeredCampaign).getResourceUrl(), new HTML('https://cdn.unityads.unity3d.com/playables/sma_re2.0.0_ios/index.html', triggeredCampaign.getSession(), 'mraid-test-creative-id'));
                });
            });
        });

        describe('XPromo campaign', () => {
            it('should process correct Auction xpromo/video Campaign content type', () => {
                mockRequest.expects('post').returns(Promise.resolve({
                    response: OnXPromoPlcCampaignJson
                }));

                return campaignManager.request().then(() => {
                    if(triggeredError) {
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
                    response: OnProgrammaticVPAIDPlcCampaignJson
                }));

                return campaignManager.request().then(() => {
                    if(triggeredError) {
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
                    assert.deepEqual((<VPAIDCampaign>triggeredCampaign).getVPAID().getTrackingEventUrls('start'), [
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
                    response: OnProgrammaticVastPlcCampaignJson
                }));

                return campaignManager.request().then(() => {
                    if(triggeredError) {
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
                    assert.equal((<VastCampaign>triggeredCampaign).getVideo().getUrl(), 'https://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
                    assert.deepEqual((<VastCampaign>triggeredCampaign).getVast().getTrackingEventUrls('start'), [
                        'https://ads-brand-postback.unityads.unity3d.com/brands/2000/%ZONE%/impression/common?data=HriweFDQPzT1jnyWbt-UA8UKb9IOsNlB9YIUyM9eE5ujdz4eYZgsoFvzcfOR0945o8vsJZHvyi000XO4SVoOkgxlWcUpHRArDKtM16J5jLAhZkWxULyJ0JywIVC3Tebds1o5ZYQ5_KsbpqCbO-q56Jd3AKgbIlTgIDjATlSFf8AiOl96Y81UkZutA8jx4E2sQTCKg1ar6uXQvuXV6KG4IYdx8Jr5e9ZFvgjy6kxbgbuyuEw2_SKzmBCsj3Q2qOM_YxDzaxd5xa2kJ5H9udVwtLUs8OnndWj-k0f__xj958kx6pBvcCwm-xfQiP8zA0DuMq7IHqGt9uvzuvcSN8XX3klwoaYNjZGcggH_AvNoJMPM2lfBidn6cPGOk9IXNNdvT7s42Ss05RSVVqIm87eGmWWVfoSut_UIMTMes1JtxuSuBKCk3abJdUm1GhdJ8OTF3mOVJ1vKj7M%3D',
                        'https://www.dummy-url.com',
                        'www.testyboy.com',
                        'www.scottwise.com'
                    ]);
                });
            });

            it('should process correct Auction programmatic/mraid-url Campaign content type', () => {
                mockRequest.expects('post').returns(Promise.resolve({
                    response: OnProgrammaticMraidUrlPlcCampaignJson
                }));

                return campaignManager.request().then(() => {
                    if(triggeredError) {
                        throw triggeredError;
                    }

                    mockRequest.verify();
                    assert.isTrue(triggeredCampaign instanceof MRAIDCampaign);
                    assert.equal(triggeredPlacement, 'mraid');
                    assert.equal(triggeredCampaign.getAdType(), 'mraid-url-sample-ad-type');
                    assert.equal(triggeredCampaign.getCreativeId(), 'mraid-url-sample-creative-id');
                    assert.equal(triggeredCampaign.getSeatId(), 901);
                    assert.equal(triggeredCampaign.getCorrelationId(), '0zGg2TfRsBNbqlc7AVdhLAw');
                    assert.deepEqual((<MRAIDCampaign>triggeredCampaign).getResourceUrl(), new HTML('https://localhost', triggeredCampaign.getSession()));
                    assert.deepEqual((<MRAIDCampaign>triggeredCampaign).getDynamicMarkup(), 'var markup = \'dynamic\';');
                    assert.deepEqual((<MRAIDCampaign>triggeredCampaign).getTrackingUrls(), {
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
                    response: OnProgrammaticMraidPlcCampaignJson
                }));

                return campaignManager.request().then(() => {
                    if(triggeredError) {
                        throw triggeredError;
                    }

                    mockRequest.verify();
                    assert.isTrue(triggeredCampaign instanceof MRAIDCampaign);
                    assert.equal(triggeredPlacement, 'mraid');
                    assert.equal(triggeredCampaign.getAdType(), 'mraid-sample-ad-type');
                    assert.equal(triggeredCampaign.getCreativeId(), 'mraid-sample-creative-id');
                    assert.equal(triggeredCampaign.getSeatId(), 902);
                    assert.equal(triggeredCampaign.getCorrelationId(), 'zGg2TfRsBNbqlc7AVdhLAw');
                    assert.deepEqual((<MRAIDCampaign>triggeredCampaign).getResource(), '<div>markup</div>');
                    assert.deepEqual((<MRAIDCampaign>triggeredCampaign).getTrackingUrls(), {impression: ['https://ads-brand-postback.unityads.unity3d.com/brands/2000/%ZONE%/impression/common?data=Kz2J']});
                });
            });

            it('should correct programmatic campaign id for android', () => {
                nativeBridge.getPlatform = () => {
                    return Platform.ANDROID;
                };

                assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
                campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);

                campaignManager.onCampaign.subscribe((placement: string, campaign: Campaign) => {
                    triggeredCampaign = campaign;
                    triggeredPlacement = placement;
                });
                campaignManager.onError.subscribe((error: any) => {
                    triggeredError = error;
                });

                mockRequest.expects('post').returns(Promise.resolve({
                    response: OnProgrammaticMraidPlcCampaignJson
                }));

                return campaignManager.request().then(() => {
                    if(triggeredError) {
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
                core = TestFixtures.getCoreApi(nativeBridge);

                assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
                campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);

                campaignManager.onCampaign.subscribe((placement: string, campaign: Campaign) => {
                    triggeredCampaign = campaign;
                    triggeredPlacement = placement;
                });
                campaignManager.onError.subscribe((error: any) => {
                    triggeredError = error;
                });

                mockRequest.expects('post').returns(Promise.resolve({
                    response: OnProgrammaticMraidPlcCampaignJson
                }));

                return campaignManager.request().then(() => {
                    if(triggeredError) {
                        throw triggeredError;
                    }

                    mockRequest.verify();
                    assert.equal(triggeredCampaign.getId(), '00005472656d6f7220694f53');
                });
            });
        });
    });

    it('test previous campaign', () => {
        const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
        const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
        let previousCampaign = campaignManager.getPreviousPlacementId();

        assert.equal(previousCampaign, undefined);

        campaignManager.setPreviousPlacementId('defaultPlacement');
        previousCampaign = campaignManager.getPreviousPlacementId();

        assert.equal(previousCampaign, 'defaultPlacement');
    });

    describe('the organizationId-property', () => {
        let requestData: string = '{}';
        let assetManager: AssetManager;
        let campaignManager: CampaignManager;

        beforeEach(() => {
            sinon.stub(request, 'post').callsFake((url: string, data: string = '', headers: [string, string][] = [], options?: any) => {
                requestData = data;
                return Promise.resolve();
            });
            assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
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
        let campaignManager: any;
        let mockRequest: any;
        const ConfigurationAuctionPlcJson = JSON.parse(ConfigurationAuctionPlc);

        beforeEach(() => {
            contentTypeHandlerManager.addHandler(CometCampaignParser.ContentType, { parser: new CometCampaignParser(), factory: new PerformanceAdUnitFactory() });
            assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            campaignManager = new CampaignManager(platform, core, CoreConfigurationParser.parse(ConfigurationAuctionPlcJson), AdsConfigurationParser.parse(ConfigurationAuctionPlcJson), assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, jaegerManager, backupCampaignManager);
            mockRequest = sinon.mock(request);
        });

        it('should handle auction v5 ad response', () => {
            let premiumCampaign: Campaign;
            let premiumTrackingUrls: ICampaignTrackingUrls;
            let videoCampaign: Campaign;
            let videoTrackingUrls: ICampaignTrackingUrls;
            let mraidCampaign: Campaign;
            let mraidTrackingUrls: ICampaignTrackingUrls;
            let rewardedCampaign: Campaign;
            let rewardedTrackingUrls: ICampaignTrackingUrls;
            const noFillPlacements: string[] = [];
            let triggeredError: any;
            let triggeredRefreshDelay: number;
            let triggeredCampaignCount: number;

            mockRequest.expects('post').returns(Promise.resolve({
                response: AuctionV5Response
            }));

            sinon.stub(AuctionV5Test, 'isValid').returns(true);

            campaignManager.onCampaign.subscribe((placement: string, campaign: Campaign, trackingUrls: ICampaignTrackingUrls) => {
                if(placement === 'premium') {
                    premiumCampaign = campaign;
                    premiumTrackingUrls = trackingUrls;
                } else if(placement === 'video') {
                    videoCampaign = campaign;
                    videoTrackingUrls = trackingUrls;
                } else if(placement === 'mraid') {
                    mraidCampaign = campaign;
                    mraidTrackingUrls = trackingUrls;
                } else if(placement === 'rewardedVideoZone') {
                    rewardedCampaign = campaign;
                    rewardedTrackingUrls = trackingUrls;
                }
            });

            campaignManager.onNoFill.subscribe((placement: string) => {
                noFillPlacements.push(placement);
            });

            campaignManager.onError.subscribe((error: any) => {
                triggeredError = error;
            });

            campaignManager.onAdPlanReceived.subscribe((refreshDelay: number, campaignCount: number) => {
                triggeredRefreshDelay = refreshDelay;
                triggeredCampaignCount = campaignCount;
            });

            return campaignManager.request().then(() => {
                if(triggeredError) {
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

                const startEvent: string = 'start';
                assert.deepEqual(premiumTrackingUrls[startEvent], ['https://tracking.prd.mz.internal.unity3d.com/impression/%ZONE%?data=randomData&test=0', 'https://tracking.prd.mz.internal.unity3d.com/operative/%ZONE%?eventType=start&test=0'], 'incorrect premium placement start tracking URLs');
                assert.deepEqual(videoTrackingUrls[startEvent], ['https://tracking.prd.mz.internal.unity3d.com/impression/%ZONE%?data=randomData&test=2', 'https://tracking.prd.mz.internal.unity3d.com/operative/%ZONE%?eventType=start&test=2'], 'incorrect video placement start tracking URLs');
                assert.deepEqual(rewardedTrackingUrls[startEvent], ['https://tracking.prd.mz.internal.unity3d.com/impression/%ZONE%?data=randomData&test=1', 'https://tracking.prd.mz.internal.unity3d.com/operative/%ZONE%?eventType=start&test=1'], 'incorrect rewardedVideoZone placement start tracking URLs');

                const clickEvent: string = 'click';
                assert.deepEqual(premiumTrackingUrls[clickEvent], ['https://tracking.prd.mz.internal.unity3d.com/operative/%ZONE%?eventType=click&test=0'], 'incorrect premium placement click tracking URL');
                assert.deepEqual(videoTrackingUrls[clickEvent], ['https://tracking.prd.mz.internal.unity3d.com/operative/%ZONE%?eventType=click&test=2'], 'incorrect video placement click tracking URL');
                assert.deepEqual(rewardedTrackingUrls[clickEvent], ['https://tracking.prd.mz.internal.unity3d.com/operative/%ZONE%?eventType=click&test=1'], 'incorrect rewarded placement click tracking URL');
            });
        });
    });
});
