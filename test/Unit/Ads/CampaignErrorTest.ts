import { assert } from 'chai';
import 'mocha';
import { CampaignError } from 'Ads/Errors/CampaignError';
import { CampaignContentType } from 'Ads/Utilities/CampaignContentType';

describe('CampaignErrorTest', () => {
    it('Should return all chained sub campaigns for getAllCampaignErros', () => {
        // main > sub1 > sub2, (sub3 > sub4)
        const mainCampaignError = new CampaignError('main campaign error', CampaignContentType.ProgrammaticVAST);
        const subCampaignError1 = new CampaignError('sub campaign error 1', CampaignContentType.ProgrammaticVAST);
        const subCampaignError2 = new CampaignError('sub campagin error 2', CampaignContentType.ProgrammaticVAST);
        const subCampaignError3 = new CampaignError('sub campagin error 3', CampaignContentType.ProgrammaticVAST);
        const subCampaignError4 = new CampaignError('sub campaign error 4', CampaignContentType.ProgrammaticVAST);

        mainCampaignError.addSubCampaignError(subCampaignError1);
        subCampaignError1.addSubCampaignError(subCampaignError2);
        subCampaignError1.addSubCampaignError(subCampaignError3);
        subCampaignError3.addSubCampaignError(subCampaignError4);

        assert.deepEqual(subCampaignError3.getAllCampaignErrors(), [subCampaignError3, subCampaignError4], 'sub error 3 should return all chained sub errors');
        assert.deepEqual(subCampaignError2.getAllCampaignErrors(), [subCampaignError2], 'sub error 2 should return itself only');
        assert.deepEqual(subCampaignError1.getAllCampaignErrors(), [subCampaignError1, subCampaignError2, subCampaignError3, subCampaignError4], 'sub error 2 should return itself only');
        assert.deepEqual(mainCampaignError.getAllCampaignErrors(), [mainCampaignError, subCampaignError1, subCampaignError2, subCampaignError3, subCampaignError4], 'main campaign error should return all chained sub errors');
    });
});
