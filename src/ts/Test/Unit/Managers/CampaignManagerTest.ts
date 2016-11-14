import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Request } from 'Utilities/Request';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { CampaignManager } from 'Managers/CampaignManager';
import { VastParser } from 'Utilities/VastParser';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Observable2 } from 'Utilities/Observable';
import { Observable4 } from 'Utilities/Observable';
import { Platform } from 'Constants/Platform';

import OnVastCampaignJson from 'json/OnVastCampaign.json';
import InsideOutsideJson from 'json/InsideOutside.json';
import VastInlineLinear from 'xml/VastInlineLinear.xml';
import WrappedVastJson from 'json/WrappedVast.json';
import WrappedVast1 from 'xml/WrappedVast1.xml';
import WrappedVast2 from 'xml/WrappedVast2.xml';
import MaxDepthVastJson from 'json/MaxDepthVast.json';
import NonWrappedVast from 'xml/NonWrappedVast.xml';
import WrappedVast3 from 'xml/WrappedVast3.xml';
import NoVideoVastJson from 'json/NoVideoVast.json';
import NoVideoWrappedVastJson from 'json/NoVideoWrappedVast.json';
import NoVideoWrappedVast from 'xml/NoVideoWrappedVast.xml';
import IncorrectVastJson from 'json/IncorrectVast.json';
import IncorrectWrappedVastJson from 'json/IncorrectWrappedVast.json';
import IncorrectWrappedVast from 'xml/IncorrectWrappedVast.xml';
import FailingVastJson from 'json/FailingVast.json';
import NoImpressionVastJson from 'json/NoImpressionVast.json';
import TooMuchWrappingVastJson from 'json/TooMuchWrappingVast.json';
import MissingErrorUrlsVastJson from 'json/MissingErrorUrlsVast.json';
import AdLevelErrorUrlsVastJson from 'json/AdLevelErrorUrlsVast.json';

describe('CampaignManager', () => {
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let nativeBridge: NativeBridge;
    let request: Request;
    let vastParser: VastParser;
    let warningSpy: sinon.SinonSpy;

    it('should trigger onVastCampaign after requesting a valid vast placement', () => {

        // given a valid VAST placement
        const mockRequest = sinon.mock(request);
        mockRequest.expects('post').returns(Promise.resolve({
            response: OnVastCampaignJson
        }));

        const campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
        let triggeredCampaign: Campaign;
        let triggeredError: any;
        campaignManager.onVastCampaign.subscribe((campaign: Campaign) => {
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
            assert.equal(triggeredCampaign.getAbGroup(), 3);
            assert.equal(triggeredCampaign.getGamerId(), '5712983c481291b16e1be03b');
            assert.equal(triggeredCampaign.getVideoUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
        });
    });

    it('should have data from inside and outside the wrapper for a wrapped VAST', (done) => {

        // given a valid wrapped VAST placement that points at a valid VAST with an inline ad
        const mockRequest = sinon.mock(request);
        mockRequest.expects('post').returns(Promise.resolve({
            response: InsideOutsideJson
        }));
        mockRequest.expects('get').withArgs('http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml', [], {retries: 5, retryDelay: 5000, followRedirects: true, retryWithConnectionEvents: false}).returns(Promise.resolve({
            response: VastInlineLinear
        }));

        vastParser.setMaxWrapperDepth(1);
        const campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
        let triggeredCampaign: VastCampaign;
        campaignManager.onVastCampaign.subscribe((campaign: VastCampaign) => {
            triggeredCampaign = campaign;
            // then the onVastCampaign observable is triggered with the correct campaign data
            mockRequest.verify();
            assert.equal(triggeredCampaign.getAbGroup(), 3);
            assert.equal(triggeredCampaign.getGamerId(), '5712983c481291b16e1be03b');
            assert.equal(triggeredCampaign.getVideoUrl(), 'http://cdnp.tremormedia.com/video/acudeo/Carrot_400x300_500kb.mp4');
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
        });

        // when the campaign manager requests the placement
        campaignManager.request();
    });

    it('should have data from both wrappers and the final wrapped vast for vast with 2 levels of wrapping', (done) => {

        // given a valid wrapped VAST placement that points at a valid VAST with an inline ad
        const mockRequest = sinon.mock(request);
        mockRequest.expects('post').returns(Promise.resolve({
            response: WrappedVastJson
        }));
        mockRequest.expects('get').withArgs('https://x.vindicosuite.com/?l=454826&t=x&rnd=[Cachebuster_If_Supported_In_Console]', [], {retries: 5, retryDelay: 5000, followRedirects: true, retryWithConnectionEvents: false}).returns(Promise.resolve({
            response: WrappedVast1
        }));
        mockRequest.expects('get').withArgs('https://ads.pointroll.com/PortalServe/?pid=2810492V01420160323193924&pos=o&secure=1&r=1466475479', [], {retries: 5, retryDelay: 5000, followRedirects: true, retryWithConnectionEvents: false}).returns(Promise.resolve({
            response: WrappedVast2
        }));

        vastParser.setMaxWrapperDepth(2);
        const campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
        let triggeredCampaign: VastCampaign;
        campaignManager.onVastCampaign.subscribe((campaign: VastCampaign) => {
            triggeredCampaign = campaign;
            // then the onVastCampaign observable is triggered with the correct campaign data
            mockRequest.verify();
            assert.equal(triggeredCampaign.getAbGroup(), 3);
            assert.equal(triggeredCampaign.getGamerId(), '5712983c481291b16e1be03b');
            assert.equal(triggeredCampaign.getVideoUrl(), 'https://speed-s.pointroll.com/pointroll/media/asset/Nissan/221746/Nissan_FY16_FTC_GM_Generic_Instream_1280x720_400kbps_15secs.mp4');
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
            response: MaxDepthVastJson
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

        const campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
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

        const campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
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
        mockRequest.expects('get').withArgs(wrappedUrl, [], {retries: 5, retryDelay: 5000, followRedirects: true, retryWithConnectionEvents: false}).returns(wrappedResponse);

        const campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
        let triggeredError: Error;
        const verify = () => {
            // then the onError observable is triggered with an appropriate error
            mockRequest.verify();
            if (triggeredError instanceof Error) {
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
                response: NoVideoVastJson
            };
            return verifyErrorForResponse(response, 'Campaign does not have a video url');
        });

        it('should trigger onError after requesting a wrapped vast placement without a video url', (done) => {
            const response = {
                response: NoVideoWrappedVastJson
            };
            const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
            const wrappedResponse = Promise.resolve({
                response: NoVideoWrappedVast
            });
            return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, 'Campaign does not have a video url', done);
        });

        it('should trigger onError after requesting a vast placement with incorrect document element node name', () => {
            const response = {
                response: IncorrectVastJson
            };
            return verifyErrorForResponse(response, 'VAST xml data is missing');
        });

        it('should trigger onError after requesting a wrapped vast placement with incorrect document element node name', () => {
            const response = {
                response: IncorrectWrappedVastJson
            };
            const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
            const wrappedResponse = Promise.resolve({
                response: IncorrectWrappedVast
            });

            return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, 'VAST xml is invalid - document element must be VAST but was foo');
        });

        it('should trigger onError after requesting a vast placement with no vast data', () => {
            const response = {
                response: `{
                    "abGroup": 3,
                    "vast": {},
                    "gamerId": "5712983c481291b16e1be03b"
                }`
            };
            return verifyErrorForResponse(response, 'VAST xml data is missing');
        });

        it('should trigger onError after requesting a wrapped vast placement when a failure occurred requesting the wrapped VAST', () => {
            const response = {
                response: FailingVastJson
            };
            const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
            const wrappedResponse = Promise.reject('Some kind of request error happened');

            return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, 'Some kind of request error happened');
        });

        it('should trigger onNoFill after requesting a vast placement with null vast data', () => {
            // given a VAST placement with null vast
            const response = {
                response: `{
                    "abGroup": 3,
                    "vast": null,
                    "gamerId": "5712983c481291b16e1be03b"
                }`
            };

            const mockRequest = sinon.mock(request);
            mockRequest.expects('post').returns(Promise.resolve(response));

            const campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
            let triggeredRetryTime: number;
            let triggeredError: any;
            campaignManager.onNoFill.subscribe((retryTime: number) => {
                triggeredRetryTime = retryTime;
            });
            campaignManager.onError.subscribe(error => {
                triggeredError = error;
            });

            // when the campaign manager requests the placement
            return campaignManager.request().then(() => {
                if(triggeredError) {
                    throw triggeredError;
                }

                // then the onNoFill observable is triggered
                mockRequest.verify();
                assert.equal(triggeredRetryTime, 3600);
            });
        });

        it('should trigger onError after requesting a vast placement without an impression url', () => {
            const response = {
                    response: NoImpressionVastJson
            };
            return verifyErrorForResponse(response, 'Campaign does not have an impression url');
        });

        it('should bail out when max wrapper depth is reached for a wrapped VAST', () => {

            // given a valid VAST response containing a wrapper
            const response = {
                response: TooMuchWrappingVastJson
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

        const campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
        let triggeredCampaign: Campaign;
        let triggeredError: any;
        campaignManager.onVastCampaign.subscribe((campaign: Campaign) => {
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
            assert.equal(triggeredCampaign.getAbGroup(), 3);
            assert.equal(triggeredCampaign.getGamerId(), '5712983c481291b16e1be03b');
            assert.equal(triggeredCampaign.getVideoUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
        });
    };

    describe('VAST warnings', () => {
        it('should warn about missing error urls', () => {
            // given a VAST response that has no error URLs
            const response = {
                    response: MissingErrorUrlsVastJson
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
                response: AdLevelErrorUrlsVastJson
            };

            // when the campaign manager requests the placement
            return verifyCampaignForResponse(response).then(() => {

                // then the SDK's logWarning function is called with an appropriate message
                assert.equal(warningSpy.callCount, 0);
            });
        });
    });

    beforeEach(() => {
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
                getKeys: sinon.stub().returns(Promise.resolve([]))
            },
            Request: {
                onComplete: {
                    subscribe: sinon.spy()
                },
                onFailed: {
                    subscribe: sinon.spy()
                }
            },
            Sdk: {
                logWarning: warningSpy,
                logInfo: sinon.spy()
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
                getNetworkType: sinon.stub().returns(Promise.resolve(0))
            },
            getPlatform: () => {
                return Platform.TEST;
            }
        };
        const wakeUpManager = new WakeUpManager(nativeBridge);
        request = new Request(nativeBridge, wakeUpManager);
        deviceInfo = new DeviceInfo(nativeBridge);
    });

    it('should process custom tracking urls', () => {

        // given a valid VAST placement
        const mockRequest = sinon.mock(request);
        mockRequest.expects('post').returns(Promise.resolve({
            response: `{
                "abGroup": 3,
                "vast": {
                    "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22preroll-1%22%3E%0A%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%3CAdSystem%3E2.0%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%3CAdTitle%3E5748406%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%3CImpression%20id%3D%22blah%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fb.scorecardresearch.com%2Fb%3FC1%3D1%26C2%3D6000003%26C3%3D0000000200500000197000000%26C4%3Dus%26C7%3Dhttp%3A%2F%2Fwww.scanscout.com%26C8%3Dscanscout.com%26C9%3Dhttp%3A%2F%2Fwww.scanscout.com%26C10%3Dxn%26rn%3D-103217130%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A30%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%20id%3D%22scanscout%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fwww.target.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20height%3D%22396%22%20width%3D%22600%22%20bitrate%3D%22496%22%20type%3D%22video%2Fmp4%22%20delivery%3D%22progressive%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fstatic.applifier.com%2Fimpact%2Fvideos%2F104090%2Fe97394713b8efa50%2F1602-30s-v22r3-seven-knights-character-select%2Fm31-1000.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%09%3C%2FCreative%3E%0A%09%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CCompanionAds%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20height%3D%22250%22%20width%3D%22300%22%20id%3D%22555750%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CHTMLResource%3E%3C!%5BCDATA%5B%3CA%20onClick%3D%22var%20i%3D%20new%20Image(1%2C1)%3B%20i.src%3D%27http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D0%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%27%3B%22%20HREF%3D%22http%3A%2F%2Ftarget.com%22%20target%3D%22_blank%22%3E%0A%3CIMG%20SRC%3D%22http%3A%2F%2Fmedia.scanscout.com%2Fads%2Ftarget300x250Companion.jpg%22%20BORDER%3D0%20WIDTH%3D300%20HEIGHT%3D250%20ALT%3D%22Click%20Here%22%3E%0A%3C%2FA%3E%0A%3Cimg%20src%3D%22http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D1%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%22%20height%3D%221%22%20width%3D%221%22%3E%0A%5D%5D%3E%3C%2FHTMLResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FCompanionAds%3E%0A%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%3C%2FInLine%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E",
                    "tracking": {
                        "start":[
                            "http://customTrackingUrl/start",
                            "http://customTrackingUrl/start2",
                            "http://customTrackingUrl/start3"
                        ],
                        "firstQuartile":[
                            "http://customTrackingUrl/firstQuartile"
                        ],
                        "midpoint":[
                            "http://customTrackingUrl/midpoint"
                        ],
                        "thirdQuartile":[
                            "http://customTrackingUrl/thirdQuartile"
                        ],
                        "complete":[
                            "http://customTrackingUrl/complete"
                        ],
                        "click":[
                            "http://customTrackingUrl/click"
                        ],
                        "blah":[],
                        "empty": null
                    }
                },
                "gamerId": "5712983c481291b16e1be03b"
            }`
        }));

        const campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
        let triggeredCampaign: VastCampaign;
        let triggeredError: any;
        campaignManager.onVastCampaign.subscribe((campaign: VastCampaign) => {
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
            assert.equal(triggeredCampaign.getAbGroup(), 3);
            assert.equal(triggeredCampaign.getGamerId(), '5712983c481291b16e1be03b');
            assert.equal(triggeredCampaign.getVideoUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');

            assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('start'), [
                'http://customTrackingUrl/start',
                'http://customTrackingUrl/start2',
                'http://customTrackingUrl/start3'
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
