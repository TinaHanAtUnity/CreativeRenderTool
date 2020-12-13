import { MacroUtil } from 'Ads/Utilities/MacroUtil';
describe('MacroUtilTest', () => {
    const macroReplace1 = 'here is to test replacement of {{ CREATIVE_URL }}';
    const macroReplace2 = 'nothing should be replaced here';
    const macroReplace3 = 'here is to test replacement of {{ OMID_IMPLEMENTOR }} and {{ OMID_API_VERSION }}';
    it('should replace CREATIVE_URL correctly', () => {
        expect(MacroUtil.replaceMacro(macroReplace1, { '{{ CREATIVE_URL }}': 'https://cdn.unityads.unity3d.com/playables/production/ios/9innings_23022018/index.html' })).toBe('here is to test replacement of https://cdn.unityads.unity3d.com/playables/production/ios/9innings_23022018/index.html');
    });
    it('should not replace anything', () => {
        expect(MacroUtil.replaceMacro(macroReplace2, { '{{ CREATIVE_URL }}': 'https://cdn.unityads.unity3d.com/playables/production/ios/9innings_23022018/index.html' })).toBe('nothing should be replaced here');
    });
    it('should replace both URLs', () => {
        expect(MacroUtil.replaceMacro(macroReplace3, { '{{ OMID_IMPLEMENTOR }}': 'PARTNER_NAME', '{{ OMID_API_VERSION }}': 'OM_JS_VERSION' })).toBe('here is to test replacement of PARTNER_NAME and OM_JS_VERSION');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFjcm9VdGlsLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1V0aWxpdGllcy9NYWNyb1V0aWwuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFcEQsUUFBUSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7SUFDM0IsTUFBTSxhQUFhLEdBQUcsbURBQW1ELENBQUM7SUFDMUUsTUFBTSxhQUFhLEdBQUcsaUNBQWlDLENBQUM7SUFDeEQsTUFBTSxhQUFhLEdBQUcsa0ZBQWtGLENBQUM7SUFFekcsRUFBRSxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsRUFBRTtRQUM3QyxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSx3RkFBd0YsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUhBQXVILENBQUMsQ0FBQztJQUNwUyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7UUFDbkMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsd0ZBQXdGLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDOU0sQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO1FBQ2hDLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxFQUFFLHdCQUF3QixFQUFFLGNBQWMsRUFBRSx3QkFBd0IsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLCtEQUErRCxDQUFDLENBQUM7SUFDak4sQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9