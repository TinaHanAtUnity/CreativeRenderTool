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
        ContentType.initializeContentMapping([]);
    });

    describe('getCampaignParseError', () => {
        [{
            contentType: ProgrammaticVastParser.ContentType,
            campaignError: CampaignParseError.ProgrammaticVASTParseError
        },
        {
            contentType: CometCampaignParser.ContentType,
            campaignError: CampaignParseError.CometVideoParseError
        },
        {
            contentType: '-/-/-/countrymusic',
            campaignError: CampaignParseError.UnknownParseError
        }].forEach((test) => {
            it('should return return the correct value for programmatic vast campaigns', () => {
                const value = ContentType.getCampaignParseError(test.contentType);
                assert.equal(value, test.campaignError);
            });
        });
    });
});
