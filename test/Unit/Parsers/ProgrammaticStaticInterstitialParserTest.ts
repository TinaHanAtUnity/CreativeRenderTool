import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Common/Native/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Session } from 'Ads/Models/Session';
import { SdkApi } from 'Common/Native/Api/Sdk';
import { ProgrammaticVPAIDParser } from 'Ads/Parsers/ProgrammaticVPAIDParser';

import DisplayStaticInterstitialCampaignHTML from 'json/campaigns/display/DisplayStaticInterstitialCampaignHTML.json';
import DisplayStaticInterstitialCampaignJS from 'json/campaigns/display/DisplayStaticInterstitialCampaignJS.json';
import { DisplayInterstitialCampaign } from 'Ads/Models/Campaigns/DisplayInterstitialCampaign';
import { ProgrammaticStaticInterstitialParser } from 'Ads/Parsers/ProgrammaticStaticInterstitialParser';

describe('ProgrammaticVPAIDParser', () => {
    const placements = ['TestPlacement'];
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';

    let parser: ProgrammaticStaticInterstitialParser;
    let nativeBridge: NativeBridge;
    let request: Request;
    let session: Session;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        (<any>nativeBridge.Sdk) = sinon.createStubInstance(SdkApi);

        request = sinon.createStubInstance(Request);
        session = TestFixtures.getSession();
    });

    describe('parsing an HTML campaign', () => {

        beforeEach(() => {
            parser = new ProgrammaticStaticInterstitialParser(false);
        });

        describe('with proper HTML payload', () => {
            let campaign: DisplayInterstitialCampaign;
            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
                    campaign = <DisplayInterstitialCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(DisplayStaticInterstitialCampaignHTML));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof DisplayInterstitialCampaign, 'Campaign was not an DisplayInterstitialCampaign');

                const json = JSON.parse(DisplayStaticInterstitialCampaignHTML);

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getDynamicMarkup(), decodeURIComponent(json.content), 'Dynamic Markup is not equal');
            });
        });
    });

    describe('parsing a JS campaign', () => {
        beforeEach(() => {
            parser = new ProgrammaticStaticInterstitialParser(true);
        });

        describe('with proper JS payload', () => {
            let campaign: DisplayInterstitialCampaign;
            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
                    campaign = <DisplayInterstitialCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(DisplayStaticInterstitialCampaignJS));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof DisplayInterstitialCampaign, 'Campaign was not an DisplayInterstitialCampaign');

                const json = JSON.parse(DisplayStaticInterstitialCampaignJS);

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getDynamicMarkup(), '<script>' + decodeURIComponent(json.content) + '</script>', 'Dynamic Markup is not equal');
            });
        });
    });
});
