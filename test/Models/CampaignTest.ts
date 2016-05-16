/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import { assert } from 'chai';
import { VastParser } from '../../src/ts/Utilities/VastParser';
import * as xmldom from 'xmldom';
import { Campaign } from '../../src/ts/Models/Campaign';


describe('Campaign', () => {

    describe('when created with campaign json', () => {
        it('should have correct data from the json', () => {
            let json = {
                'abGroup': 3,
                'campaign': {
                    'appStoreId': '12345678',
                    'bypassAppSheet': false,
                    'endScreenLandscape': 'dummyEndScreenLandscape',
                    'endScreenPortrait': 'dummyEndScreenPortrait',
                    'gameIcon': 'dummyGameIcon',
                    'gameId': 1234,
                    'gameName': 'dummyGameName',
                    'id': '12345',
                    'rating': '5',
                    'ratingCount': '123456',
                    'trailerDownloadable': 'dummyTrailerDownloadable',
                    'trailerDownloadableSize': 123,
                    'trailerStreaming': 'dummyTrailerStreaming',
                },
                'gamerId': '5712983c481291b16e1be03b'
            };
            let campaign = new Campaign(json.gamerId, json.abGroup, {campaign: json.campaign});
            assert.equal(campaign.getAbGroup(), json.abGroup);
            assert.equal(campaign.getGamerId(), json.gamerId);
            assert.equal(campaign.getAppStoreId(), json.campaign.appStoreId);
            assert.equal(campaign.getLandscapeUrl(), json.campaign.endScreenLandscape);
            assert.equal(campaign.getPortraitUrl(), json.campaign.endScreenPortrait);
            assert.equal(campaign.getGameIcon(), json.campaign.gameIcon);
            assert.equal(campaign.getGameId(), json.campaign.gameId);
            assert.equal(campaign.getGameName(), json.campaign.gameName);
            assert.equal(campaign.getId(), json.campaign.id);
            assert.equal(campaign.getRating(), json.campaign.rating);
            assert.equal(campaign.getRatingCount(), json.campaign.ratingCount);
            assert.equal(campaign.getVast(), null);
        });
    });

    describe('when created with VAST json', () => {
        it('should have correct data from the json', () => {
            let json = {
                'abGroup': 3,
                'vast': {
                    'data': '%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22preroll-1%22%3E%0A%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%3CAdSystem%3E2.0%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%3CAdTitle%3E5748406%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%3CImpression%20id%3D%22blah%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fb.scorecardresearch.com%2Fb%3FC1%3D1%26C2%3D6000003%26C3%3D0000000200500000197000000%26C4%3Dus%26C7%3Dhttp%3A%2F%2Fwww.scanscout.com%26C8%3Dscanscout.com%26C9%3Dhttp%3A%2F%2Fwww.scanscout.com%26C10%3Dxn%26rn%3D-103217130%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A30%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%20id%3D%22scanscout%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fwww.target.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20height%3D%22396%22%20width%3D%22600%22%20bitrate%3D%22496%22%20type%3D%22video%2Fmp4%22%20delivery%3D%22progressive%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fstatic.applifier.com%2Fimpact%2Fvideos%2F104090%2Fe97394713b8efa50%2F1602-30s-v22r3-seven-knights-character-select%2Fm31-1000.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%09%3C%2FCreative%3E%0A%09%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CCompanionAds%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20height%3D%22250%22%20width%3D%22300%22%20id%3D%22555750%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CHTMLResource%3E%3C!%5BCDATA%5B%3CA%20onClick%3D%22var%20i%3D%20new%20Image(1%2C1)%3B%20i.src%3D%27http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D0%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%27%3B%22%20HREF%3D%22http%3A%2F%2Ftarget.com%22%20target%3D%22_blank%22%3E%0A%3CIMG%20SRC%3D%22http%3A%2F%2Fmedia.scanscout.com%2Fads%2Ftarget300x250Companion.jpg%22%20BORDER%3D0%20WIDTH%3D300%20HEIGHT%3D250%20ALT%3D%22Click%20Here%22%3E%0A%3C%2FA%3E%0A%3Cimg%20src%3D%22http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D1%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%22%20height%3D%221%22%20width%3D%221%22%3E%0A%5D%5D%3E%3C%2FHTMLResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FCompanionAds%3E%0A%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%3C%2FInLine%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E',
                    'tracking': {
                        'click': null,
                        'complete': null,
                        'firstQuartile': null,
                        'midpoint': null,
                        'start': [
                            'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'
                        ],
                        'thirdQuartile': null
                    }
                },
                'gamerId': '5712983c481291b16e1be03b'
            };
            let domParser = new xmldom.DOMParser({errorHandler: {}});
            let vastParser = new VastParser(domParser);
            let parsedVast = vastParser.parseVast(json.vast);
            let campaign = new Campaign(json.gamerId, json.abGroup, {vast: parsedVast});
            assert.equal(campaign.getAbGroup(), json.abGroup);
            assert.equal(campaign.getGamerId(), json.gamerId);
            assert.equal(campaign.getAppStoreId(), null);
            assert.equal(campaign.getLandscapeUrl(), null);
            assert.equal(campaign.getPortraitUrl(), null);
            assert.equal(campaign.getGameIcon(), null);
            assert.equal(campaign.getGameId(), null);
            assert.equal(campaign.getGameName(), null);
            assert.equal(campaign.getId(), null);
            assert.equal(campaign.getRating(), null);
            assert.equal(campaign.getRatingCount(), null);
            const vast = campaign.getVast();
            assert.equal(1, vast.getAds().length);
            assert.deepEqual(vast.getImpressionUrls(), [
                'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130'
            ], 'impression urls');
            assert.deepEqual(vast.getTrackingEventUrls('start'), [
                'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'
            ], 'start tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls('firstQuartile'), [], 'first quartile tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls('midpoint'), [], 'midpoint tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls('thirdQuartile'), [], 'third quartile tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls('complete'), [], 'complete tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls('mute'), [], 'mute tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls('unmute'), [], 'unmute tracking event urls');
            assert.equal(vast.getVideoUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4', 'video url');
            assert.equal(vast.getDuration(), 30, 'duration');
            assert.deepEqual(vast.getErrorURLTemplates(), [], 'error urls');
        });

        it('should return cached video url when set', () => {
            let json = {
                'abGroup': 3,
                'vast': {
                    'data': '%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22preroll-1%22%3E%0A%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%3CAdSystem%3E2.0%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%3CAdTitle%3E5748406%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%3CImpression%20id%3D%22blah%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fb.scorecardresearch.com%2Fb%3FC1%3D1%26C2%3D6000003%26C3%3D0000000200500000197000000%26C4%3Dus%26C7%3Dhttp%3A%2F%2Fwww.scanscout.com%26C8%3Dscanscout.com%26C9%3Dhttp%3A%2F%2Fwww.scanscout.com%26C10%3Dxn%26rn%3D-103217130%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A30%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%20id%3D%22scanscout%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fwww.target.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20height%3D%22396%22%20width%3D%22600%22%20bitrate%3D%22496%22%20type%3D%22video%2Fmp4%22%20delivery%3D%22progressive%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fstatic.applifier.com%2Fimpact%2Fvideos%2F104090%2Fe97394713b8efa50%2F1602-30s-v22r3-seven-knights-character-select%2Fm31-1000.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%09%3C%2FCreative%3E%0A%09%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CCompanionAds%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20height%3D%22250%22%20width%3D%22300%22%20id%3D%22555750%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CHTMLResource%3E%3C!%5BCDATA%5B%3CA%20onClick%3D%22var%20i%3D%20new%20Image(1%2C1)%3B%20i.src%3D%27http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D0%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%27%3B%22%20HREF%3D%22http%3A%2F%2Ftarget.com%22%20target%3D%22_blank%22%3E%0A%3CIMG%20SRC%3D%22http%3A%2F%2Fmedia.scanscout.com%2Fads%2Ftarget300x250Companion.jpg%22%20BORDER%3D0%20WIDTH%3D300%20HEIGHT%3D250%20ALT%3D%22Click%20Here%22%3E%0A%3C%2FA%3E%0A%3Cimg%20src%3D%22http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D1%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%22%20height%3D%221%22%20width%3D%221%22%3E%0A%5D%5D%3E%3C%2FHTMLResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FCompanionAds%3E%0A%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%3C%2FInLine%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E',
                    'tracking': {
                        'click': null,
                        'complete': null,
                        'firstQuartile': null,
                        'midpoint': null,
                        'start': [
                            'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'
                        ],
                        'thirdQuartile': null
                    }
                },
                'gamerId': '5712983c481291b16e1be03b'
            };
            let domParser = new xmldom.DOMParser({errorHandler: {}});
            let vastParser = new VastParser(domParser);
            let parsedVast = vastParser.parseVast(json.vast);
            let campaign = new Campaign(json.gamerId, json.abGroup, {vast: parsedVast});
            campaign.setVideoUrl('file://some/cache/path.mp4');
            assert.equal(campaign.getVideoUrl(), 'file://some/cache/path.mp4');
        });
    });
});