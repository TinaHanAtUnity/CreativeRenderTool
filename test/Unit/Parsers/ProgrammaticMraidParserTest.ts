import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Common/Native/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Session } from 'Ads/Models/Session';
import { SdkApi } from 'Core/Native/Sdk';
import { ProgrammaticMraidParser } from 'Ads/Parsers/ProgrammaticMraidParser';

import ProgrammaticMRAIDCampaign from 'json/campaigns/mraid/ProgrammaticMRAIDCampaign.json';
import { MRAIDCampaign } from 'Ads/Models/Campaigns/MRAIDCampaign';

describe('ProgrammaticMraidParser', () => {
    const placements = ['TestPlacement'];
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';

    let parser: ProgrammaticMraidParser;
    let nativeBridge: NativeBridge;
    let request: Request;
    let session: Session;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        (<any>nativeBridge.Sdk) = sinon.createStubInstance(SdkApi);

        request = sinon.createStubInstance(Request);
        session = TestFixtures.getSession();

        parser = new ProgrammaticMraidParser();
    });

    describe('parsing a campaign', () => {
        describe('with a proper JSON payload', () => {
            let campaign: MRAIDCampaign;

            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
                    campaign = <MRAIDCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(ProgrammaticMRAIDCampaign));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof MRAIDCampaign, 'Campaign was not an MRAIDCampaign');

                const json = JSON.parse(ProgrammaticMRAIDCampaign);
                const content = JSON.parse(json.content);

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                assert.deepEqual(campaign.getTrackingUrls(), json.trackingUrls, 'Tracking URLs is not equal');
                assert.equal(campaign.getResource()!, decodeURIComponent(content.markup), 'MRAID is not equal');
                assert.equal(campaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
            });
        });
    });
});
