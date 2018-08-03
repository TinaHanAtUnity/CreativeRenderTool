import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { TestFixtures } from 'Helpers/TestFixtures';
import { Session } from 'Models/Session';
import { SdkApi } from 'Native/Api/Sdk';
import { ProgrammaticVastParser } from 'Parsers/ProgrammaticVastParser';

import ProgrammaticVastCampaignFlat from 'json/campaigns/vast/ProgrammaticVastCampaignFlat.json';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { VastParser } from 'Utilities/VastParser';

describe('ProgrammaticVastParser', () => {
    const placements = ['TestPlacement'];
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    const impressionUrl = 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130';

    let parser: ProgrammaticVastParser;
    let nativeBridge: NativeBridge;
    let request: Request;
    let session: Session;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        (<any>nativeBridge.Sdk) = sinon.createStubInstance(SdkApi);

        request = sinon.createStubInstance(Request);
        session = TestFixtures.getSession();

        parser = new ProgrammaticVastParser();
    });

    describe('parsing a campaign', () => {
        describe('with a proper JSON payload', () => {
            let campaign: VastCampaign;

            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
                    campaign = <VastCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(ProgrammaticVastCampaignFlat));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof VastCampaign, 'Campaign was not an VastCampaign');

                const json = JSON.parse(ProgrammaticVastCampaignFlat);
                const vast = new VastParser().parseVast(decodeURIComponent(json.content));

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                assert.equal(campaign.getVideo().getUrl(), vast.getVideoUrl(), 'Video URL is not the same');
                assert.deepEqual(campaign.getImpressionUrls(), [impressionUrl], 'Impression URL are not the same');
            });
        });
    });
});
