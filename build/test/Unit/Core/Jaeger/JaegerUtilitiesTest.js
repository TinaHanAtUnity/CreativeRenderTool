import { assert } from 'chai';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
import 'mocha';
import * as sinon from 'sinon';
describe('JaegerUtilitiesTest', () => {
    const stubbedDateTimestamp = 3333;
    describe('generate timestamp', () => {
        beforeEach(() => {
            sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
        });
        afterEach(() => {
            Date.now.restore();
        });
        it('should return stubbedDateTimestamp * 1000', () => {
            assert.equal(JaegerUtilities.genTimestamp(), 3333000);
            assert.equal(JaegerUtilities.genTimestamp(), stubbedDateTimestamp * 1000);
        });
    });
    describe('on stripQueryAndFragment', () => {
        const tests = [{
                input: 'http://google.com/test?key=value&hello=world',
                output: 'http://google.com/test'
            }, {
                input: 'http://google.com/test#key=value&hello=world',
                output: 'http://google.com/test'
            }, {
                input: 'http://google.com/test?key=value&hello=world#more=things,4&to=test',
                output: 'http://google.com/test'
            }, {
                input: 'http://google.com/test#more=things,4&to=test?key=value&hello=world',
                output: 'http://google.com/test'
            }];
        tests.forEach((t) => {
            it('stripQueryAndFragment should ouput url without query or fragment', () => {
                const urlString = JaegerUtilities.stripQueryAndFragment(t.input);
                assert.equal(urlString, t.output);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFlZ2VyVXRpbGl0aWVzVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9Db3JlL0phZWdlci9KYWVnZXJVdGlsaXRpZXNUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzlELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFL0IsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtJQUNqQyxNQUFNLG9CQUFvQixHQUFXLElBQUksQ0FBQztJQUUxQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1FBQ2hDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMxRCxDQUFDLENBQUMsQ0FBQztRQUVILFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDTyxJQUFJLENBQUMsR0FBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLDJDQUEyQyxFQUFFLEdBQUcsRUFBRTtZQUNqRCxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsRUFBRSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM5RSxDQUFDLENBQUMsQ0FBQztJQUVQLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtRQUN0QyxNQUFNLEtBQUssR0FHTCxDQUFDO2dCQUNILEtBQUssRUFBRSw4Q0FBOEM7Z0JBQ3JELE1BQU0sRUFBRSx3QkFBd0I7YUFDbkMsRUFBRTtnQkFDQyxLQUFLLEVBQUUsOENBQThDO2dCQUNyRCxNQUFNLEVBQUUsd0JBQXdCO2FBQ25DLEVBQUU7Z0JBQ0MsS0FBSyxFQUFFLG9FQUFvRTtnQkFDM0UsTUFBTSxFQUFFLHdCQUF3QjthQUNuQyxFQUFFO2dCQUNDLEtBQUssRUFBRSxvRUFBb0U7Z0JBQzNFLE1BQU0sRUFBRSx3QkFBd0I7YUFDbkMsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2hCLEVBQUUsQ0FBQyxrRUFBa0UsRUFBRSxHQUFHLEVBQUU7Z0JBQ3hFLE1BQU0sU0FBUyxHQUFHLGVBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pFLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9