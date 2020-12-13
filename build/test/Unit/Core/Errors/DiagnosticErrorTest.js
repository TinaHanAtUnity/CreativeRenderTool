import { assert } from 'chai';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import 'mocha';
describe('DiagnosticErrorTest', () => {
    describe('with existing error', () => {
        let originalError;
        before(() => {
            originalError = new SyntaxError('foo message');
        });
        it('should contain original fields', () => {
            const diagnosticError = new DiagnosticError(originalError, {});
            assert.equal(diagnosticError.name, 'SyntaxError');
            assert.equal(diagnosticError.message, 'foo message');
            assert.equal(diagnosticError.stack, originalError.stack);
        });
        it('should contain the diagnostic data', () => {
            const diagnosticError = new DiagnosticError(originalError, { foo: 'foo1', bar: 'bar2' });
            // tslint:disable:no-string-literal
            assert.equal(diagnosticError.diagnostic['foo'], 'foo1');
            assert.equal(diagnosticError.diagnostic['bar'], 'bar2');
            // tslint:enable:no-string-literal
        });
        it('should serialize correctly', () => {
            const diagnosticError = new DiagnosticError(originalError, { foo: 'foo1', bar: 'bar2' });
            const result = JSON.stringify(diagnosticError);
            assert.notEqual(result.indexOf('"name":"SyntaxError"'), -1);
            assert.notEqual(result.indexOf('"message":"foo message"'), -1);
            assert.notEqual(result.indexOf('"diagnostic":{"foo":"foo1","bar":"bar2"}'), -1);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlhZ25vc3RpY0Vycm9yVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9Db3JlL0Vycm9ycy9EaWFnbm9zdGljRXJyb3JUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzlELE9BQU8sT0FBTyxDQUFDO0FBRWYsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtJQUNqQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO1FBQ2pDLElBQUksYUFBb0IsQ0FBQztRQUV6QixNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ1IsYUFBYSxHQUFHLElBQUksV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtZQUN0QyxNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQWUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFL0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLEdBQUcsRUFBRTtZQUMxQyxNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQWUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBRXpGLG1DQUFtQztZQUNuQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDeEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3hELGtDQUFrQztRQUN0QyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7WUFDbEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxlQUFlLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUN6RixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRS9DLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BGLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9