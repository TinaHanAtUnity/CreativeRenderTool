import { assert } from 'chai';
import 'mocha';
import { ContentType, CampaignContentType } from 'Ads/Utilities/CampaignContentType';
import { CampaignParseError } from 'Ads/Utilities/ProgrammaticTrackingService';

describe('ContentTypeTest', () => {

    const contentTypes: string[] = [CampaignContentType.ProgrammaticVAST,
                                    CampaignContentType.CometVideo,
                                    CampaignContentType.ProgrammaticAdmobVideo];

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
            contentType: CampaignContentType.ProgrammaticVAST,
            campaignError: CampaignParseError.ProgrammaticVASTParseError
        },
        {
            contentType: CampaignContentType.CometVideo,
            campaignError: CampaignParseError.CometVideoParseError
        },
        {
            contentType: CampaignContentType.ProgrammaticAdmobVideo,
            campaignError: CampaignParseError.ProgrammaticAdmobVideoParseError
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
