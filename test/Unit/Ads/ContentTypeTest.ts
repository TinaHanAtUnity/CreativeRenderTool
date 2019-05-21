import { assert } from 'chai';
import 'mocha';
import { ContentType, CampaignContentType } from 'Ads/Utilities/CampaignContentType';
import { CampaignParseError } from 'Ads/Utilities/ProgrammaticTrackingService';

describe('ContentTypeTest', () => {

    describe('getCampaignParseError', () => {
        it('should return return the correct value for programmatic vast', () => {
            const value = ContentType.getCampaignParseError(CampaignContentType.ProgrammaticVAST);
            assert.equal(value, CampaignParseError.ProgrammaticVASTParseError);
        });

        it('should return return the correct value for programmatic vast-vpaid', () => {
            const value = ContentType.getCampaignParseError(CampaignContentType.ProgrammaticVPAID);
            assert.equal(value, CampaignParseError.ProgrammaticVPAIDParseError);
        });

        it('should return return the unknown value for nonsense', () => {
            const value = ContentType.getCampaignParseError('country music');
            assert.equal(value, CampaignParseError.UnknownParseError);
        });
    });
});
