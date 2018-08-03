System.register(["mocha", "chai", "Utilities/JsonParser"], function (exports_1, context_1) {
    "use strict";
    var chai_1, JsonParser_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (JsonParser_1_1) {
                JsonParser_1 = JsonParser_1_1;
            }
        ],
        execute: function () {
            describe('JsonParserTest', function () {
                it('should contain diagnostic fields', function () {
                    try {
                        JsonParser_1.JsonParser.parse('bad content');
                    }
                    catch (e) {
                        // tslint:disable:no-string-literal
                        chai_1.assert.equal(e.diagnostic['json'], 'bad content');
                        // tslint:enable:no-string-literal
                    }
                });
                it('should work just like JSON.parse on happy case', function () {
                    chai_1.assert.deepEqual(JsonParser_1.JsonParser.parse('{}'), {});
                    chai_1.assert.equal(JsonParser_1.JsonParser.parse('true'), true);
                    chai_1.assert.deepEqual(JsonParser_1.JsonParser.parse('[1, 5, "false"]'), [1, 5, 'false']);
                    chai_1.assert.equal(JsonParser_1.JsonParser.parse('null'), null);
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSnNvblBhcnNlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKc29uUGFyc2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O1lBS0EsUUFBUSxDQUFDLGdCQUFnQixFQUFFO2dCQUN2QixFQUFFLENBQUMsa0NBQWtDLEVBQUU7b0JBQ25DLElBQUk7d0JBQ0EsdUJBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7cUJBQ25DO29CQUFDLE9BQU0sQ0FBQyxFQUFFO3dCQUNQLG1DQUFtQzt3QkFDbkMsYUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO3dCQUNsRCxrQ0FBa0M7cUJBQ3JDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxnREFBZ0QsRUFBRTtvQkFDakQsYUFBTSxDQUFDLFNBQVMsQ0FBQyx1QkFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDN0MsYUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDN0MsYUFBTSxDQUFDLFNBQVMsQ0FBQyx1QkFBVSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUN2RSxhQUFNLENBQUMsS0FBSyxDQUFDLHVCQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNqRCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=