import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { TestFixtures } from 'Helpers/TestFixtures';
import { Session } from 'Models/Session';
import { SdkApi } from 'Native/Api/Sdk';
import { ProgrammaticVPAIDParser } from 'Parsers/ProgrammaticVPAIDParser';

import ProgrammaticVPAIDCampaign from 'json/campaigns/vpaid/ProgrammaticVPAIDCampaign.json';
import { VastParser } from 'Utilities/VastParser';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';

describe('ProgrammaticVPAIDParser', () => {
    const placements = ['TestPlacement'];
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';

    let parser: ProgrammaticVPAIDParser;
    let nativeBridge: NativeBridge;
    let request: Request;
    let session: Session;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        (<any>nativeBridge.Sdk) = sinon.createStubInstance(SdkApi);

        request = sinon.createStubInstance(Request);
        session = TestFixtures.getSession();

        parser = new ProgrammaticVPAIDParser();
    });

    describe('parsing a campaign', () => {
        describe('with proper XML payload', () => {
            let campaign: VPAIDCampaign;
            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
                    campaign = <VPAIDCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(ProgrammaticVPAIDCampaign));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof VPAIDCampaign, 'Campaign was not an VPAIDCampaign');

                const json = JSON.parse(ProgrammaticVPAIDCampaign);
                const vast = new VastParser().parseVast(decodeURIComponent(json.content));

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getVPAID().getScriptUrl(), 'https://fake-ads-backend.applifier.info/get_file/js/vpaid_sample.js', 'Script URL is not equal');
            });
        });
    });
});
