import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { Campaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Session } from 'Models/Session';
import { AdMobCampaign } from 'Models/Campaigns/AdMobCampaign';
import { Platform } from 'Constants/Platform';
import { SdkApi } from 'Native/Api/Sdk';
import { ProgrammaticVPAIDParser } from 'Parsers/ProgrammaticVPAIDParser';

import DisplayStaticInterstitialCampaign from 'json/campaigns/display/DisplayStaticInterstitialCampaign.json';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Url } from 'Utilities/Url';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { VastParser } from 'Utilities/VastParser';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { ProgrammaticStaticInterstitialParser } from 'Parsers/ProgrammaticStaticInterstitialParser';

describe('ProgrammaticVPAIDParser', () => {
    const placements = ['TestPlacement'];
    const gamerId = 'TestGamerId';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    const abGroup = 0;

    let parser: ProgrammaticStaticInterstitialParser;
    let nativeBridge: NativeBridge;
    let request: Request;
    let session: Session;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        (<any>nativeBridge.Sdk) = sinon.createStubInstance(SdkApi);

        request = sinon.createStubInstance(Request);
        session = TestFixtures.getSession();

        parser = new ProgrammaticStaticInterstitialParser(false);
    });

    describe('parsing a campaign', () => {
        describe('with proper XML payload', () => {
            let campaign: DisplayInterstitialCampaign;
            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(nativeBridge, request, response, session, gamerId, abGroup).then((parsedCampaign) => {
                    campaign = <DisplayInterstitialCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(DisplayStaticInterstitialCampaign));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof DisplayInterstitialCampaign, 'Campaign was not an DisplayInterstitialCampaign');

                const json = JSON.parse(DisplayStaticInterstitialCampaign);

                assert.equal(campaign.getGamerId(), gamerId, 'GamerID is not equal');
                assert.equal(campaign.getAbGroup(), abGroup, 'ABGroup is not equal');
                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getDynamicMarkup(), decodeURIComponent(json.content), 'Dynamic Markup is not equal');
            });
        });
    });
});
