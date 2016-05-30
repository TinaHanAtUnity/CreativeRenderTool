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
import { SdkApi } from '../../src/ts/Native/Api/Sdk';
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
            return verifyErrorForResponse(response, 'Campaign does not have a video url');
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

            const sdk = new SdkApi(nativeBridge);
            const mockSdk = sinon.mock(sdk);
            mockSdk.expects('logWarning').withArgs(`Campaign does not have an error url for game id ${clientInfo.getGameId()}`);
            nativeBridge.Sdk = sdk;

            // when the campaign manager requests the placement
            return verifyCampaignForResponse(response).then(() => {

                // then the SDK's logWarning function is called with an appropriate message
                mockSdk.verify();
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

            const sdk = new SdkApi(nativeBridge);
            const mockSdk = sinon.mock(sdk);
            mockSdk.expects('logWarning').never();
            nativeBridge.Sdk = sdk;

            // when the campaign manager requests the placement
            return verifyCampaignForResponse(response).then(() => {

                // then the SDK's logWarning function is called with an appropriate message
                mockSdk.verify();
            });
        });
    });

    beforeEach(() => {
        clientInfo = TestFixtures.getClientInfo();
        deviceInfo = new DeviceInfo();
        vastParser = TestFixtures.getVastParser();
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
                logWarning: sinon.spy()
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
