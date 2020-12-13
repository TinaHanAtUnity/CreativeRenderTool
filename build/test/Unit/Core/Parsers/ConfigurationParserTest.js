import { assert } from 'chai';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
describe('CoreConfigurationParserTest', () => {
    let coreConfig;
    describe('Parsing json to configuration', () => {
        beforeEach(() => {
            coreConfig = CoreConfigurationParser.parse(ConfigurationJson);
        });
        it('should have enabled parameter from configuration', () => {
            assert.isTrue(coreConfig.isEnabled());
        });
        it('should have country parameter from configuration', () => {
            assert.equal(coreConfig.getCountry(), 'FI');
        });
        it('should have coppaCompliant parameter from configuration', () => {
            assert.equal(coreConfig.isCoppaCompliant(), false);
        });
        it('should have abGroup parameter from configuration', () => {
            assert.equal(coreConfig.getAbGroup(), 99);
        });
        it('should have properties parameter from configuration', () => {
            assert.equal(coreConfig.getProperties(), 'abcdefgh12345678');
        });
        it('should have projectId parameter from configuration', () => {
            assert.equal(coreConfig.getUnityProjectId(), 'abcd-1234');
        });
        it('should have token parameter from configuration', () => {
            assert.equal(coreConfig.getToken(), 'abcd.1234.5678');
        });
        it('should have organizationId parameter from configuration', () => {
            assert.equal(coreConfig.getOrganizationId(), '5552368');
        });
        it('should have server side test mode false when undefined in config', () => {
            assert.equal(coreConfig.getTestMode(), false);
        });
        it('should have server side test mode true when defined in config', () => {
            coreConfig.set('test', true);
            assert.equal(coreConfig.getTestMode(), true);
        });
        it('should set feature flags to empty array when omitted', () => {
            assert.deepEqual(coreConfig.getFeatureFlags(), []);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlndXJhdGlvblBhcnNlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQ29yZS9QYXJzZXJzL0NvbmZpZ3VyYXRpb25QYXJzZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFHOUIsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFL0UsT0FBTyxpQkFBaUIsTUFBTSxtQ0FBbUMsQ0FBQztBQUNsRSxPQUFPLE9BQU8sQ0FBQztBQUVmLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7SUFFekMsSUFBSSxVQUE2QixDQUFDO0lBRWxDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSxHQUFHLEVBQUU7UUFDM0MsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxrREFBa0QsRUFBRSxHQUFHLEVBQUU7WUFDeEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxrREFBa0QsRUFBRSxHQUFHLEVBQUU7WUFDeEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMseURBQXlELEVBQUUsR0FBRyxFQUFFO1lBQy9ELE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsa0RBQWtELEVBQUUsR0FBRyxFQUFFO1lBQ3hELE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHFEQUFxRCxFQUFFLEdBQUcsRUFBRTtZQUMzRCxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2pFLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLG9EQUFvRCxFQUFFLEdBQUcsRUFBRTtZQUMxRCxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzlELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGdEQUFnRCxFQUFFLEdBQUcsRUFBRTtZQUN0RCxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzFELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHlEQUF5RCxFQUFFLEdBQUcsRUFBRTtZQUMvRCxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGtFQUFrRSxFQUFFLEdBQUcsRUFBRTtZQUN4RSxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsRCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywrREFBK0QsRUFBRSxHQUFHLEVBQUU7WUFDckUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsc0RBQXNELEVBQUUsR0FBRyxFQUFFO1lBQzVELE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9