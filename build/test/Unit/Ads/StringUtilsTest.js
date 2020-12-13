import { assert } from 'chai';
import 'mocha';
import { StringUtils } from 'Ads/Utilities/StringUtils';
describe('StringUtilsTest', () => {
    it('startWithHTMLTag', () => {
        const s1 = '<script src=\"https://abcd.com\">hello world</script>';
        assert.equal(StringUtils.startWithHTMLTag(s1), true, 'Should return true when a string starts as any html tag');
        const s2 = 'window.open(\'hello\')';
        assert.equal(StringUtils.startWithHTMLTag(s2), false, 'Should return false when a string is not wrapped with any html tag');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaW5nVXRpbHNUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Fkcy9TdHJpbmdVdGlsc1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV4RCxRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO0lBQzdCLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7UUFDeEIsTUFBTSxFQUFFLEdBQUcsdURBQXVELENBQUM7UUFDbkUsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLHlEQUF5RCxDQUFDLENBQUM7UUFFaEgsTUFBTSxFQUFFLEdBQUcsd0JBQXdCLENBQUM7UUFDcEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLG9FQUFvRSxDQUFDLENBQUM7SUFDaEksQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9