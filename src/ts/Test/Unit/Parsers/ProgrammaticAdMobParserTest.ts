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

describe('ProgrammaticAdMobParser', () => {
    const placements = ['TestPlacement'];
    const gamerId = 'TestGamerId';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    const abGroup = 0;

    let parser: ProgrammaticAdMobParser;
    let nativeBridge: NativeBridge;
    let request: Request;
    let session: Session;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        (<any>nativeBridge.Sdk) = sinon.createStubInstance(SdkApi);

        request = sinon.createStubInstance(Request);
        (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve('http://s3-us-west-1.amazonaws.com/ads-load-testing/AssetPack1/b30-400.mp4'));

        session = TestFixtures.getSession();

        parser = new ProgrammaticAdMobParser();
    });

    describe('parsing a campaign', () => {
        let campaign: AdMobCampaign;

        const parse = (data: any) => {
            const response = new AuctionResponse(placements, data, mediaId, correlationId);
            return parser.parse(nativeBridge, request, response, session, gamerId, abGroup).then((parsedCampaign) => {
                campaign = <AdMobCampaign>parsedCampaign;
            });
        };

        describe('with a proper JSON payload', () => {

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
