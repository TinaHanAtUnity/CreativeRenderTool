import 'mocha';
import { assert } from 'chai';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
describe('VastValidatorTest', () => {
    describe('invalidUrlError', () => {
        it('should fill in description and url', () => {
            const error = VastValidationUtilities.invalidUrlError('test description', 'http://google.com');
            assert.equal(error.message, 'VAST test description contains invalid url("http://google.com")');
        });
    });
    describe('formatErrors', () => {
        it('should format empty error array correctly', () => {
            const message = VastValidationUtilities.formatErrors([]);
            assert.equal(message, '');
        });
        it('should format error array with one element correctly', () => {
            const message = VastValidationUtilities.formatErrors([
                new Error('first')
            ]);
            assert.equal(message, 'first');
        });
        it('should format error array with two elements correctly', () => {
            const message = VastValidationUtilities.formatErrors([
                new Error('first'),
                new Error('second')
            ]);
            assert.equal(message, 'first\n    second');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFZhbGlkYXRpb25VdGlsaXRpZXNUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1ZBU1QvVmFsaWRhdG9yL1Zhc3RWYWxpZGF0aW9uVXRpbGl0aWVzVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFFbEYsUUFBUSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtJQUMvQixRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO1FBQzdCLEVBQUUsQ0FBQyxvQ0FBb0MsRUFBRSxHQUFHLEVBQUU7WUFDMUMsTUFBTSxLQUFLLEdBQUcsdUJBQXVCLENBQUMsZUFBZSxDQUFDLGtCQUFrQixFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFDL0YsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGlFQUFpRSxDQUFDLENBQUM7UUFDbkcsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1FBQzFCLEVBQUUsQ0FBQywyQ0FBMkMsRUFBRSxHQUFHLEVBQUU7WUFDakQsTUFBTSxPQUFPLEdBQUcsdUJBQXVCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHNEQUFzRCxFQUFFLEdBQUcsRUFBRTtZQUM1RCxNQUFNLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyxZQUFZLENBQUM7Z0JBQ2pELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQzthQUNyQixDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyx1REFBdUQsRUFBRSxHQUFHLEVBQUU7WUFDN0QsTUFBTSxPQUFPLEdBQUcsdUJBQXVCLENBQUMsWUFBWSxDQUFDO2dCQUNqRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUM7Z0JBQ2xCLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQzthQUN0QixDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9