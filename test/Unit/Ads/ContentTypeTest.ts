import { assert } from 'chai';
import 'mocha';
import { ContentType } from 'Ads/Utilities/CampaignContentType';
import { CampaignParseError } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';

describe('ContentTypeTest', () => {

    const contentTypes: string[] = [ProgrammaticVastParser.ContentType, CometCampaignParser.ContentType];

    before(() => {
        ContentType.initializeContentMapping(contentTypes);
    });

    after(() => {
        // Cleanup after tests
        ContentType.initializeContentMapping([]);
    });

    describe('getCampaignParseError', () => {

        const tests: {
            contentType: string;
            campaignError: CampaignParseError;
        }[] = [{
            contentType: ProgrammaticVastParser.ContentType,
            campaignError: CampaignParseError.ProgrammaticVASTParseError
        },
        {
            contentType: CometCampaignParser.ContentType,
            campaignError: CampaignParseError.CometVideoParseError
        },
        {
            contentType: '-/scooter-/-/-mcdooter',
            campaignError: CampaignParseError.UnknownParseError
        }];

        tests.forEach((t) => {
            it('should return return the correct value for each content type', () => {
                const value = ContentType.getCampaignParseError(t.contentType);
                assert.equal(value, t.campaignError);
            });
        });
    });
});
