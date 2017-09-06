import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Request } from 'Utilities/Request';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { VastParser } from 'Utilities/VastParser';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Observable0, Observable1, Observable2, Observable4 } from 'Utilities/Observable';
import { Platform } from 'Constants/Platform';
import { AssetManager } from 'Managers/AssetManager';
import { Cache } from 'Utilities/Cache';
import { CacheMode, Configuration } from 'Models/Configuration';
import { WebViewError } from 'Errors/WebViewError';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { EventManager } from 'Managers/EventManager';
import { SessionManager } from 'Managers/SessionManager';
import { HTML } from 'Models/Assets/HTML';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { StorageType } from 'Native/Api/AndroidDeviceInfo';
import { CampaignManager } from 'Managers/CampaignManager';
import { FocusManager } from 'Managers/FocusManager';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import OnProgrammaticMraidPlcCampaignEmpty from 'json/OnProgrammaticMraidPlcCampaignEmpty.json';
import OnProgrammaticMraidPlcCampaignNull from 'json/OnProgrammaticMraidPlcCampaignNull.json';
import OnProgrammaticMraidUrlPlcCampaignEmpty from 'json/OnProgrammaticMraidUrlPlcCampaignEmpty.json';
import OnProgrammaticMraidUrlPlcCampaignJson from 'json/OnProgrammaticMraidUrlPlcCampaign.json';
import OnProgrammaticMraidPlcCampaignJson from 'json/OnProgrammaticMraidPlcCampaign.json';
import OnCometMraidPlcCampaignJson from 'json/OnCometMraidPlcCampaign.json';
import OnCometVideoPlcCampaignJson from 'json/OnCometVideoPlcCampaign.json';
import VastInlineLinear from 'xml/VastInlineLinear.xml';
import WrappedVast1 from 'xml/WrappedVast1.xml';
import WrappedVast2 from 'xml/WrappedVast2.xml';
import NonWrappedVast from 'xml/NonWrappedVast.xml';
import WrappedVast3 from 'xml/WrappedVast3.xml';
import NoVideoWrappedVast from 'xml/NoVideoWrappedVast.xml';
import OnProgrammaticVastPlcCampaignIncorrectWrapped from 'json/OnProgrammaticVastPlcCampaignIncorrectWrapped.json';
import IncorrectWrappedVast from 'xml/IncorrectWrappedVast.xml';
import OnProgrammaticVastPlcCampaignJson from 'json/OnProgrammaticVastPlcCampaign.json';
import OnProgrammaticVastPlcCampaignInsideOutsideJson from 'json/OnProgrammaticVastPlcCampaignInsideOutside.json';
import OnProgrammaticVastPlcCampaignMaxDepth from 'json/OnProgrammaticVastPlcCampaignMaxDepth.json';
import OnProgrammaticVastPlcCampaignNoVideo from 'json/OnProgrammaticVastPlcCampaignNoVideo.json';
import OnProgrammaticVastPlcCampaignNoVideoWrapped from 'json/OnProgrammaticVastPlcCampaignNoVideoWrapped.json';
import OnProgrammaticVastPlcCampaignWrapped from 'json/OnProgrammaticVastPlcCampaignWrapped.json';
import OnProgrammaticVastPlcCampaignIncorrect from 'json/OnProgrammaticVastPlcCampaignIncorrect.json';
import OnProgrammaticVastPlcCampaignNoData from 'json/OnProgrammaticVastPlcCampaignNoData.json';
import OnProgrammaticVastPlcCampaignNullData from 'json/OnProgrammaticVastPlcCampaignNullData.json';
import OnProgrammaticVastPlcCampaignFailing from 'json/OnProgrammaticVastPlcCampaignFailing.json';
import OnProgrammaticVastPlcCampaignNoImpression from 'json/OnProgrammaticVastPlcCampaignNoImpression.json';
import OnProgrammaticVastPlcCampaignTooMuchWrapping from 'json/OnProgrammaticVastPlcCampaignTooMuchWrapping.json';
import OnProgrammaticVastPlcCampaignMissingErrorUrls from 'json/OnProgrammaticVastPlcCampaignMissingErrorUrls.json';
import OnProgrammaticVastPlcCampaignAdLevelErrorUrls from 'json/OnProgrammaticVastPlcCampaignAdLevelErrorUrls.json';
import OnProgrammaticVastPlcCampaignCustomTracking from 'json/OnProgrammaticVastPlcCampaignCustomTracking.json';

describe('CampaignManager', () => {
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let nativeBridge: NativeBridge;
    let wakeUpManager: WakeUpManager;
    let request: Request;
    let vastParser: VastParser;
    let warningSpy: sinon.SinonSpy;
    let configuration: Configuration;
    let metaDataManager: MetaDataManager;
    let eventManager: EventManager;
    let sessionManager: SessionManager;
    let focusManager: FocusManager;

    beforeEach(() => {
        configuration = new Configuration(JSON.parse(ConfigurationAuctionPlc));

        clientInfo = TestFixtures.getClientInfo();
        vastParser = TestFixtures.getVastParser();
        warningSpy = sinon.spy();
        nativeBridge = <NativeBridge><any>{
            Storage: {
                get: function(storageType: number, key: string) {
                    return Promise.resolve('123');
                },
                set: () => {
                    return Promise.resolve();
                },
                write: () => {
                    return Promise.resolve();
                },
                getKeys: sinon.stub().callsFake((type: StorageType, key: string, recursive: boolean) => {
                    if (key && key === 'cache.campaigns') {
                        return Promise.resolve(['12345', '67890']);
                    }
                    return Promise.resolve([]);
                }),
                onSet: new Observable2()
            },
            Request: {
                onComplete: {
                    subscribe: sinon.spy()
                },
                onFailed: {
                    subscribe: sinon.spy()
                }
            },
            Cache: {
                setProgressInterval: sinon.spy(),
                onDownloadStarted: new Observable0(),
                onDownloadProgress: new Observable0(),
                onDownloadEnd: new Observable0(),
                onDownloadStopped: new Observable0(),
                onDownloadError: new Observable0(),
            },
            Sdk: {
                logWarning: warningSpy,
                logInfo: sinon.spy(),
                logDebug: sinon.spy()
            },
            Connectivity: {
                onConnected: new Observable2()
            },
            Broadcast: {
                onBroadcastAction: new Observable4()
            },
            Notification: {
                onNotification: new Observable2()
            },
            DeviceInfo: {
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
                Ios: {
                    getScreenScale: sinon.stub().returns(Promise.resolve(2)),
                    isSimulator: sinon.stub().returns(Promise.resolve(true)),
                    getTotalSpace: sinon.stub().returns(Promise.resolve(1024)),
                    getDeviceVolume: sinon.stub().returns(Promise.resolve(0.5)),
                    getFreeSpace: sinon.stub().returns(Promise.resolve(16)),
                    getStatusBarHeight: sinon.stub().returns(Promise.resolve(40)),
                },
                Android: {
                    getAndroidId: sinon.stub().returns(Promise.resolve('17')),
                    getApiLevel: sinon.stub().returns(Promise.resolve(16)),
                    getManufacturer: sinon.stub().returns(Promise.resolve('N')),
                    getScreenDensity: sinon.stub().returns(Promise.resolve(2)),
                    getScreenLayout: sinon.stub().returns(Promise.resolve(1)),
                    getTotalSpace: sinon.stub().returns(Promise.resolve(2048)),
                    getDeviceVolume: sinon.stub().returns(Promise.resolve(0.5)),
                    getFreeSpace: sinon.stub().returns(Promise.resolve(16)),
                    isAppInstalled: sinon.stub().returns(Promise.resolve(true))
                }
            },
            Lifecycle: {
                onActivityResumed: new Observable1(),
                onActivityPaused: new Observable1(),
                onActivityDestroyed: new Observable1()
            },
            getPlatform: () => {
                return Platform.TEST;
            }
        };
        focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        deviceInfo = new DeviceInfo(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        eventManager = new EventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metaDataManager);
    });

    describe('on VAST campaign', () => {
        it('should trigger onCampaign after requesting a valid vast placement', () => {

            // given a valid VAST placement
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: OnProgrammaticVastPlcCampaignJson
            }));

            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
            let triggeredCampaign: VastCampaign;
            let triggeredError: any;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: VastCampaign) => {
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
                assert.equal(triggeredCampaign.getAbGroup(), 99);
                assert.equal(triggeredCampaign.getGamerId(), '57a35671bb58271e002d93c9');
                assert.equal(triggeredCampaign.getVideo().getUrl(), 'https://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
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
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
            let triggeredCampaign: VastCampaign;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: VastCampaign) => {
                if (!triggeredCampaign && campaign) {
                    triggeredCampaign = campaign;
                    // then the onVastCampaign observable is triggered with the correct campaign data
                    mockRequest.verify();

                    assert.equal(triggeredCampaign.getAbGroup(), 99);
                    assert.equal(triggeredCampaign.getGamerId(), '57a35671bb58271e002d93c9');
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
            mockRequest.expects('get').withArgs('https://x.vindicosuite.com/?l=454826&t=x&rnd=[Cachebuster_If_Supported_In_Console]', [], {retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false}).returns(Promise.resolve({
                response: WrappedVast1
            }));
            mockRequest.expects('get').withArgs('https://ads.pointroll.com/PortalServe/?pid=2810492V01420160323193924&pos=o&secure=1&r=1466475479', [], {retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false}).returns(Promise.resolve({
                response: WrappedVast2
            }));

            vastParser.setMaxWrapperDepth(2);
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
            let triggeredCampaign: VastCampaign;
            campaignManager.onError.subscribe((error) => {
                assert.equal(1, 2, error.message);
            });
            campaignManager.onCampaign.subscribe((placementId: string, campaign: VastCampaign) => {
                triggeredCampaign = campaign;
                // then the onVastCampaign observable is triggered with the correct campaign data
                mockRequest.verify();

                assert.equal(triggeredCampaign.getAbGroup(), 99);
                assert.equal(triggeredCampaign.getGamerId(), '57a35671bb58271e002d93c9');
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

            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
            campaignManager.onError.subscribe((err: Error) => {
                assert.equal(err.message, 'VAST wrapper depth exceeded');
                done();
            });

            // when the campaign manager requests the placement
            campaignManager.request();
        });

        const verifyErrorForResponse = (response: any, expectedErrorMessage: string): Promise<void> => {
            // given a VAST placement with invalid XML
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));

            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
            let triggeredError: Error;
            campaignManager.onError.subscribe((error: Error) => {
                triggeredError = error;
            });

            // when the campaign manager requests the placement
            return campaignManager.request().then(() => {
                // then the onError observable is triggered with an appropriate error
                mockRequest.verify();
                assert.equal(triggeredError.message, expectedErrorMessage);
            });
        };

        const verifyErrorForWrappedResponse = (response: any, wrappedUrl: string, wrappedResponse: Promise<any>, expectedErrorMessage: string, done?: () => void): void => {
            // given a VAST placement that wraps another VAST
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));
            mockRequest.expects('get').withArgs(wrappedUrl, [], {retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false}).returns(wrappedResponse);

            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
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

            campaignManager.onError.subscribe((error: Error) => {
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
                    response: OnProgrammaticVastPlcCampaignNoVideo
                };
                return verifyErrorForResponse(response, 'No video URL found for VAST');
            });

            it('should trigger onError after requesting a wrapped vast placement without a video url', (done) => {
                const response = {
                    response: OnProgrammaticVastPlcCampaignNoVideoWrapped
                };
                const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
                const wrappedResponse = Promise.resolve({
                    response: NoVideoWrappedVast
                });
                return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, 'No video URL found for VAST', done);
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
                return verifyErrorForResponse(response, 'VAST xml data is missing');
            });

            it('should trigger onError after requesting a wrapped vast placement when a failure occurred requesting the wrapped VAST', () => {
                const response = {
                    response: OnProgrammaticVastPlcCampaignFailing
                };
                const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
                const wrappedResponse = Promise.reject('Some kind of request error happened');

                return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, 'Some kind of request error happened');
            });

            it('should trigger onError after requesting a vast placement with null vast data', () => {
                // given a VAST placement with null vast
                const response = {
                    response: OnProgrammaticVastPlcCampaignNullData
                };

                const mockRequest = sinon.mock(request);
                mockRequest.expects('post').returns(Promise.resolve(response));

                const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
                const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
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

            it('should trigger onError after requesting a vast placement without an impression url', () => {
                const response = {
                    response: OnProgrammaticVastPlcCampaignNoImpression
                };
                return verifyErrorForResponse(response, 'Campaign does not have an impression url');
            });

            it('should bail out when max wrapper depth is reached for a wrapped VAST', () => {

                // given a valid VAST response containing a wrapper
                const response = {
                    response: OnProgrammaticVastPlcCampaignTooMuchWrapping
                };

                // when the parser's max wrapper depth is set to 0 to disallow wrapping
                vastParser.setMaxWrapperDepth(0);

                // then we should get an error because there was no video URL,
                // because the video url would have been in the wrapped xml
                return verifyErrorForResponse(response, 'VAST wrapper depth exceeded');
            });
        });

        const verifyCampaignForResponse = (response: {response: any}) => {
            // given a valid VAST placement
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));

            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
            let triggeredCampaign: VastCampaign;
            let triggeredError: any;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: VastCampaign) => {
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
                assert.equal(triggeredCampaign.getAbGroup(), 99);
                assert.equal(triggeredCampaign.getGamerId(), '57a35671bb58271e002d93c9');
                assert.equal(triggeredCampaign.getVideo().getUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
            });
        };

        describe('VAST warnings', () => {
            it('should warn about missing error urls', () => {
                // given a VAST response that has no error URLs
                const response = {
                    response: OnProgrammaticVastPlcCampaignMissingErrorUrls
                };

                // when the campaign manager requests the placement
                return verifyCampaignForResponse(response).then(() => {
                    // then the SDK's logWarning function is called with an appropriate message
                    assert.isTrue(warningSpy.calledWith(`Campaign does not have an error url for game id ${clientInfo.getGameId()}`));
                });
            });

            it('should not warn about missing error urls if error url exists at ad level', () => {
                // given a VAST response that an error URL in the ad
                const response = {
                    response: OnProgrammaticVastPlcCampaignAdLevelErrorUrls
                };

                // when the campaign manager requests the placement
                return verifyCampaignForResponse(response).then(() => {

                    // then the SDK's logWarning function is called with an appropriate message
                    assert.equal(warningSpy.callCount, 0);
                });
            });
        });

        it('should process custom tracking urls', () => {
            // given a valid VAST placement
            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve({
                response: OnProgrammaticVastPlcCampaignCustomTracking
            }));

            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
            let triggeredCampaign: VastCampaign;
            let triggeredError: any;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: VastCampaign) => {
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
                assert.equal(triggeredCampaign.getAbGroup(), 99);
                assert.equal(triggeredCampaign.getGamerId(), '57a35671bb58271e002d93c9');
                assert.equal(triggeredCampaign.getVideo().getUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');

                assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('start'), [
                    'http://customTrackingUrl/start',
                    'http://customTrackingUrl/start2',
                    "http://customTrackingUrl/start3/%ZONE%/blah?sdkVersion=?%SDK_VERSION%"
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
            const asset = new HTML(content.inlinedUrl);
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
            let triggeredCampaign: MRAIDCampaign;
            let triggeredError: any;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: MRAIDCampaign) => {
                triggeredCampaign = campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });

            return campaignManager.request().then(() => {
                if(triggeredError) {
                    throw triggeredError;
                }

                mockRequest.verify();

                assert.equal(triggeredCampaign.getId(), 'UNKNOWN');
                assert.equal(triggeredCampaign.getAbGroup(), configuration.getAbGroup());
                assert.equal(triggeredCampaign.getGamerId(), configuration.getGamerId());
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
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
            let triggeredCampaign: MRAIDCampaign;
            let triggeredError: any;
            campaignManager.onCampaign.subscribe((placementId: string, campaign: MRAIDCampaign) => {
                triggeredCampaign = campaign;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });

            return campaignManager.request().then(() => {
                if(triggeredError) {
                    throw triggeredError;
                }

                mockRequest.verify();

                assert.equal(triggeredCampaign.getId(), 'UNKNOWN');
                assert.equal(triggeredCampaign.getAbGroup(), configuration.getAbGroup());
                assert.equal(triggeredCampaign.getGamerId(), configuration.getGamerId());
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
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
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

            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
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

            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
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

    describe('on PLC', () => {
        let assetManager;
        let campaignManager: any;
        let triggeredCampaign: Campaign;
        let triggeredError: any;
        let triggeredPlacement: string;
        let mockRequest: any;
        const ConfigurationAuctionPlcJson = JSON.parse(ConfigurationAuctionPlc);

        beforeEach(() => {
            assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            campaignManager = new CampaignManager(nativeBridge, new Configuration(ConfigurationAuctionPlcJson), assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);

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
                    assert.equal(triggeredCampaign.getGamerId(), '57a35671bb58271e002d93c9');
                    assert.equal(triggeredCampaign.getAbGroup(), 99);
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
                    assert.equal(triggeredCampaign.getGamerId(), '57a35671bb58271e002d93c9');
                    assert.equal(triggeredCampaign.getAbGroup(), 99);
                    assert.deepEqual((<MRAIDCampaign>triggeredCampaign).getResourceUrl(), new HTML('https://cdn.unityads.unity3d.com/playables/sma_re2.0.0_ios/index.html'));
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
                    assert.isTrue(triggeredCampaign instanceof VastCampaign);
                    assert.equal(triggeredPlacement, 'video');
                    assert.equal(triggeredCampaign.getGamerId(), '57a35671bb58271e002d93c9');
                    assert.equal(triggeredCampaign.getAbGroup(), 99);
                    assert.equal(triggeredCampaign.getAdType(), 'vast-sample-ad-type');
                    assert.equal(triggeredCampaign.getCreativeId(), 'vast-sample-creative-id');
                    assert.equal(triggeredCampaign.getSeatId(), 900);
                    assert.equal(triggeredCampaign.getCorrelationId(), 'zzzz');
                    assert.equal((<VastCampaign>triggeredCampaign).getVideo().getUrl(), 'https://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
                    assert.deepEqual((<VastCampaign>triggeredCampaign).getVast().getTrackingEventUrls('start'), [
                        "https://ads-brand-postback.unityads.unity3d.com/brands/2000/%ZONE%/impression/common?data=HriweFDQPzT1jnyWbt-UA8UKb9IOsNlB9YIUyM9eE5ujdz4eYZgsoFvzcfOR0945o8vsJZHvyi000XO4SVoOkgxlWcUpHRArDKtM16J5jLAhZkWxULyJ0JywIVC3Tebds1o5ZYQ5_KsbpqCbO-q56Jd3AKgbIlTgIDjATlSFf8AiOl96Y81UkZutA8jx4E2sQTCKg1ar6uXQvuXV6KG4IYdx8Jr5e9ZFvgjy6kxbgbuyuEw2_SKzmBCsj3Q2qOM_YxDzaxd5xa2kJ5H9udVwtLUs8OnndWj-k0f__xj958kx6pBvcCwm-xfQiP8zA0DuMq7IHqGt9uvzuvcSN8XX3klwoaYNjZGcggH_AvNoJMPM2lfBidn6cPGOk9IXNNdvT7s42Ss05RSVVqIm87eGmWWVfoSut_UIMTMes1JtxuSuBKCk3abJdUm1GhdJ8OTF3mOVJ1vKj7M%3D",
                        "https://www.dummy-url.com"
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
                    assert.equal(triggeredCampaign.getGamerId(), '57a35671bb58271e002d93c9');
                    assert.equal(triggeredCampaign.getAbGroup(), 99);
                    assert.equal(triggeredCampaign.getAdType(), 'mraid-url-sample-ad-type');
                    assert.equal(triggeredCampaign.getCreativeId(), 'mraid-url-sample-creative-id');
                    assert.equal(triggeredCampaign.getSeatId(), 901);
                    assert.equal(triggeredCampaign.getCorrelationId(), '0zGg2TfRsBNbqlc7AVdhLAw');
                    assert.deepEqual((<MRAIDCampaign>triggeredCampaign).getResourceUrl(), new HTML('https://img.serveroute.com/mini_8ball_fast/inlined.html'));
                    assert.deepEqual((<MRAIDCampaign>triggeredCampaign).getDynamicMarkup(), 'var markup = \'dynamic\';');
                    assert.deepEqual((<MRAIDCampaign>triggeredCampaign).getTrackingEventUrls(), {
                        "impression": [
                            "http://test.impression.com/blah1",
                            "http://test.impression.com/blah2",
                            "http://test.impression.com/%ZONE%/blah?sdkVersion=%SDK_VERSION%"
                        ],
                        "complete": [
                            "http://test.complete.com/complete1"
                        ],
                        "click": [
                            "http://test.complete.com/click1"
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
                    assert.equal(triggeredCampaign.getGamerId(), '57a35671bb58271e002d93c9');
                    assert.equal(triggeredCampaign.getAbGroup(), 99);
                    assert.equal(triggeredCampaign.getAdType(), 'mraid-sample-ad-type');
                    assert.equal(triggeredCampaign.getCreativeId(), 'mraid-sample-creative-id');
                    assert.equal(triggeredCampaign.getSeatId(), 902);
                    assert.equal(triggeredCampaign.getCorrelationId(), 'zGg2TfRsBNbqlc7AVdhLAw');
                    assert.deepEqual((<MRAIDCampaign>triggeredCampaign).getResource(), '<div>markup</div>');
                    assert.deepEqual((<MRAIDCampaign>triggeredCampaign).getTrackingEventUrls(), {impression: ['https://ads-brand-postback.unityads.unity3d.com/brands/2000/%ZONE%/impression/common?data=Kz2J']});
                });
            });

            it('should correct programmatic campaign id for android', () => {
                nativeBridge.getPlatform = () => {
                    return Platform.ANDROID;
                };
                assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
                campaignManager = new CampaignManager(nativeBridge, new Configuration(ConfigurationAuctionPlcJson), assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);

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
                nativeBridge.getPlatform = () => {
                    return Platform.IOS;
                };
                assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
                campaignManager = new CampaignManager(nativeBridge, new Configuration(ConfigurationAuctionPlcJson), assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);

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
        const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
        const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
        let previousCampaign = campaignManager.getPreviousPlacementId();

        assert.equal(previousCampaign, undefined);

        campaignManager.setPreviousPlacementId('defaultPlacement');
        previousCampaign = campaignManager.getPreviousPlacementId();

        assert.equal(previousCampaign, 'defaultPlacement');
    });

    it('should have cachedCampaigns in request body', () => {
        let requestData: string = "{}";
        sinon.stub(request, 'post').callsFake((url: string, data: string = '', headers: Array<[string, string]> = [], options?: any) => {
            requestData = data;
            return Promise.resolve();
        });

        const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
        const campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);

        return campaignManager.request().then(() => {
            const requestBody = JSON.parse(requestData);
            assert.equal(2, requestBody.cachedCampaigns.length, 'Cached campaigns should contain 2 entries');
            assert.equal('12345', requestBody.cachedCampaigns[0], 'Cached campaigns first entry not what was expected');
            assert.equal('67890', requestBody.cachedCampaigns[1], 'Cached campaigns second entry not whas was expected');
        });
    });
});
