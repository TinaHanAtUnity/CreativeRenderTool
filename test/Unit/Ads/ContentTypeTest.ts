import { assert } from 'chai';
import 'mocha';
import { ContentType } from 'Ads/Utilities/CampaignContentType';
import { CampaignParseError } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';

describe('ContentTypeTest', () => {

    before(() => {
        ContentType.initializeContentMapping([ProgrammaticVastParser.ContentType, CometCampaignParser.ContentType]);
    });

    describe('getCampaignParseError', () => {
        it('should return return the correct value for programmatic vast campaigns', () => {
            const value = ContentType.getCampaignParseError(ProgrammaticVastParser.ContentType);
            assert.equal(value, CampaignParseError.ProgrammaticVASTParseError);
        });

        it('should return return the correct value for comet campaigns', () => {
            const value = ContentType.getCampaignParseError(CometCampaignParser.ContentType);
            assert.equal(value, CampaignParseError.CometVideoParseError);
        });

        it('should return return the unknown value for nonsense', () => {
            const value = ContentType.getCampaignParseError('country music');
            assert.equal(value, CampaignParseError.UnknownParseError);
        });
    });
});
