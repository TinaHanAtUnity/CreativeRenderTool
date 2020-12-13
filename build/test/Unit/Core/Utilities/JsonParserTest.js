import { assert } from 'chai';
import { JsonParser } from 'Core/Utilities/JsonParser';
import 'mocha';
describe('JsonParserTest', () => {
    it('should contain diagnostic fields', () => {
        try {
            JsonParser.parse('bad content');
        }
        catch (e) {
            // tslint:disable:no-string-literal
            assert.equal(e.diagnostic['json'], 'bad content');
            // tslint:enable:no-string-literal
        }
    });
    it('should work just like JSON.parse on happy case', () => {
        assert.deepEqual(JsonParser.parse('{}'), {});
        assert.equal(JsonParser.parse('true'), true);
        assert.deepEqual(JsonParser.parse('[1, 5, "false"]'), [1, 5, 'false']);
        assert.equal(JsonParser.parse('null'), null);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSnNvblBhcnNlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQ29yZS9VdGlsaXRpZXMvSnNvblBhcnNlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU5QixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdkQsT0FBTyxPQUFPLENBQUM7QUFFZixRQUFRLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO0lBQzVCLEVBQUUsQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLEVBQUU7UUFDeEMsSUFBSTtZQUNBLFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDbkM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLG1DQUFtQztZQUNuQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDbEQsa0NBQWtDO1NBQ3JDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsZ0RBQWdELEVBQUUsR0FBRyxFQUFFO1FBQ3RELE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3QyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0MsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDdkUsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==