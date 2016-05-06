import * as sinon from 'sinon';

import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import * as xmldom from 'xmldom';
import { Campaign } from '../../src/ts/Models/Campaign';
import { Placement } from '../../src/ts/Models/Placement';
import { ClientInfo } from '../../src/ts/Models/ClientInfo';
import { DeviceInfo } from '../../src/ts/Models/DeviceInfo';
import { Request } from '../../src/ts/Utilities/Request';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { CampaignManager } from '../../src/ts/Managers/CampaignManager';
import { assert } from 'chai';
import { VastParser } from '../../src/ts/Utilities/VastParser';

describe('CampaignManagerTest', () => {
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let nativeBridge: NativeBridge;
    let request: Request;

    it('should trigger onCampaign after requesting a valid vast placement', () => {

        // given a valid VAST placement
        let mockRequest = sinon.mock(request);
        mockRequest.expects('get').withArgs('https://adserver.unityads.unity3d.com/games/12345/placements/fooId/fill?bundleVersion=2.0.0-test2&bundleId=com.unity3d.ads.example&gameId=12345&hardwareVersion=undefined%20undefined&platform=android&sdkVersion=2.0.0-alpha2&placementId=fooId&', [], 5, 5000).returns(Promise.resolve({
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

        let campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo);
        let triggeredPlacement: Placement;
        let triggeredCampaign: Campaign;
        campaignManager.onCampaign.subscribe((placement: Placement, campaign: Campaign) => {
            triggeredPlacement = placement;
            triggeredCampaign = campaign;
        });
        const placement = TestFixtures.getPlacement();

        // when the campaign manager requests the placement
        return campaignManager.request(placement).then(() => {

            // then the onCampaign observable is triggered with the correct campaign data
            mockRequest.verify();
            assert.deepEqual(triggeredPlacement, placement);
            assert.equal(triggeredCampaign.getAbGroup(), 3);
            assert.equal(triggeredCampaign.getGamerId(), '5712983c481291b16e1be03b');
            assert.equal(triggeredCampaign.getVideoUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
        });
    });

    let verifyErrorForResponse = (response: any, expectedErrorMessage: string) => {
        // given a VAST placement with invalid XML
        let mockRequest = sinon.mock(request);
        mockRequest.expects('get').withArgs('https://adserver.unityads.unity3d.com/games/12345/placements/fooId/fill?bundleVersion=2.0.0-test2&bundleId=com.unity3d.ads.example&gameId=12345&hardwareVersion=undefined%20undefined&platform=android&sdkVersion=2.0.0-alpha2&placementId=fooId&', [], 5, 5000).returns(Promise.resolve(response));

        let campaignManager = new CampaignManager(nativeBridge, request, clientInfo, deviceInfo);
        let triggeredError: Error;
        campaignManager.onError.subscribe((error: Error) => {
            triggeredError = error;
        });
        const placement = TestFixtures.getPlacement();

        // when the campaign manager requests the placement
        return campaignManager.request(placement).then(() => {

            // then the onError observable is triggered with an appropriate error
            mockRequest.verify();
            assert.equal(triggeredError.message, expectedErrorMessage);
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

        it('should trigger onError after requesting a vast placement with no vast data', () => {
            const response = {
                response: `{
                    "abGroup": 3,
                    "vast": null,
                    "gamerId": "5712983c481291b16e1be03b"
                }`
            };
            return verifyErrorForResponse(response, 'Campaign and VAST data is missing');
        });

        it('should trigger onError after requesting a vast placement without a video url', () => {
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
    });

    beforeEach(() => {
        clientInfo = TestFixtures.getClientInfo();
        deviceInfo = new DeviceInfo();
        let domParser = new xmldom.DOMParser({errorHandler: {}});
        Campaign.vastParser = new VastParser(domParser);
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
            }
        };
        request = new Request(nativeBridge);
    });

});
