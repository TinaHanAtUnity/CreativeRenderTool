import { assert } from 'chai';
import 'mocha';
import { CampaignError } from 'Ads/Errors/CampaignError';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
describe('CampaignErrorTest', () => {
    it('Should return all chained sub campaigns for getAllCampaignErros', () => {
        // main > sub1 > sub2, (sub3 > sub4)
        const mainCampaignError = new CampaignError('main campaign error', CampaignContentTypes.ProgrammaticVast);
        const subCampaignError1 = new CampaignError('sub campaign error 1', CampaignContentTypes.ProgrammaticVast);
        const subCampaignError2 = new CampaignError('sub campagin error 2', CampaignContentTypes.ProgrammaticVast);
        const subCampaignError3 = new CampaignError('sub campagin error 3', CampaignContentTypes.ProgrammaticVast);
        const subCampaignError4 = new CampaignError('sub campaign error 4', CampaignContentTypes.ProgrammaticVast);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25FcnJvclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL0NhbXBhaWduRXJyb3JUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsYUFBYSxFQUFzQixNQUFNLDBCQUEwQixDQUFDO0FBQzdFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBRTFFLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7SUFDL0IsRUFBRSxDQUFDLGlFQUFpRSxFQUFFLEdBQUcsRUFBRTtRQUN2RSxvQ0FBb0M7UUFDcEMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzFHLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxhQUFhLENBQUMsc0JBQXNCLEVBQUUsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMzRyxNQUFNLGlCQUFpQixHQUFHLElBQUksYUFBYSxDQUFDLHNCQUFzQixFQUFFLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDM0csTUFBTSxpQkFBaUIsR0FBRyxJQUFJLGFBQWEsQ0FBQyxzQkFBc0IsRUFBRSxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzNHLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxhQUFhLENBQUMsc0JBQXNCLEVBQUUsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUUzRyxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3pELGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDekQsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN6RCxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRXpELE1BQU0sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLEVBQUUsa0RBQWtELENBQUMsQ0FBQztRQUN2SixNQUFNLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLHVDQUF1QyxDQUFDLENBQUM7UUFDekgsTUFBTSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO1FBQ2xMLE1BQU0sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLEVBQUUsMERBQTBELENBQUMsQ0FBQztJQUM1TixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=