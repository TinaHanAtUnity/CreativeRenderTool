import * as sinon from 'sinon';

import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import { Campaign } from '../../src/ts/Models/Campaign';
import { VastCampaign } from '../../src/ts/Models/Vast/VastCampaign';
import { ClientInfo } from '../../src/ts/Models/ClientInfo';
import { DeviceInfo } from '../../src/ts/Models/DeviceInfo';
import { Request } from '../../src/ts/Utilities/Request';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { CampaignManager } from '../../src/ts/Managers/CampaignManager';
import { assert } from 'chai';
import { VastParser } from '../../src/ts/Utilities/VastParser';
import { WakeUpManager } from '../../src/ts/Managers/WakeUpManager';
import { Observable2 } from '../../src/ts/Utilities/Observable';
import { Observable4 } from '../../src/ts/Utilities/Observable';
import { Platform } from '../../src/ts/Constants/Platform';

describe('CampaignManager', () => {
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let nativeBridge: NativeBridge;
    let request: Request;
    let vastParser: VastParser;
    let warningSpy;

    it('should trigger onVastCampaign after requesting a valid vast placement', () => {

        // given a valid VAST placement
        let mockRequest = sinon.mock(request);
        mockRequest.expects('post').withArgs(
            'https://adserver.unityads.unity3d.com/games/12345/fill?&platform=android&sdkVersion=2.0.0-alpha2&',
            '{"bundleVersion":"2.0.0-test2","bundleId":"com.unity3d.ads.example"}',
            [],
            {
                retries: 5,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }
        ).returns(Promise.resolve({
            response: `{
                "abGroup": 3,
                "vast": {
                    "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22preroll-1%22%3E%0A%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%3CAdSystem%3E2.0%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%3CAdTitle%3E5748406%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%3CImpression%20id%3D%22blah%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fb.scorecardresearch.com%2Fb%3FC1%3D1%26C2%3D6000003%26C3%3D0000000200500000197000000%26C4%3Dus%26C7%3Dhttp%3A%2F%2Fwww.scanscout.com%26C8%3Dscanscout.com%26C9%3Dhttp%3A%2F%2Fwww.scanscout.com%26C10%3Dxn%26rn%3D-103217130%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A30%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%20id%3D%22scanscout%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fwww.target.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20height%3D%22396%22%20width%3D%22600%22%20bitrate%3D%22496%22%20type%3D%22video%2Fmp4%22%20delivery%3D%22progressive%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fstatic.applifier.com%2Fimpact%2Fvideos%2F104090%2Fe97394713b8efa50%2F1602-30s-v22r3-seven-knights-character-select%2Fm31-1000.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%09%3C%2FCreative%3E%0A%09%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CCompanionAds%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20height%3D%22250%22%20width%3D%22300%22%20id%3D%22555750%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CHTMLResource%3E%3C!%5BCDATA%5B%3CA%20onClick%3D%22var%20i%3D%20new%20Image(1%2C1)%3B%20i.src%3D%27http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D0%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%27%3B%22%20HREF%3D%22http%3A%2F%2Ftarget.com%22%20target%3D%22_blank%22%3E%0A%3CIMG%20SRC%3D%22http%3A%2F%2Fmedia.scanscout.com%2Fads%2Ftarget300x250Companion.jpg%22%20BORDER%3D0%20WIDTH%3D300%20HEIGHT%3D250%20ALT%3D%22Click%20Here%22%3E%0A%3C%2FA%3E%0A%3Cimg%20src%3D%22http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D1%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%22%20height%3D%221%22%20width%3D%221%22%3E%0A%5D%5D%3E%3C%2FHTMLResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FCompanionAds%3E%0A%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%3C%2FInLine%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E",
                    "tracking": {
                        "click": null,
                        "complete": null,
                        "firstQuartile": null,
                        "midpoint": null,
                        "start": [
                            "http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1"
                        ],
                        "thirdQuartile": null
                    }
                },
                "gamerId": "5712983c481291b16e1be03b"
            }`
        }));

        let campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
        let triggeredCampaign: Campaign;
        campaignManager.onVastCampaign.subscribe((campaign: Campaign) => {
            triggeredCampaign = campaign;
        });

        // when the campaign manager requests the placement
        return campaignManager.request().then(() => {

            // then the onVastCampaign observable is triggered with the correct campaign data
            mockRequest.verify();
            assert.equal(triggeredCampaign.getAbGroup(), 3);
            assert.equal(triggeredCampaign.getGamerId(), '5712983c481291b16e1be03b');
            assert.equal(triggeredCampaign.getVideoUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
        });
    });

    it('should have data from inside and outside the wrapper for a wrapped VAST', (done) => {

        // given a valid wrapped VAST placement that points at a valid VAST with an inline ad
        let mockRequest = sinon.mock(request);
        mockRequest.expects('post').withArgs(
            'https://adserver.unityads.unity3d.com/games/12345/fill?&platform=android&sdkVersion=2.0.0-alpha2&',
            '{"bundleVersion":"2.0.0-test2","bundleId":"com.unity3d.ads.example"}',
            [],
            {
                retries: 5,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }
        ).returns(Promise.resolve({
            response: `{
                "abGroup": 3,
                "vast": {
                    "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22602833%22%3E%0A%20%20%3CWrapper%3E%0A%20%20%20%20%3CAdSystem%3EAcudeo%20Compatible%3C%2FAdSystem%3E%0A%20%20%20%20%3CVASTAdTagURI%3Ehttp%3A%2F%2Fdemo.tremormedia.com%2Fproddev%2Fvast%2Fvast_inline_linear.xml%3C%2FVASTAdTagURI%3E%0A%20%20%20%20%3CError%3Ehttp%3A%2F%2FmyErrorURL%2Fwrapper%2Ferror%3C%2FError%3E%0A%20%20%20%20%3CImpression%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fimpression%3C%2FImpression%3E%0A%09%3CCreatives%3E%0A%09%09%3CCreative%20AdID%3D%22602833%22%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22creativeView%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FcreativeView%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22start%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fstart%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22midpoint%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmidpoint%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22firstQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FfirstQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22thirdQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FthirdQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22complete%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fcomplete%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22mute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22unmute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Funmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22pause%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fpause%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22resume%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fresume%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22fullscreen%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Ffullscreen%3C%2FTracking%3E%09%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CVideoClicks%3E%0A%09%09%09%09%09%3CClickTracking%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fclick%3C%2FClickTracking%3E%0A%09%09%09%09%3C%2FVideoClicks%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%20AdID%3D%22602833-NonLinearTracking%22%3E%0A%09%09%09%3CNonLinearAds%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FNonLinearAds%3E%0A%09%09%3C%2FCreative%3E%0A%09%3C%2FCreatives%3E%0A%20%20%3C%2FWrapper%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E%0A",
                    "tracking": {
                        "click": null,
                        "complete": null,
                        "firstQuartile": null,
                        "midpoint": null,
                        "start": [
                            "http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1"
                        ],
                        "thirdQuartile": null
                    }
                },
                "gamerId": "5712983c481291b16e1be03b"
            }`
        }));
        mockRequest.expects('get').withArgs('http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml', [], {retries: 5, retryDelay: 5000, followRedirects: false, retryWithConnectionEvents: false}).returns(Promise.resolve({
            response: `<?xml version="1.0" encoding="UTF-8"?>
                <VAST version="2.0">
                  <Ad id="601364">
                  <InLine>
                    <AdSystem>Acudeo Compatible</AdSystem>
                    <AdTitle>VAST 2.0 Instream Test 1</AdTitle>
                    <Description>VAST 2.0 Instream Test 1</Description>
                    <Error>http://myErrorURL/error</Error>
                    <Impression>http://myTrackingURL/impression</Impression>
                    <Creatives>
                        <Creative AdID="601364">
                            <Linear>
                                <Duration>00:00:30</Duration>
                                <TrackingEvents>
                                    <Tracking event="creativeView">http://myTrackingURL/creativeView</Tracking>
                                    <Tracking event="start">http://myTrackingURL/start</Tracking>
                                    <Tracking event="midpoint">http://myTrackingURL/midpoint</Tracking>
                                    <Tracking event="firstQuartile">http://myTrackingURL/firstQuartile</Tracking>
                                    <Tracking event="thirdQuartile">http://myTrackingURL/thirdQuartile</Tracking>
                                    <Tracking event="complete">http://myTrackingURL/complete</Tracking>
                                </TrackingEvents>
                                <VideoClicks>
                                    <ClickThrough>http://www.tremormedia.com</ClickThrough>
                                    <ClickTracking>http://myTrackingURL/click</ClickTracking>
                                </VideoClicks>
                                <MediaFiles>
                                    <MediaFile delivery="progressive" type="video/x-flv" bitrate="500" width="400" height="300" scalable="true" maintainAspectRatio="true">http://cdnp.tremormedia.com/video/acudeo/Carrot_400x300_500kb.flv</MediaFile>
                                </MediaFiles>
                            </Linear>
                        </Creative>
                        <Creative AdID="601364-Companion">
                            <CompanionAds>
                                <Companion width="300" height="250">
                                    <StaticResource creativeType="image/jpeg">http://demo.tremormedia.com/proddev/vast/Blistex1.jpg</StaticResource>
                                    <TrackingEvents>
                                        <Tracking event="creativeView">http://myTrackingURL/firstCompanionCreativeView</Tracking>
                                    </TrackingEvents>

                                    <CompanionClickThrough>http://www.tremormedia.com</CompanionClickThrough>
                                </Companion>
                                <Companion width="728" height="90">
                                    <StaticResource creativeType="image/jpeg">http://demo.tremormedia.com/proddev/vast/728x90_banner1.jpg</StaticResource>
                                    <CompanionClickThrough>http://www.tremormedia.com</CompanionClickThrough>
                                </Companion>
                            </CompanionAds>
                        </Creative>
                    </Creatives>
                  </InLine>
                  </Ad>
                </VAST>`
        }));

        vastParser.setMaxWrapperDepth(1);
        let campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
        let triggeredCampaign: VastCampaign;
        campaignManager.onVastCampaign.subscribe((campaign: VastCampaign) => {
            triggeredCampaign = campaign;
            // then the onVastCampaign observable is triggered with the correct campaign data
            mockRequest.verify();
            assert.equal(triggeredCampaign.getAbGroup(), 3);
            assert.equal(triggeredCampaign.getGamerId(), '5712983c481291b16e1be03b');
            assert.equal(triggeredCampaign.getVideoUrl(), 'http://cdnp.tremormedia.com/video/acudeo/Carrot_400x300_500kb.flv');
            assert.deepEqual(triggeredCampaign.getVast().getAd().getErrorURLTemplates(), [
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
                'http://myTrackingURL/wrapper/start',
                'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'
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
            assert.equal(triggeredCampaign.getVast().getDuration(), 30);
            done();
        });

        // when the campaign manager requests the placement
        return campaignManager.request();
    });


    it('should have data from both wrappers and the final wrapped vast for vast with 2 levels of wrapping', (done) => {

        // given a valid wrapped VAST placement that points at a valid VAST with an inline ad
        let mockRequest = sinon.mock(request);
        mockRequest.expects('post').returns(Promise.resolve({
            response: `{
                "abGroup": 3,
                "vast": {
                    "data": "%3C%3Fxml%20version=%221.0%22%20encoding=%22UTF-8%22%20standalone=%22no%22%3F%3E%0A%3CVAST%20xmlns:xsi=%22http://www.w3.org/2001/XMLSchema-instance%22%20version=%222.0%22%20xsi:noNamespaceSchemaLocation=%22vast.xsd%22%3E%0A%20%3CAd%20id=%22299598171%22%3E%0A%20%20%3CWrapper%3E%0A%20%20%20%3CAdSystem%3EDBM%3C/AdSystem%3E%0A%20%20%20%3CAdTitle%3EIn-Stream%20Video%3C/AdTitle%3E%0A%20%20%20%3CVASTAdTagURI%3E%3C%21%5BCDATA%5Bhttps://x.vindicosuite.com/%3Fl=454826\u0026t=x\u0026rnd=%5BCachebuster_If_Supported_In_Console%5D%5D%5D%3E%3C/VASTAdTagURI%3E%0A%20%20%20%3CError%3E%3C%21%5BCDATA%5Bhttps://bid.g.doubleclick.net/xbbe/notify/tremorvideo%3Fcreative_id=17282869\u0026usl_id=0\u0026errorcode=%5BERRORCODE%5D\u0026asseturi=%5BASSETURI%5D\u0026ord=%5BCACHEBUSTING%5D\u0026offset=%5BCONTENTPLAYHEAD%5D\u0026d=APEucNX6AnAylHZpx52AcFEstrYbL-_q_2ud9qCaXyViLGR4yz7SDI0QjLTfTgW5N60hztCt5lwtX-qOtPbrEbEH7AkfRc7aI04dfJWGCQhTntCRkpOC6UUNuHBWGPhsjDpKl8_I-piRwwFMMkZSXe8jaPe6gsJMdwmNCBn8OfpcbVAS0bknPVh1KkaXOZY-wnjj6kR0_VFyzS1fPi5lD3kj3lnBaEliKv-aqtH6SRbhBZoP7J-M9hM%5D%5D%3E%3C/Error%3E%0A%20%20%20%3CImpression%3E%3C%21%5BCDATA%5Bhttps://googleads4.g.doubleclick.net/pcs/view%3Fxai=AKAOjstYlfbiBdblfXq6LMym7IC5jwoF21UXuGUDBRde_xEZcfAEOwcQjxvzCqZC5xoBrfhSWeKfI9Vz-D1j\u0026sai=AMfl-YQb2HT6IsBYPlBStYINPJzmMSeKis_RCNPsUxYoiKpSFPeIiBL5vp5CBf3w5bw\u0026sig=Cg0ArKJSzFyUVtx3UaXREAE\u0026urlfix=1\u0026adurl=%5D%5D%3E%3C/Impression%3E%0A%20%20%20%3CImpression%3E%3C%21%5BCDATA%5Bhttps://bid.g.doubleclick.net/xbbe/view%3Fd=APEucNXGC7uCkDFg7_FYyowfGrx3gCKqhj3JqV93eVSng28OzYoBI8eE3HMmMaZotBjcJre8GVivuBgii_YOG0AJuoUi5TTrE7Zbb21k0RzF9urGsENZJLmfN1rU1WL1GJdWq5e-cfjN-RNzdogp_BDoCo7AbTtBNu9yXLyQZYjDjv9YQQm_9nJjbhG5s-lNtk8OxpEKZkS6qGU8UsI1Ox8YtPSXjIJ3obdROAlANqs5ptxYWId2hu8\u0026pr=1.022%5D%5D%3E%3C/Impression%3E%0A%20%20%20%3CImpression%3E%3C%21%5BCDATA%5Bhttps://bid.g.doubleclick.net/xbbe/pixel%3Fd=CPYDEKyCFxi17p4IIAE\u0026v=APEucNVfdw4VBtAGiqhdQ4w6G19gKA3EINCPdqNCuaourBH1J2uL8UN6cqxVJdM0ostWINYYDJCq%5D%5D%3E%3C/Impression%3E%0A%20%20%20%3CCreatives%3E%0A%20%20%20%20%3CCreative%20id=%2267817785%22%20sequence=%221%22%3E%0A%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%3CDuration%3E00:00:15%3C/Duration%3E%0A%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%3CTracking%20event=%22start%22%3E%3C%21%5BCDATA%5Bhttps://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=11;%5D%5D%3E%3C/Tracking%3E%0A%20%20%20%20%20%20%20%3CTracking%20event=%22firstQuartile%22%3E%3C%21%5BCDATA%5Bhttps://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=960584;%5D%5D%3E%3C/Tracking%3E%0A%20%20%20%20%20%20%20%3CTracking%20event=%22midpoint%22%3E%3C%21%5BCDATA%5Bhttps://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=18;%5D%5D%3E%3C/Tracking%3E%0A%20%20%20%20%20%20%20%3CTracking%20event=%22thirdQuartile%22%3E%3C%21%5BCDATA%5Bhttps://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=960585;%5D%5D%3E%3C/Tracking%3E%0A%20%20%20%20%20%20%20%3CTracking%20event=%22complete%22%3E%3C%21%5BCDATA%5Bhttps://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=13;%5D%5D%3E%3C/Tracking%3E%0A%20%20%20%20%20%20%20%3CTracking%20event=%22mute%22%3E%3C%21%5BCDATA%5Bhttps://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=16;%5D%5D%3E%3C/Tracking%3E%0A%20%20%20%20%20%20%20%3CTracking%20event=%22unmute%22%3E%3C%21%5BCDATA%5Bhttps://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=149645;%5D%5D%3E%3C/Tracking%3E%0A%20%20%20%20%20%20%20%3CTracking%20event=%22pause%22%3E%3C%21%5BCDATA%5Bhttps://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=15;%5D%5D%3E%3C/Tracking%3E%0A%20%20%20%20%20%20%20%3CTracking%20event=%22fullscreen%22%3E%3C%21%5BCDATA%5Bhttps://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=19;%5D%5D%3E%3C/Tracking%3E%0A%20%20%20%20%20%20%3CTracking%20event=%22start%22%3E%3C%21%5BCDATA%5Bhttp://events.tremorhub.com/evt%3Frid=fd53cdbe934c44c68c57467d184160d7\u0026pbid=1585\u0026seatid=60673\u0026aid=13457\u0026asid=5097\u0026lid=3\u0026evt=start\u0026vastcrtype=linear\u0026crid=67817785%5D%5D%3E%3C/Tracking%3E%0A%3CTracking%20event=%22firstQuartile%22%3E%3C%21%5BCDATA%5Bhttp://events.tremorhub.com/evt%3Frid=fd53cdbe934c44c68c57467d184160d7\u0026pbid=1585\u0026seatid=60673\u0026aid=13457\u0026asid=5097\u0026lid=3\u0026evt=firstQuartile\u0026vastcrtype=linear\u0026crid=67817785%5D%5D%3E%3C/Tracking%3E%0A%3CTracking%20event=%22midpoint%22%3E%3C%21%5BCDATA%5Bhttp://events.tremorhub.com/evt%3Frid=fd53cdbe934c44c68c57467d184160d7\u0026pbid=1585\u0026seatid=60673\u0026aid=13457\u0026asid=5097\u0026lid=3\u0026evt=midpoint\u0026vastcrtype=linear\u0026crid=67817785%5D%5D%3E%3C/Tracking%3E%0A%3CTracking%20event=%22thirdQuartile%22%3E%3C%21%5BCDATA%5Bhttp://events.tremorhub.com/evt%3Frid=fd53cdbe934c44c68c57467d184160d7\u0026pbid=1585\u0026seatid=60673\u0026aid=13457\u0026asid=5097\u0026lid=3\u0026evt=thirdQuartile\u0026vastcrtype=linear\u0026crid=67817785%5D%5D%3E%3C/Tracking%3E%0A%3CTracking%20event=%22complete%22%3E%3C%21%5BCDATA%5Bhttp://events.tremorhub.com/evt%3Frid=fd53cdbe934c44c68c57467d184160d7\u0026pbid=1585\u0026seatid=60673\u0026aid=13457\u0026asid=5097\u0026lid=3\u0026evt=complete\u0026vastcrtype=linear\u0026crid=67817785%5D%5D%3E%3C/Tracking%3E%0A%3C/TrackingEvents%3E%0A%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%3CClickTracking%3E%3C%21%5BCDATA%5Bhttps://adclick.g.doubleclick.net/pcs/click%3Fxai=AKAOjstYlfbiBdblfXq6LMym7IC5jwoF21UXuGUDBRde_xEZcfAEOwcQjxvzCqZC5xoBrfhSWeKfI9Vz-D1j\u0026sai=AMfl-YT-yQK5ngqbHCt-MCth_f3g6Ql6PBVZa7-oecKkqrVqkSNK6jTjavZZXhulRKo\u0026sig=Cg0ArKJSzI2sXx3KmnQbEAE\u0026urlfix=1\u0026adurl=%5D%5D%3E%3C/ClickTracking%3E%0A%20%20%20%20%20%20%3CClickTracking%20id=%22TV%22%3E%3C%21%5BCDATA%5Bhttp://events.tremorhub.com/evt%3Frid=fd53cdbe934c44c68c57467d184160d7\u0026pbid=1585\u0026seatid=60673\u0026aid=13457\u0026asid=5097\u0026lid=3\u0026evt=click\u0026vastcrtype=linear\u0026crid=67817785%5D%5D%3E%3C/ClickTracking%3E%0A%3C/VideoClicks%3E%0A%20%20%20%20%20%3C/Linear%3E%0A%20%20%20%20%3C/Creative%3E%0A%20%20%20%3C/Creatives%3E%0A%20%20%20%3CExtensions%3E%0A%20%20%20%20%3CExtension%20type=%22dart%22%3E%0A%3CAdServingData%3E%0A%20%3CDeliveryData%3E%0A%20%20%3CGeoData%3E%3C%21%5BCDATA%5Bct=US\u0026st=VA\u0026city=16629\u0026dma=13\u0026zp=\u0026bw=3%5D%5D%3E%3C/GeoData%3E%0A%20%3C/DeliveryData%3E%0A%3C/AdServingData%3E%0A%3C/Extension%3E%0A%20%20%20%20%3CExtension%20type=%22geo%22%3E%0A%3CCountry%3EUS%3C/Country%3E%0A%3CBandwidth%3E3%3C/Bandwidth%3E%0A%3CBandwidthKbps%3E2760%3C/BandwidthKbps%3E%0A%3C/Extension%3E%0A%20%20%20%3C/Extensions%3E%0A%20%20%3CError%3E%3C%21%5BCDATA%5Bhttp://events.tremorhub.com/diag%3Frid=fd53cdbe934c44c68c57467d184160d7\u0026pbid=1585\u0026seatid=60673\u0026aid=13457\u0026asid=5097\u0026lid=3\u0026rid=fd53cdbe934c44c68c57467d184160d7\u0026rtype=VAST_ERR\u0026vastError=%5BERRORCODE%5D\u0026sec=false\u0026adcode=rwd19-1059849-video\u0026seatId=60673\u0026pbid=1585\u0026brid=3418\u0026sid=9755\u0026sdom=demo.app.com\u0026asid=5097\u0026nid=3\u0026lid=3\u0026adom=nissanusa.com\u0026crid=17282869\u0026aid=13457%5D%5D%3E%3C/Error%3E%0A%3CImpression%20id=%22TV%22%3E%3C%21%5BCDATA%5Bhttp://events.tremorhub.com/evt%3Frid=fd53cdbe934c44c68c57467d184160d7\u0026pbid=1585\u0026seatid=60673\u0026aid=13457\u0026asid=5097\u0026lid=3\u0026evt=IMP%5D%5D%3E%3C/Impression%3E%0A%3CImpression%20id=%22comscore%22%3E%3C%21%5BCDATA%5Bhttp://b.scorecardresearch.com/b%3FC1=1\u0026C2=6000001\u0026C3=\u0026C4=\u0026C5=010000\u0026rnd=8202933074266195079%5D%5D%3E%3C/Impression%3E%0A%3CImpression%20id=%22Postback%22%3E%3C%21%5BCDATA%5Bhttp://adserver.unityads.unity3d.com/brands/1059849/%25ZONE%25/start%3Fvalue=715\u0026gm=1022\u0026nm=715\u0026cc=USD\u0026seat=60673\u0026pubId=1585\u0026brandId=3418\u0026supplyId=9755\u0026unit=13457\u0026code=rwd19-1059849-video\u0026source=5097\u0026demand=60004\u0026nt=3\u0026domain=nissanusa.com\u0026cId=17282869\u0026deal=%5D%5D%3E%3C/Impression%3E%0A%3C/Wrapper%3E%0A%20%3C/Ad%3E%0A%3C/VAST%3E%0A%0A",
                    "tracking": {
                        "start": null,
                        "firstQuartile": null,
                        "midpoint": null,
                        "thirdQuartile": null,
                        "complete": null,
                        "click": null
                    }
                },
                "gamerId": "5712983c481291b16e1be03b"
            }`
        }));
        mockRequest.expects('get').withArgs('https://x.vindicosuite.com/?l=454826&t=x&rnd=[Cachebuster_If_Supported_In_Console]', [], {retries: 5, retryDelay: 5000, followRedirects: false, retryWithConnectionEvents: false}).returns(Promise.resolve({
            response: `<?xml version='1.0' encoding='UTF-8'?><VAST version="2.0"><Ad id="3968433"><Wrapper><AdSystem version="2.0"><![CDATA[VINDICO]]></AdSystem><VASTAdTagURI><![CDATA[https://ads.pointroll.com/PortalServe/?pid=2810492V01420160323193924&pos=o&secure=1&r=1466475479]]></VASTAdTagURI><Error /><Impression id="VINDICO"><![CDATA[https://x.vindicosuite.com/dserve/t=d;l=454826;c=918974;b=3968433;ta=4981097;cr=497788800;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;a=82365;ts=1466475479]]></Impression><Impression id="COMSCORE"><![CDATA[https://sb.scorecardresearch.com/p?c1=1&c2=3000027&c3=&c4=&c5=01&cA1=3&cA2=2101&cA3=918974&cA4=3968433&cA5=454826&cA6=1&rn=1466475479]]></Impression><Impression id="ComscoreVOX"><![CDATA[https://sb.scorecardresearch.com/p?c1=1&c2=15796101&c3=&c4=&c5=01&cA1=3&cA2=2101&cA3=918974&cA4=3968433&cA5=454826&cA6=1&rn=1466475479]]></Impression><Creatives><Creative AdID="918974" id="543683" sequence="1"><Linear><Duration><![CDATA[00:00:15]]></Duration><TrackingEvents><Tracking event="creativeView"><![CDATA[https://x.vindicosuite.com/event/?e=11;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=95458;cr=2686135030;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="start"><![CDATA[https://x.vindicosuite.com/event/?e=12;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=91256;cr=2539347201;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="firstQuartile"><![CDATA[https://x.vindicosuite.com/event/?e=13;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=52835;cr=3022585079;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="midpoint"><![CDATA[https://x.vindicosuite.com/event/?e=14;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=23819;cr=99195890;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="thirdQuartile"><![CDATA[https://x.vindicosuite.com/event/?e=15;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=9092;cr=1110035921;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="complete"><![CDATA[https://x.vindicosuite.com/event/?e=16;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=93062;cr=3378288114;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="mute"><![CDATA[https://x.vindicosuite.com/event/?e=17;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=45513;cr=483982038;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="unmute"><![CDATA[https://x.vindicosuite.com/event/?e=18;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=5138;cr=1883451934;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="pause"><![CDATA[https://x.vindicosuite.com/event/?e=19;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=94809;cr=1999172093;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="rewind"><![CDATA[https://x.vindicosuite.com/event/?e=20;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=12034;cr=237861206;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="resume"><![CDATA[https://x.vindicosuite.com/event/?e=21;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=78826;cr=556072372;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="fullscreen"><![CDATA[https://x.vindicosuite.com/event/?e=22;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=80298;cr=873235077;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="expand"><![CDATA[https://x.vindicosuite.com/event/?e=23;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=38147;cr=2546849293;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="collapse"><![CDATA[https://x.vindicosuite.com/event/?e=24;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=3775;cr=2196846498;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="acceptInvitation"><![CDATA[https://x.vindicosuite.com/event/?e=26;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=86664;cr=1133143725;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking><Tracking event="close"><![CDATA[https://x.vindicosuite.com/event/?e=27;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=80992;cr=901011269;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=]]></Tracking></TrackingEvents><VideoClicks><ClickThrough><![CDATA[https://x.vindicosuite.com/click/?v=5;m=3;l=454826;c=918974;b=3968433;ts=1466475479;ui=Mzxw7vcjJKIYUBr51X6qI4T75yHPBloC4oFyIzlnzuseNOCWolB7mBUvaYyxz5q64WKJSiV1f2Vkqdfz1Uc8_w;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;ep=1;dcc=1;dct=]]></ClickThrough><ClickTracking><![CDATA[https://x.vindicosuite.com/click/?v=5;m=3;l=454826;c=918974;b=3968433;ts=1466475479;ui=Mzxw7vcjJKIYUBr51X6qI4T75yHPBloC4oFyIzlnzuseNOCWolB7mBUvaYyxz5q64WKJSiV1f2Vkqdfz1Uc8_w;pc=1;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;ep=1]]></ClickTracking></VideoClicks></Linear></Creative></Creatives><Extensions><Extension type="VerificationProviders"><VerificationProviders><Provider type="thirdparty"><MacroURL>pixel.adsafeprotected.com/jload?anId=7389&amp;advId=295901&amp;campId=918974&amp;pubId=196838&amp;placementId=454826&amp;adsafe_par&amp;uId=&amp;impId=2594751538771002015</MacroURL></Provider></VerificationProviders></Extension><Extension type="uebu"><uebu><trackingbase>https://x.vindicosuite.com/event/?e=$SUGR_CUSTOM_EVENT_ID$;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=29564;cr=3164867779;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;dcr=1;eav=$SUGR_EVENT_ARGUMENT$;$SUGR_EVENT_PARAM$;eov=$SUGR_EVENT_OBJ$;mpws=$SUGR_AD_WIDTH$;mphs=$SUGR_AD_HEIGHT$;dsd=$SUGR_DETERMINED_DOMAIN$;snvs=$SNAP_IN_VIEW$;sls=$APP_SUGR_LOCATION$;svn=$APP_SUGR_VERSION$;als=$APP_ADT_LOCATION$;avn=$APP_ADT_VERSION$;spr=$SUGR_QUERY_PARAMETERS$</trackingbase></uebu></Extension></Extensions></Wrapper></Ad></VAST>`
        }));
        mockRequest.expects('get').withArgs('https://ads.pointroll.com/PortalServe/?pid=2810492V01420160323193924&pos=o&secure=1&r=1466475479', [], {retries: 5, retryDelay: 5000, followRedirects: false, retryWithConnectionEvents: false}).returns(Promise.resolve({
            response: `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                <VAST version="2.0">
                  <Ad id="2810492_2183676">
                    <InLine>
                      <AdSystem>PointRoll</AdSystem>
                      <AdTitle>Nissan_VAST_FY15_SalesEvent_Altima_MSRP_15_DERIVE</AdTitle>
                      <Impression id="pointroll"><![CDATA[https://ads.pointroll.com/PortalServe/?secure=1&pid=2810492V01420160323193924&pos=o&oimp=C0350500-4E6E-9A6D-0314-A20018D20101&fcook=~&actid=-1206&cid=2183676&playmode=$PLAYMODE$&r=1466475479]]></Impression>
                      <Impression id="Redirect"><![CDATA[https://ad.doubleclick.net/ddm/ad/N3340.1922318VIANTINC.COM/B9495003.129068239;sz=1x1;ord=1466475479;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=?]]></Impression>
                      <Creatives>
                        <Creative>
                          <Linear>
                            <Duration>00:00:15</Duration>
                            <TrackingEvents>
                              <Tracking event="firstQuartile"><![CDATA[https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-201&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479]]></Tracking>
                              <Tracking event="midpoint"><![CDATA[https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-202&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479]]></Tracking>
                              <Tracking event="thirdQuartile"><![CDATA[https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-203&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479]]></Tracking>
                              <Tracking event="complete"><![CDATA[https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-204&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479]]></Tracking>
                              <Tracking event="resume"><![CDATA[https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1001&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479]]></Tracking>
                              <Tracking event="pause"><![CDATA[https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1002&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479]]></Tracking>
                              <Tracking event="rewind"><![CDATA[https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1003&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479]]></Tracking>
                              <Tracking event="mute"><![CDATA[https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1004&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479]]></Tracking>
                              <Tracking event="unmute"><![CDATA[https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1005&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479]]></Tracking>
                              <Tracking event="fullscreen"><![CDATA[https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1010&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479]]></Tracking>
                            </TrackingEvents>
                            <VideoClicks>
                              <ClickThrough id="pointroll"><![CDATA[http://clk.pointroll.com/bc/?a=2183676&c=9001&i=C0350500-4E6E-9A6D-0314-A20018D20101&clickurl=https://ad.doubleclick.net/ddm/clk/302764234%3B129068239%3Bg%3Fhttp://www.choosenissan.com/altima/%3Fdcp=zmm.%25epid!.%26dcc=%25ecid!.%25eaid!%26utm_source=%25esid!%26utm_medium=%25epid!%26utm_content=%25ecid!.%25eaid!%26dcn=1]]></ClickThrough>
                            </VideoClicks>
                            <MediaFiles>
                              <MediaFile width="1280" height="720" bitrate="400" type="video/mp4" delivery="progressive" id=""><![CDATA[https://speed-s.pointroll.com/pointroll/media/asset/Nissan/221746/Nissan_FY16_FTC_GM_Generic_Instream_1280x720_400kbps_15secs.mp4]]></MediaFile>
                            </MediaFiles>
                          </Linear>
                        </Creative>
                      </Creatives>
                    </InLine>
                  </Ad>
                </VAST>`
        }));

        vastParser.setMaxWrapperDepth(2);
        let campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
        let triggeredCampaign: VastCampaign;
        campaignManager.onVastCampaign.subscribe((campaign: VastCampaign) => {
            triggeredCampaign = campaign;
            // then the onVastCampaign observable is triggered with the correct campaign data
            mockRequest.verify();
            assert.equal(triggeredCampaign.getAbGroup(), 3);
            assert.equal(triggeredCampaign.getGamerId(), '5712983c481291b16e1be03b');
            assert.equal(triggeredCampaign.getVideoUrl(), 'https://speed-s.pointroll.com/pointroll/media/asset/Nissan/221746/Nissan_FY16_FTC_GM_Generic_Instream_1280x720_400kbps_15secs.mp4');
            assert.deepEqual(triggeredCampaign.getVast().getAd().getErrorURLTemplates(), [
                'https://bid.g.doubleclick.net/xbbe/notify/tremorvideo?creative_id=17282869&usl_id=0&errorcode=[ERRORCODE]&asseturi=[ASSETURI]&ord=[CACHEBUSTING]&offset=[CONTENTPLAYHEAD]&d=APEucNX6AnAylHZpx52AcFEstrYbL-_q_2ud9qCaXyViLGR4yz7SDI0QjLTfTgW5N60hztCt5lwtX-qOtPbrEbEH7AkfRc7aI04dfJWGCQhTntCRkpOC6UUNuHBWGPhsjDpKl8_I-piRwwFMMkZSXe8jaPe6gsJMdwmNCBn8OfpcbVAS0bknPVh1KkaXOZY-wnjj6kR0_VFyzS1fPi5lD3kj3lnBaEliKv-aqtH6SRbhBZoP7J-M9hM',
                'http://events.tremorhub.com/diag?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&rid=fd53cdbe934c44c68c57467d184160d7&rtype=VAST_ERR&vastError=[ERRORCODE]&sec=false&adcode=rwd19-1059849-video&seatId=60673&pbid=1585&brid=3418&sid=9755&sdom=demo.app.com&asid=5097&nid=3&lid=3&adom=nissanusa.com&crid=17282869&aid=13457'
            ]);

            assert.deepEqual(triggeredCampaign.getVast().getImpressionUrls(), [
                'https://ads.pointroll.com/PortalServe/?secure=1&pid=2810492V01420160323193924&pos=o&oimp=C0350500-4E6E-9A6D-0314-A20018D20101&fcook=~&actid=-1206&cid=2183676&playmode=$PLAYMODE$&r=1466475479',
                'https://ad.doubleclick.net/ddm/ad/N3340.1922318VIANTINC.COM/B9495003.129068239;sz=1x1;ord=1466475479;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=?',
                'https://x.vindicosuite.com/dserve/t=d;l=454826;c=918974;b=3968433;ta=4981097;cr=497788800;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm/IBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;a=82365;ts=1466475479',
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
                'https://x.vindicosuite.com/event/?e=11;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=95458;cr=2686135030;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm/IBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href='
            ]);
            assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('start'), [
                'https://x.vindicosuite.com/event/?e=12;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=91256;cr=2539347201;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm/IBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=11;',
                'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=start&vastcrtype=linear&crid=67817785'
            ]);
            assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('firstQuartile'), [
                'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-201&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                'https://x.vindicosuite.com/event/?e=13;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=52835;cr=3022585079;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm/IBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=960584;',
                'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=firstQuartile&vastcrtype=linear&crid=67817785'
            ]);
            assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('midpoint'), [
                'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-202&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                'https://x.vindicosuite.com/event/?e=14;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=23819;cr=99195890;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm/IBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=18;',
                'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=midpoint&vastcrtype=linear&crid=67817785'
            ]);
            assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('thirdQuartile'), [
                'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-203&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                'https://x.vindicosuite.com/event/?e=15;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=9092;cr=1110035921;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm/IBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=960585;',
                'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=thirdQuartile&vastcrtype=linear&crid=67817785'
            ]);
            assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('complete'), [
                'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-204&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                'https://x.vindicosuite.com/event/?e=16;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=93062;cr=3378288114;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm/IBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=13;',
                'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=complete&vastcrtype=linear&crid=67817785'
            ]);
            assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('mute'), [
                'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1004&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                'https://x.vindicosuite.com/event/?e=17;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=45513;cr=483982038;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm/IBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=16;'
            ]);
            assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('unmute'), [
                'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1005&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                'https://x.vindicosuite.com/event/?e=18;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=5138;cr=1883451934;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm/IBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=149645;'
            ]);
            assert.equal(triggeredCampaign.getVast().getDuration(), 15);
            done();
        });

        // when the campaign manager requests the placement
        return campaignManager.request();
    });

    it('should fail when max depth is exceeded', (done) => {

        // given a valid wrapped VAST placement that points at a valid VAST with a wrapper
        let mockRequest = sinon.mock(request);
        mockRequest.expects('post').returns(Promise.resolve({
            response: `{
                "abGroup": 3,
                "vast": {
                    "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22602833%22%3E%0A%20%20%3CWrapper%3E%0A%20%20%20%20%3CAdSystem%3EAcudeo%20Compatible%3C%2FAdSystem%3E%0A%20%20%20%20%3CVASTAdTagURI%3Ehttp%3A%2F%2Fdemo.tremormedia.com%2Fproddev%2Fvast%2Fvast_wrapper_linear_1.xml%3C%2FVASTAdTagURI%3E%0A%20%20%20%20%3CError%3Ehttp%3A%2F%2FmyErrorURL%2Fwrapper%2Ferror%3C%2FError%3E%0A%20%20%20%20%3CImpression%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fimpression%3C%2FImpression%3E%0A%09%3CCreatives%3E%0A%09%09%3CCreative%20AdID%3D%22602833%22%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22creativeView%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FcreativeView%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22start%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fstart%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22midpoint%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmidpoint%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22firstQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FfirstQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22thirdQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FthirdQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22complete%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fcomplete%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22mute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22unmute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Funmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22pause%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fpause%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22resume%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fresume%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22fullscreen%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Ffullscreen%3C%2FTracking%3E%09%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CVideoClicks%3E%0A%09%09%09%09%09%3CClickTracking%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fclick%3C%2FClickTracking%3E%0A%09%09%09%09%3C%2FVideoClicks%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%20AdID%3D%22602833-NonLinearTracking%22%3E%0A%09%09%09%3CNonLinearAds%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FNonLinearAds%3E%0A%09%09%3C%2FCreative%3E%0A%09%3C%2FCreatives%3E%0A%20%20%3C%2FWrapper%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E%0A",
                    "tracking": {
                        "click": null,
                        "complete": null,
                        "firstQuartile": null,
                        "midpoint": null,
                        "start": [
                            "http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1"
                        ],
                        "thirdQuartile": null
                    }
                },
                "gamerId": "5712983c481291b16e1be03b"
            }`
        }));

        mockRequest.expects('get').returns(Promise.resolve({
            response: `<?xml version="1.0" encoding="UTF-8"?>
                <VAST version="2.0">
                <Ad id="602833">
                <Wrapper>
                <AdSystem>Acudeo Compatible</AdSystem>
                <VASTAdTagURI>http://demo.tremormedia.com/proddev/vast/vast_wrapper_linear_2.xml</VASTAdTagURI>
                <Error>http://myErrorURL/wrapper/error</Error>
                <Impression>http://myTrackingURL/wrapper/impression</Impression>
                <Creatives>
                    <Creative AdID="602833">
                        <Linear>
                            <TrackingEvents>
                                <Tracking event="creativeView">http://myTrackingURL/wrapper/creativeView</Tracking>
                                <Tracking event="start">http://myTrackingURL/wrapper/start</Tracking>
                                <Tracking event="midpoint">http://myTrackingURL/wrapper/midpoint</Tracking>
                                <Tracking event="firstQuartile">http://myTrackingURL/wrapper/firstQuartile</Tracking>
                                <Tracking event="thirdQuartile">http://myTrackingURL/wrapper/thirdQuartile</Tracking>
                                <Tracking event="complete">http://myTrackingURL/wrapper/complete</Tracking>
                                <Tracking event="mute">http://myTrackingURL/wrapper/mute</Tracking>
                                <Tracking event="unmute">http://myTrackingURL/wrapper/unmute</Tracking>
                                <Tracking event="pause">http://myTrackingURL/wrapper/pause</Tracking>
                                <Tracking event="resume">http://myTrackingURL/wrapper/resume</Tracking>
                                <Tracking event="fullscreen">http://myTrackingURL/wrapper/fullscreen</Tracking>
                            </TrackingEvents>
                        </Linear>
                    </Creative>
                    <Creative>
                        <Linear>
                            <VideoClicks>
                                <ClickTracking>http://myTrackingURL/wrapper/click</ClickTracking>
                            </VideoClicks>
                        </Linear>
                    </Creative>
                    <Creative AdID="602833-NonLinearTracking">
                        <NonLinearAds>
                            <TrackingEvents>
                            </TrackingEvents>
                        </NonLinearAds>
                    </Creative>
                </Creatives>
                </Wrapper>
                </Ad>
                </VAST>`
        }));

        mockRequest.expects('get').returns(Promise.resolve({
            response: `<?xml version="1.0" encoding="UTF-8"?>
                <VAST version="2.0">
                <Ad id="602833">
                <Wrapper>
                <AdSystem>Acudeo Compatible</AdSystem>
                <VASTAdTagURI>http://demo.tremormedia.com/proddev/vast/vast_wrapper_linear_3.xml</VASTAdTagURI>
                <Error>http://myErrorURL/wrapper/error</Error>
                <Impression>http://myTrackingURL/wrapper/impression</Impression>
                <Creatives>
                    <Creative AdID="602833">
                        <Linear>
                            <TrackingEvents>
                                <Tracking event="creativeView">http://myTrackingURL/wrapper/creativeView</Tracking>
                                <Tracking event="start">http://myTrackingURL/wrapper/start</Tracking>
                                <Tracking event="midpoint">http://myTrackingURL/wrapper/midpoint</Tracking>
                                <Tracking event="firstQuartile">http://myTrackingURL/wrapper/firstQuartile</Tracking>
                                <Tracking event="thirdQuartile">http://myTrackingURL/wrapper/thirdQuartile</Tracking>
                                <Tracking event="complete">http://myTrackingURL/wrapper/complete</Tracking>
                                <Tracking event="mute">http://myTrackingURL/wrapper/mute</Tracking>
                                <Tracking event="unmute">http://myTrackingURL/wrapper/unmute</Tracking>
                                <Tracking event="pause">http://myTrackingURL/wrapper/pause</Tracking>
                                <Tracking event="resume">http://myTrackingURL/wrapper/resume</Tracking>
                                <Tracking event="fullscreen">http://myTrackingURL/wrapper/fullscreen</Tracking>
                            </TrackingEvents>
                        </Linear>
                    </Creative>
                    <Creative>
                        <Linear>
                            <VideoClicks>
                                <ClickTracking>http://myTrackingURL/wrapper/click</ClickTracking>
                            </VideoClicks>
                        </Linear>
                    </Creative>
                    <Creative AdID="602833-NonLinearTracking">
                        <NonLinearAds>
                            <TrackingEvents>
                            </TrackingEvents>
                        </NonLinearAds>
                    </Creative>
                </Creatives>
                </Wrapper>
                </Ad>
                </VAST>`
        }));

        mockRequest.expects('get').returns(Promise.resolve({
            response: `<?xml version="1.0" encoding="UTF-8"?>
                <VAST version="2.0">
                <Ad id="602833">
                <Wrapper>
                <AdSystem>Acudeo Compatible</AdSystem>
                <VASTAdTagURI>http://demo.tremormedia.com/proddev/vast/vast_wrapper_linear_4.xml</VASTAdTagURI>
                <Error>http://myErrorURL/wrapper/error</Error>
                <Impression>http://myTrackingURL/wrapper/impression</Impression>
                <Creatives>
                    <Creative AdID="602833">
                        <Linear>
                            <TrackingEvents>
                                <Tracking event="creativeView">http://myTrackingURL/wrapper/creativeView</Tracking>
                                <Tracking event="start">http://myTrackingURL/wrapper/start</Tracking>
                                <Tracking event="midpoint">http://myTrackingURL/wrapper/midpoint</Tracking>
                                <Tracking event="firstQuartile">http://myTrackingURL/wrapper/firstQuartile</Tracking>
                                <Tracking event="thirdQuartile">http://myTrackingURL/wrapper/thirdQuartile</Tracking>
                                <Tracking event="complete">http://myTrackingURL/wrapper/complete</Tracking>
                                <Tracking event="mute">http://myTrackingURL/wrapper/mute</Tracking>
                                <Tracking event="unmute">http://myTrackingURL/wrapper/unmute</Tracking>
                                <Tracking event="pause">http://myTrackingURL/wrapper/pause</Tracking>
                                <Tracking event="resume">http://myTrackingURL/wrapper/resume</Tracking>
                                <Tracking event="fullscreen">http://myTrackingURL/wrapper/fullscreen</Tracking>
                            </TrackingEvents>
                        </Linear>
                    </Creative>
                    <Creative>
                        <Linear>
                            <VideoClicks>
                                <ClickTracking>http://myTrackingURL/wrapper/click</ClickTracking>
                            </VideoClicks>
                        </Linear>
                    </Creative>
                    <Creative AdID="602833-NonLinearTracking">
                        <NonLinearAds>
                            <TrackingEvents>
                            </TrackingEvents>
                        </NonLinearAds>
                    </Creative>
                </Creatives>
                </Wrapper>
                </Ad>
                </VAST>`
        }));

        mockRequest.expects('get').returns(Promise.resolve({
            response: `<?xml version="1.0" encoding="UTF-8"?>
                <VAST version="2.0">
                  <Ad id="601364">
                  <InLine>
                    <AdSystem>Acudeo Compatible</AdSystem>
                    <AdTitle>VAST 2.0 Instream Test 1</AdTitle>
                    <Description>VAST 2.0 Instream Test 1</Description>
                    <Error>http://myErrorURL/error</Error>
                    <Impression>http://myTrackingURL/impression</Impression>
                    <Creatives>
                        <Creative AdID="601364">
                            <Linear>
                                <Duration>00:00:30</Duration>
                                <TrackingEvents>
                                    <Tracking event="creativeView">http://myTrackingURL/creativeView</Tracking>
                                    <Tracking event="start">http://myTrackingURL/start</Tracking>
                                    <Tracking event="midpoint">http://myTrackingURL/midpoint</Tracking>
                                    <Tracking event="firstQuartile">http://myTrackingURL/firstQuartile</Tracking>
                                    <Tracking event="thirdQuartile">http://myTrackingURL/thirdQuartile</Tracking>
                                    <Tracking event="complete">http://myTrackingURL/complete</Tracking>
                                </TrackingEvents>
                                <VideoClicks>
                                    <ClickThrough>http://www.tremormedia.com</ClickThrough>
                                    <ClickTracking>http://myTrackingURL/click</ClickTracking>
                                </VideoClicks>
                                <MediaFiles>
                                    <MediaFile delivery="progressive" type="video/x-flv" bitrate="500" width="400" height="300" scalable="true" maintainAspectRatio="true">http://cdnp.tremormedia.com/video/acudeo/Carrot_400x300_500kb.flv</MediaFile>
                                </MediaFiles>
                            </Linear>
                        </Creative>
                        <Creative AdID="601364-Companion">
                            <CompanionAds>
                                <Companion width="300" height="250">
                                    <StaticResource creativeType="image/jpeg">http://demo.tremormedia.com/proddev/vast/Blistex1.jpg</StaticResource>
                                    <TrackingEvents>
                                        <Tracking event="creativeView">http://myTrackingURL/firstCompanionCreativeView</Tracking>
                                    </TrackingEvents>

                                    <CompanionClickThrough>http://www.tremormedia.com</CompanionClickThrough>
                                </Companion>
                                <Companion width="728" height="90">
                                    <StaticResource creativeType="image/jpeg">http://demo.tremormedia.com/proddev/vast/728x90_banner1.jpg</StaticResource>
                                    <CompanionClickThrough>http://www.tremormedia.com</CompanionClickThrough>
                                </Companion>
                            </CompanionAds>
                        </Creative>
                    </Creatives>
                  </InLine>
                  </Ad>
                </VAST>`
        }));

        let campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
        campaignManager.onError.subscribe((err: Error) => {
            assert.equal(err.message, 'VAST wrapper depth exceeded');
            done();
        });

        // when the campaign manager requests the placement
        return campaignManager.request();
    });

    let verifyErrorForResponse = (response: any, expectedErrorMessage: string): Promise<void> => {
        // given a VAST placement with invalid XML
        let mockRequest = sinon.mock(request);
        mockRequest.expects('post').withArgs(
            'https://adserver.unityads.unity3d.com/games/12345/fill?&platform=android&sdkVersion=2.0.0-alpha2&',
            '{"bundleVersion":"2.0.0-test2","bundleId":"com.unity3d.ads.example"}',
            [],
            {
                retries: 5,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }
        ).returns(Promise.resolve(response));

        let campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
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

    let verifyErrorForWrappedResponse = (response: any, wrappedUrl: string, wrappedResponse: Promise<any>, expectedErrorMessage: string, done?: () => void): Promise<void> => {
        // given a VAST placement that wraps another VAST
        let mockRequest = sinon.mock(request);
        mockRequest.expects('post').withArgs(
            'https://adserver.unityads.unity3d.com/games/12345/fill?&platform=android&sdkVersion=2.0.0-alpha2&',
            '{"bundleVersion":"2.0.0-test2","bundleId":"com.unity3d.ads.example"}',
            [],
            {
                retries: 5,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }
        ).returns(Promise.resolve(response));
        mockRequest.expects('get').withArgs(wrappedUrl, [], {retries: 5, retryDelay: 5000, followRedirects: false, retryWithConnectionEvents: false}).returns(wrappedResponse);

        let campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
        let triggeredError: Error;
        let verify = () => {
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
        return campaignManager.request().then(() => {
            // then the onError observable is triggered with an appropriate error
            verify();
        });
    };

    describe('VAST error handling', () => {

        it('should trigger onError after requesting a vast placement without a video url', () => {
            const response = {
                response: `{
                "abGroup": 3,
                "vast": {
                    "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22preroll-1%22%3E%0A%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%3CAdSystem%3E2.0%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%3CAdTitle%3E5748406%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%3CImpression%20id%3D%22blah%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fb.scorecardresearch.com%2Fb%3FC1%3D1%26C2%3D6000003%26C3%3D0000000200500000197000000%26C4%3Dus%26C7%3Dhttp%3A%2F%2Fwww.scanscout.com%26C8%3Dscanscout.com%26C9%3Dhttp%3A%2F%2Fwww.scanscout.com%26C10%3Dxn%26rn%3D-103217130%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A30%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%20id%3D%22scanscout%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fwww.target.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%09%3C%2FCreative%3E%0A%09%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CCompanionAds%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20height%3D%22250%22%20width%3D%22300%22%20id%3D%22555750%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CHTMLResource%3E%3C!%5BCDATA%5B%3CA%20onClick%3D%22var%20i%3D%20new%20Image(1%2C1)%3B%20i.src%3D%27http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D0%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%27%3B%22%20HREF%3D%22http%3A%2F%2Ftarget.com%22%20target%3D%22_blank%22%3E%0A%3CIMG%20SRC%3D%22http%3A%2F%2Fmedia.scanscout.com%2Fads%2Ftarget300x250Companion.jpg%22%20BORDER%3D0%20WIDTH%3D300%20HEIGHT%3D250%20ALT%3D%22Click%20Here%22%3E%0A%3C%2FA%3E%0A%3Cimg%20src%3D%22http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D1%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%22%20height%3D%221%22%20width%3D%221%22%3E%0A%5D%5D%3E%3C%2FHTMLResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FCompanionAds%3E%0A%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%3C%2FInLine%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E"
                },
                "gamerId": "5712983c481291b16e1be03b"
            }`
            };
            return verifyErrorForResponse(response, 'Campaign does not have a video url');
        });

        it('should trigger onError after requesting a wrapped vast placement without a video url', (done) => {
            const response = {
                response: `{
                "abGroup": 3,
                "vast": {
                    "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22602833%22%3E%0A%20%20%3CWrapper%3E%0A%20%20%20%20%3CAdSystem%3EAcudeo%20Compatible%3C%2FAdSystem%3E%0A%20%20%20%20%3CVASTAdTagURI%3Ehttp%3A%2F%2Fdemo.tremormedia.com%2Fproddev%2Fvast%2Fvast_inline_linear.xml%3C%2FVASTAdTagURI%3E%0A%20%20%20%20%3CError%3Ehttp%3A%2F%2FmyErrorURL%2Fwrapper%2Ferror%3C%2FError%3E%0A%20%20%20%20%3CImpression%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fimpression%3C%2FImpression%3E%0A%09%3CCreatives%3E%0A%09%09%3CCreative%20AdID%3D%22602833%22%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22creativeView%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FcreativeView%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22start%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fstart%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22midpoint%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmidpoint%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22firstQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FfirstQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22thirdQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FthirdQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22complete%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fcomplete%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22mute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22unmute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Funmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22pause%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fpause%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22resume%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fresume%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22fullscreen%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Ffullscreen%3C%2FTracking%3E%09%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CVideoClicks%3E%0A%09%09%09%09%09%3CClickTracking%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fclick%3C%2FClickTracking%3E%0A%09%09%09%09%3C%2FVideoClicks%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%20AdID%3D%22602833-NonLinearTracking%22%3E%0A%09%09%09%3CNonLinearAds%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FNonLinearAds%3E%0A%09%09%3C%2FCreative%3E%0A%09%3C%2FCreatives%3E%0A%20%20%3C%2FWrapper%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E%0A"
                },
                "gamerId": "5712983c481291b16e1be03b"
            }`
            };
            const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
            const wrappedResponse = Promise.resolve({
                response: `<?xml version="1.0" encoding="UTF-8"?>
                <VAST version="2.0">
                  <Ad id="601364">
                  <InLine>
                    <AdSystem>Acudeo Compatible</AdSystem>
                    <AdTitle>VAST 2.0 Instream Test 1</AdTitle>
                    <Description>VAST 2.0 Instream Test 1</Description>
                    <Error>http://myErrorURL/error</Error>
                    <Impression>http://myTrackingURL/impression</Impression>
                    <Creatives>
                        <Creative AdID="601364">
                            <Linear>
                                <Duration>00:00:30</Duration>
                                <TrackingEvents>
                                    <Tracking event="creativeView">http://myTrackingURL/creativeView</Tracking>
                                    <Tracking event="start">http://myTrackingURL/start</Tracking>
                                    <Tracking event="midpoint">http://myTrackingURL/midpoint</Tracking>
                                    <Tracking event="firstQuartile">http://myTrackingURL/firstQuartile</Tracking>
                                    <Tracking event="thirdQuartile">http://myTrackingURL/thirdQuartile</Tracking>
                                    <Tracking event="complete">http://myTrackingURL/complete</Tracking>
                                </TrackingEvents>
                                <VideoClicks>
                                    <ClickThrough>http://www.tremormedia.com</ClickThrough>
                                    <ClickTracking>http://myTrackingURL/click</ClickTracking>
                                </VideoClicks>
                            </Linear>
                        </Creative>
                        <Creative AdID="601364-Companion">
                            <CompanionAds>
                                <Companion width="300" height="250">
                                    <StaticResource creativeType="image/jpeg">http://demo.tremormedia.com/proddev/vast/Blistex1.jpg</StaticResource>
                                    <TrackingEvents>
                                        <Tracking event="creativeView">http://myTrackingURL/firstCompanionCreativeView</Tracking>
                                    </TrackingEvents>

                                    <CompanionClickThrough>http://www.tremormedia.com</CompanionClickThrough>
                                </Companion>
                                <Companion width="728" height="90">
                                    <StaticResource creativeType="image/jpeg">http://demo.tremormedia.com/proddev/vast/728x90_banner1.jpg</StaticResource>
                                    <CompanionClickThrough>http://www.tremormedia.com</CompanionClickThrough>
                                </Companion>
                            </CompanionAds>
                        </Creative>
                    </Creatives>
                  </InLine>
                  </Ad>
                </VAST>`
            });
            return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, 'Campaign does not have a video url', done);
        });

        it('should trigger onError after requesting a vast placement with incorrect document element node name', () => {
            const response = {
                response: `{
                    "abGroup": 3,
                    "vast": {
                        "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVASTy%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22preroll-1%22%3E%0A%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%3CAdSystem%3E2.0%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%3CAdTitle%3E5748406%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%3CImpression%20id%3D%22blah%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fb.scorecardresearch.com%2Fb%3FC1%3D1%26C2%3D6000003%26C3%3D0000000200500000197000000%26C4%3Dus%26C7%3Dhttp%3A%2F%2Fwww.scanscout.com%26C8%3Dscanscout.com%26C9%3Dhttp%3A%2F%2Fwww.scanscout.com%26C10%3Dxn%26rn%3D-103217130%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A30%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%20id%3D%22scanscout%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fwww.target.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%09%3C%2FCreative%3E%0A%09%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CCompanionAds%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20height%3D%22250%22%20width%3D%22300%22%20id%3D%22555750%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CHTMLResource%3E%3C!%5BCDATA%5B%3CA%20onClick%3D%22var%20i%3D%20new%20Image(1%2C1)%3B%20i.src%3D%27http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D0%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%27%3B%22%20HREF%3D%22http%3A%2F%2Ftarget.com%22%20target%3D%22_blank%22%3E%0A%3CIMG%20SRC%3D%22http%3A%2F%2Fmedia.scanscout.com%2Fads%2Ftarget300x250Companion.jpg%22%20BORDER%3D0%20WIDTH%3D300%20HEIGHT%3D250%20ALT%3D%22Click%20Here%22%3E%0A%3C%2FA%3E%0A%3Cimg%20src%3D%22http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D1%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%22%20height%3D%221%22%20width%3D%221%22%3E%0A%5D%5D%3E%3C%2FHTMLResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FCompanionAds%3E%0A%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%3C%2FInLine%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E"
                    },
                    "gamerId": "5712983c481291b16e1be03b"
                }`
            };
            return verifyErrorForResponse(response, 'VAST xml is invalid - document element must be VAST but was VASTy');
        });

        it('should trigger onError after requesting a wrapped vast placement with incorrect document element node name', () => {
            const response = {
                response: `{
                "abGroup": 3,
                "vast": {
                    "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22602833%22%3E%0A%20%20%3CWrapper%3E%0A%20%20%20%20%3CAdSystem%3EAcudeo%20Compatible%3C%2FAdSystem%3E%0A%20%20%20%20%3CVASTAdTagURI%3Ehttp%3A%2F%2Fdemo.tremormedia.com%2Fproddev%2Fvast%2Fvast_inline_linear.xml%3C%2FVASTAdTagURI%3E%0A%20%20%20%20%3CError%3Ehttp%3A%2F%2FmyErrorURL%2Fwrapper%2Ferror%3C%2FError%3E%0A%20%20%20%20%3CImpression%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fimpression%3C%2FImpression%3E%0A%09%3CCreatives%3E%0A%09%09%3CCreative%20AdID%3D%22602833%22%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22creativeView%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FcreativeView%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22start%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fstart%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22midpoint%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmidpoint%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22firstQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FfirstQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22thirdQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FthirdQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22complete%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fcomplete%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22mute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22unmute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Funmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22pause%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fpause%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22resume%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fresume%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22fullscreen%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Ffullscreen%3C%2FTracking%3E%09%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CVideoClicks%3E%0A%09%09%09%09%09%3CClickTracking%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fclick%3C%2FClickTracking%3E%0A%09%09%09%09%3C%2FVideoClicks%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%20AdID%3D%22602833-NonLinearTracking%22%3E%0A%09%09%09%3CNonLinearAds%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FNonLinearAds%3E%0A%09%09%3C%2FCreative%3E%0A%09%3C%2FCreatives%3E%0A%20%20%3C%2FWrapper%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E%0A"
                },
                "gamerId": "5712983c481291b16e1be03b"
            }`
            };
            const wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
            const wrappedResponse = Promise.resolve({
                response: `<?xml version="1.0" encoding="UTF-8"?>
                <foo version="2.0">
                  <Ad id="601364">
                  <InLine>
                    <AdSystem>Acudeo Compatible</AdSystem>
                    <AdTitle>VAST 2.0 Instream Test 1</AdTitle>
                    <Description>VAST 2.0 Instream Test 1</Description>
                    <Error>http://myErrorURL/error</Error>
                    <Impression>http://myTrackingURL/impression</Impression>
                    <Creatives>
                        <Creative AdID="601364">
                            <Linear>
                                <Duration>00:00:30</Duration>
                                <TrackingEvents>
                                    <Tracking event="creativeView">http://myTrackingURL/creativeView</Tracking>
                                    <Tracking event="start">http://myTrackingURL/start</Tracking>
                                    <Tracking event="midpoint">http://myTrackingURL/midpoint</Tracking>
                                    <Tracking event="firstQuartile">http://myTrackingURL/firstQuartile</Tracking>
                                    <Tracking event="thirdQuartile">http://myTrackingURL/thirdQuartile</Tracking>
                                    <Tracking event="complete">http://myTrackingURL/complete</Tracking>
                                </TrackingEvents>
                                <VideoClicks>
                                    <ClickThrough>http://www.tremormedia.com</ClickThrough>
                                    <ClickTracking>http://myTrackingURL/click</ClickTracking>
                                </VideoClicks>
                                <MediaFiles>
                                    <MediaFile delivery="progressive" type="video/x-flv" bitrate="500" width="400" height="300" scalable="true" maintainAspectRatio="true">http://cdnp.tremormedia.com/video/acudeo/Carrot_400x300_500kb.flv</MediaFile>
                                </MediaFiles>
                            </Linear>
                        </Creative>
                        <Creative AdID="601364-Companion">
                            <CompanionAds>
                                <Companion width="300" height="250">
                                    <StaticResource creativeType="image/jpeg">http://demo.tremormedia.com/proddev/vast/Blistex1.jpg</StaticResource>
                                    <TrackingEvents>
                                        <Tracking event="creativeView">http://myTrackingURL/firstCompanionCreativeView</Tracking>
                                    </TrackingEvents>

                                    <CompanionClickThrough>http://www.tremormedia.com</CompanionClickThrough>
                                </Companion>
                                <Companion width="728" height="90">
                                    <StaticResource creativeType="image/jpeg">http://demo.tremormedia.com/proddev/vast/728x90_banner1.jpg</StaticResource>
                                    <CompanionClickThrough>http://www.tremormedia.com</CompanionClickThrough>
                                </Companion>
                            </CompanionAds>
                        </Creative>
                    </Creatives>
                  </InLine>
                  </Ad>
                </foo>`
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
                response: `{
                "abGroup": 3,
                "vast": {
                    "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22602833%22%3E%0A%20%20%3CWrapper%3E%0A%20%20%20%20%3CAdSystem%3EAcudeo%20Compatible%3C%2FAdSystem%3E%0A%20%20%20%20%3CVASTAdTagURI%3Ehttp%3A%2F%2Fdemo.tremormedia.com%2Fproddev%2Fvast%2Fvast_inline_linear.xml%3C%2FVASTAdTagURI%3E%0A%20%20%20%20%3CError%3Ehttp%3A%2F%2FmyErrorURL%2Fwrapper%2Ferror%3C%2FError%3E%0A%20%20%20%20%3CImpression%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fimpression%3C%2FImpression%3E%0A%09%3CCreatives%3E%0A%09%09%3CCreative%20AdID%3D%22602833%22%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22creativeView%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FcreativeView%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22start%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fstart%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22midpoint%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmidpoint%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22firstQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FfirstQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22thirdQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FthirdQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22complete%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fcomplete%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22mute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22unmute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Funmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22pause%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fpause%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22resume%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fresume%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22fullscreen%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Ffullscreen%3C%2FTracking%3E%09%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CVideoClicks%3E%0A%09%09%09%09%09%3CClickTracking%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fclick%3C%2FClickTracking%3E%0A%09%09%09%09%3C%2FVideoClicks%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%20AdID%3D%22602833-NonLinearTracking%22%3E%0A%09%09%09%3CNonLinearAds%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FNonLinearAds%3E%0A%09%09%3C%2FCreative%3E%0A%09%3C%2FCreatives%3E%0A%20%20%3C%2FWrapper%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E%0A"
                },
                "gamerId": "5712983c481291b16e1be03b"
            }`
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

            let mockRequest = sinon.mock(request);
            mockRequest.expects('post').withArgs(
                'https://adserver.unityads.unity3d.com/games/12345/fill?&platform=android&sdkVersion=2.0.0-alpha2&',
                '{"bundleVersion":"2.0.0-test2","bundleId":"com.unity3d.ads.example"}',
                [],
                {
                    retries: 5,
                    retryDelay: 5000,
                    followRedirects: false,
                    retryWithConnectionEvents: true
                }
            ).returns(Promise.resolve(response));

            let campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
            let triggeredRetryTime: number;
            campaignManager.onNoFill.subscribe((retryTime: number) => {
                triggeredRetryTime = retryTime;
            });

            // when the campaign manager requests the placement
            return campaignManager.request().then(() => {

                // then the onNoFill observable is triggered
                mockRequest.verify();
                assert.equal(triggeredRetryTime, 3600);
            });
        });

        it('should trigger onError after requesting a vast placement without an impression url', () => {
            const response = {
                    response: `{
                    "abGroup": 3,
                    "vast": {
                        "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22preroll-1%22%3E%0A%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%3CAdSystem%3E2.0%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%3CAdTitle%3E5748406%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A30%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%20id%3D%22scanscout%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fwww.target.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20height%3D%22396%22%20width%3D%22600%22%20bitrate%3D%22496%22%20type%3D%22video%2Fmp4%22%20delivery%3D%22progressive%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fstatic.applifier.com%2Fimpact%2Fvideos%2F104090%2Fe97394713b8efa50%2F1602-30s-v22r3-seven-knights-character-select%2Fm31-1000.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%09%3C%2FCreative%3E%0A%09%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CCompanionAds%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20height%3D%22250%22%20width%3D%22300%22%20id%3D%22555750%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CHTMLResource%3E%3C!%5BCDATA%5B%3CA%20onClick%3D%22var%20i%3D%20new%20Image(1%2C1)%3B%20i.src%3D%27http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D0%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%27%3B%22%20HREF%3D%22http%3A%2F%2Ftarget.com%22%20target%3D%22_blank%22%3E%0A%3CIMG%20SRC%3D%22http%3A%2F%2Fmedia.scanscout.com%2Fads%2Ftarget300x250Companion.jpg%22%20BORDER%3D0%20WIDTH%3D300%20HEIGHT%3D250%20ALT%3D%22Click%20Here%22%3E%0A%3C%2FA%3E%0A%3Cimg%20src%3D%22http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D1%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%22%20height%3D%221%22%20width%3D%221%22%3E%0A%5D%5D%3E%3C%2FHTMLResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FCompanionAds%3E%0A%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%3C%2FInLine%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E",
                        "tracking": {
                            "click": null,
                            "complete": null,
                            "firstQuartile": null,
                            "midpoint": null,
                            "start": [
                                "http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1"
                            ],
                            "thirdQuartile": null
                        }
                    },
                    "gamerId": "5712983c481291b16e1be03b"
                }`
            };
            return verifyErrorForResponse(response, 'Campaign does not have an impression url');
        });

        it('should bail out when max wrapper depth is reached for a wrapped VAST', () => {

            // given a valid VAST response containing a wrapper
            const response = {
                response: `{
                "abGroup": 3,
                "vast": {
                    "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22602833%22%3E%0A%20%20%3CWrapper%3E%0A%20%20%20%20%3CAdSystem%3EAcudeo%20Compatible%3C%2FAdSystem%3E%0A%20%20%20%20%3CVASTAdTagURI%3Ehttp%3A%2F%2Fdemo.tremormedia.com%2Fproddev%2Fvast%2Fvast_inline_linear.xml%3C%2FVASTAdTagURI%3E%0A%20%20%20%20%3CError%3Ehttp%3A%2F%2FmyErrorURL%2Fwrapper%2Ferror%3C%2FError%3E%0A%20%20%20%20%3CImpression%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fimpression%3C%2FImpression%3E%0A%09%3CCreatives%3E%0A%09%09%3CCreative%20AdID%3D%22602833%22%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22creativeView%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FcreativeView%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22start%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fstart%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22midpoint%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmidpoint%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22firstQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FfirstQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22thirdQuartile%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2FthirdQuartile%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22complete%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fcomplete%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22mute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22unmute%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Funmute%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22pause%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fpause%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22resume%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fresume%3C%2FTracking%3E%0A%09%09%09%09%09%3CTracking%20event%3D%22fullscreen%22%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Ffullscreen%3C%2FTracking%3E%09%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%3E%0A%09%09%09%3CLinear%3E%0A%09%09%09%09%3CVideoClicks%3E%0A%09%09%09%09%09%3CClickTracking%3Ehttp%3A%2F%2FmyTrackingURL%2Fwrapper%2Fclick%3C%2FClickTracking%3E%0A%09%09%09%09%3C%2FVideoClicks%3E%0A%09%09%09%3C%2FLinear%3E%0A%09%09%3C%2FCreative%3E%0A%09%09%3CCreative%20AdID%3D%22602833-NonLinearTracking%22%3E%0A%09%09%09%3CNonLinearAds%3E%0A%09%09%09%09%3CTrackingEvents%3E%0A%09%09%09%09%3C%2FTrackingEvents%3E%0A%09%09%09%3C%2FNonLinearAds%3E%0A%09%09%3C%2FCreative%3E%0A%09%3C%2FCreatives%3E%0A%20%20%3C%2FWrapper%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E%0A",
                    "tracking": {
                        "click": null,
                        "complete": null,
                        "firstQuartile": null,
                        "midpoint": null,
                        "start": [
                            "http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1"
                        ],
                        "thirdQuartile": null
                    }
                },
                "gamerId": "5712983c481291b16e1be03b"
            }`
            };

            // when the parser's max wrapper depth is set to 0 to disallow wrapping
            vastParser.setMaxWrapperDepth(0);

            // then we should get an error because there was no video URL,
            // because the video url would have been in the wrapped xml
            return verifyErrorForResponse(response, 'VAST wrapper depth exceeded');
        });

    });

    let verifyCampaignForResponse = (response: {response: any}) => {
        // given a valid VAST placement
        let mockRequest = sinon.mock(request);
        mockRequest.expects('post').withArgs(
            'https://adserver.unityads.unity3d.com/games/12345/fill?&platform=android&sdkVersion=2.0.0-alpha2&',
            '{"bundleVersion":"2.0.0-test2","bundleId":"com.unity3d.ads.example"}',
            [],
            {
                retries: 5,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }
        ).returns(Promise.resolve(response));

        let campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo, vastParser);
        let triggeredCampaign: Campaign;
        campaignManager.onVastCampaign.subscribe((campaign: Campaign) => {
            triggeredCampaign = campaign;
        });

        // when the campaign manager requests the placement
        return campaignManager.request().then(() => {

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
                    response: `{
                    "abGroup": 3,
                    "vast": {
                        "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22preroll-1%22%3E%0A%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%3CAdSystem%3E2.0%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%3CAdTitle%3E5748406%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%3CImpression%20id%3D%22blah%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fb.scorecardresearch.com%2Fb%3FC1%3D1%26C2%3D6000003%26C3%3D0000000200500000197000000%26C4%3Dus%26C7%3Dhttp%3A%2F%2Fwww.scanscout.com%26C8%3Dscanscout.com%26C9%3Dhttp%3A%2F%2Fwww.scanscout.com%26C10%3Dxn%26rn%3D-103217130%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A30%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%20id%3D%22scanscout%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fwww.target.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20height%3D%22396%22%20width%3D%22600%22%20bitrate%3D%22496%22%20type%3D%22video%2Fmp4%22%20delivery%3D%22progressive%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fstatic.applifier.com%2Fimpact%2Fvideos%2F104090%2Fe97394713b8efa50%2F1602-30s-v22r3-seven-knights-character-select%2Fm31-1000.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%09%3C%2FCreative%3E%0A%09%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CCompanionAds%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20height%3D%22250%22%20width%3D%22300%22%20id%3D%22555750%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CHTMLResource%3E%3C!%5BCDATA%5B%3CA%20onClick%3D%22var%20i%3D%20new%20Image(1%2C1)%3B%20i.src%3D%27http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D0%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%27%3B%22%20HREF%3D%22http%3A%2F%2Ftarget.com%22%20target%3D%22_blank%22%3E%0A%3CIMG%20SRC%3D%22http%3A%2F%2Fmedia.scanscout.com%2Fads%2Ftarget300x250Companion.jpg%22%20BORDER%3D0%20WIDTH%3D300%20HEIGHT%3D250%20ALT%3D%22Click%20Here%22%3E%0A%3C%2FA%3E%0A%3Cimg%20src%3D%22http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D1%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%22%20height%3D%221%22%20width%3D%221%22%3E%0A%5D%5D%3E%3C%2FHTMLResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FCompanionAds%3E%0A%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%3C%2FInLine%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E",
                        "tracking": {
                            "click": null,
                            "complete": null,
                            "firstQuartile": null,
                            "midpoint": null,
                            "start": [
                                "http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1"
                            ],
                            "thirdQuartile": null
                        }
                    },
                    "gamerId": "5712983c481291b16e1be03b"
                }`
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
                response: `{
                    "abGroup": 3,
                    "vast": {
                        "data": "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22preroll-1%22%3E%0A%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%3CAdSystem%3E2.0%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%3CAdTitle%3E5748406%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%3CImpression%20id%3D%22blah%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fb.scorecardresearch.com%2Fb%3FC1%3D1%26C2%3D6000003%26C3%3D0000000200500000197000000%26C4%3Dus%26C7%3Dhttp%3A%2F%2Fwww.scanscout.com%26C8%3Dscanscout.com%26C9%3Dhttp%3A%2F%2Fwww.scanscout.com%26C10%3Dxn%26rn%3D-103217130%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%3CError%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fwww.example.com%5D%5D%3E%3C%2FError%3E%0A%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A30%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%20id%3D%22scanscout%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fwww.target.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20height%3D%22396%22%20width%3D%22600%22%20bitrate%3D%22496%22%20type%3D%22video%2Fmp4%22%20delivery%3D%22progressive%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fstatic.applifier.com%2Fimpact%2Fvideos%2F104090%2Fe97394713b8efa50%2F1602-30s-v22r3-seven-knights-character-select%2Fm31-1000.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%09%3C%2FCreative%3E%0A%09%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CCompanionAds%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20height%3D%22250%22%20width%3D%22300%22%20id%3D%22555750%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CHTMLResource%3E%3C!%5BCDATA%5B%3CA%20onClick%3D%22var%20i%3D%20new%20Image(1%2C1)%3B%20i.src%3D%27http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D0%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%27%3B%22%20HREF%3D%22http%3A%2F%2Ftarget.com%22%20target%3D%22_blank%22%3E%0A%3CIMG%20SRC%3D%22http%3A%2F%2Fmedia.scanscout.com%2Fads%2Ftarget300x250Companion.jpg%22%20BORDER%3D0%20WIDTH%3D300%20HEIGHT%3D250%20ALT%3D%22Click%20Here%22%3E%0A%3C%2FA%3E%0A%3Cimg%20src%3D%22http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D1%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%22%20height%3D%221%22%20width%3D%221%22%3E%0A%5D%5D%3E%3C%2FHTMLResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FCompanionAds%3E%0A%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%3C%2FInLine%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E",
                        "tracking": {
                            "click": null,
                            "complete": null,
                            "firstQuartile": null,
                            "midpoint": null,
                            "start": [
                                "http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1"
                            ],
                            "thirdQuartile": null
                        }
                    },
                    "gamerId": "5712983c481291b16e1be03b"
                }`
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
        deviceInfo = new DeviceInfo();
        vastParser = TestFixtures.getVastParser();
        warningSpy = sinon.spy();
        nativeBridge = <NativeBridge><any>{
            Storage: {
                get:
                    sinon.stub()
                        .onCall(0).returns(Promise.resolve('mediation name'))
                        .onCall(1).returns(Promise.resolve('mediation version'))
                        .onCall(2).returns(Promise.resolve(42)),
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
            getPlatform: () => {
                return Platform.TEST;
            }
        };
        let wakeUpManager = new WakeUpManager(nativeBridge);
        request = new Request(nativeBridge, wakeUpManager);
    });

});
