import { Platform } from 'Constants/Platform';
import { AuctionResponse } from 'Models/AuctionResponse';
import { AdMobCampaign } from 'Models/Campaigns/AdMobCampaign';
import { Session } from 'Models/Session';
import { SdkApi } from 'Native/Api/Sdk';
import { NativeBridge } from 'Native/NativeBridge';
import { ProgrammaticAdMobParser } from 'Parsers/ProgrammaticAdMobParser';
import { Request } from 'Utilities/Request';
import { assert } from 'chai';
import ValidAdMobCampaign from 'json/campaigns/admob/ValidAdMobCampaign.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { FileId } from 'Utilities/FileId';

describe('ProgrammaticAdMobParser', () => {
    const placements = ['TestPlacement'];
    const gamerId = 'TestGamerId';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    const abGroup = 0;
    const url = 'https://r2---sn-n4v7knll.googlevideo.com/videoplayback?id=a6e915b5b0f41a1c&itag=22&source=youtube&requiressl=yes&mm=31&mn=sn-n4v7knll&ms=au&mv=m&pl=19&ei=eo3rWuGXD8-KuAL6oLvQAQ&susc=yti&mime=video/mp4&lmt=1518153041357987&mt=1525386488&ip=4.14.109.2&ipbits=0&expire=1525415418&sparams=ip,ipbits,expire,id,itag,source,requiressl,mm,mn,ms,mv,pl,ei,susc,mime,lmt&signature=4834094C1C09F34DE9D6473658D0B1EE75DB3E10.830B2F45714128B27549A3B15E8BE3CB8EFCBE19&key=ck2';
    const urlNoMime = 'https://r2---sn-n4v7knll.googlevideo.com/videoplayback?id=a6e915b5b0f41a1c&itag=22&source=youtube&requiressl=yes&mm=31&mn=sn-n4v7knll&ms=au&mv=m&pl=19&ei=eo3rWuGXD8-KuAL6oLvQAQ&susc=yti&lmt=1518153041357987&mt=1525386488&ip=4.14.109.2&ipbits=0&expire=1525415418&sparams=ip,ipbits,expire,id,itag,source,requiressl,mm,mn,ms,mv,pl,ei,susc,mime,lmt&signature=4834094C1C09F34DE9D6473658D0B1EE75DB3E10.830B2F45714128B27549A3B15E8BE3CB8EFCBE19&key=ck2';

    let parser: ProgrammaticAdMobParser;
    let nativeBridge: NativeBridge;
    let request: Request;
    let session: Session;
    let setFileIdSpy: sinon.SinonSpy;

    describe('parsing a campaign', () => {
        let campaign: AdMobCampaign;

        const parse = (data: any) => {
            const response = new AuctionResponse(placements, data, mediaId, correlationId);
            return parser.parse(nativeBridge, request, response, session, gamerId, abGroup).then((parsedCampaign) => {
                campaign = <AdMobCampaign>parsedCampaign;
            });
        };

        beforeEach(() => {
            nativeBridge = sinon.createStubInstance(NativeBridge);
            (<any>nativeBridge.Sdk) = sinon.createStubInstance(SdkApi);

            request = sinon.createStubInstance(Request);

            session = TestFixtures.getSession();

            parser = new ProgrammaticAdMobParser();
            setFileIdSpy = sinon.spy(FileId, 'setFileID');
        });

        afterEach(() => {
            setFileIdSpy.restore();
        });

        describe('on Android', () => {

            beforeEach(() => {
                (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.ANDROID);
                setFileIdSpy.resetHistory();
            });

            describe('without a mime type in url', () => {

                beforeEach(() => {
                    (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(urlNoMime));
                    return parse(JSON.parse(ValidAdMobCampaign));
                });

                it('should FileId.setFileId without a mp4 mime type', () => {
                    assert.equal(setFileIdSpy.firstCall.args[0], urlNoMime);
                    assert.equal(setFileIdSpy.firstCall.args[1], 'G2KkvNWTNuU'); // videoID
                });
            });

            describe('with a mime type in url', () => {
                beforeEach(() => {
                    (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(url));
                    return parse(JSON.parse(ValidAdMobCampaign));
                });

                it('should FileId.setFileId without a mp4 mime type', () => {
                    assert.equal(setFileIdSpy.firstCall.args[0], url);
                    assert.equal(setFileIdSpy.firstCall.args[1], 'G2KkvNWTNuU'); // videoID
                });
            });

        });

        describe('on iOS', () => {

            beforeEach(() => {
                (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.IOS);
                setFileIdSpy.resetHistory();
            });

            describe('without a mime type in url', () => {

                beforeEach(() => {
                    (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(urlNoMime));
                    return parse(JSON.parse(ValidAdMobCampaign));
                });

                it('should not call FileId.setFileId', () => { // when no mime type should default to streaming
                    assert.isNull(setFileIdSpy.firstCall);
                    assert.equal(setFileIdSpy.callCount, 0);
                });
            });

            describe('with a mime type in url', () => {
                beforeEach(() => {
                    (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(url));
                    return parse(JSON.parse(ValidAdMobCampaign));
                });

                it('should FileId.setFileId with a mp4 mime type', () => {
                    assert.equal(setFileIdSpy.firstCall.args[0], url);
                    assert.equal(setFileIdSpy.firstCall.args[1], 'G2KkvNWTNuU.mp4'); // videoID
                });
            });
        });

        describe('with a proper JSON payload', () => {

            beforeEach(() => {
                (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(url));
            });

            const validateCampaign = () => {
                const json = JSON.parse(ValidAdMobCampaign);
                assert.isNotNull(campaign);
                assert.equal(campaign.getDynamicMarkup(), json.content, 'Markup is not equal');
                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.deepEqual(campaign.getTrackingUrls(), json.trackingUrls, 'Tracking URLs are not equal');
            };

            describe('on Android', () => {
                beforeEach(() => {
                    (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.ANDROID);
                    setFileIdSpy.resetHistory();
                    return parse(JSON.parse(ValidAdMobCampaign));
                });

                it('should have a video cached from the AdMob ad', () => {
                    const assets = campaign.getOptionalAssets();
                    assert.lengthOf(assets, 1, 'Video is not contained within campaign');
                });

                it('should have valid data', validateCampaign);

            });

            describe('on iOS', () => {
                beforeEach(() => {
                    (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.IOS);
                    setFileIdSpy.resetHistory();
                    return parse(JSON.parse(ValidAdMobCampaign));
                });

                it('should have a video cached from the AdMobAd', () => {
                    const assets = campaign.getOptionalAssets();
                    assert.lengthOf(assets, 1, 'Video is not contained within campaign');
                });

                it('should have valid data', validateCampaign);

            });
        });
    });
});
