System.register(["mocha", "sinon", "chai", "Jaeger/JaegerUtilities"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, JaegerUtilities_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (JaegerUtilities_1_1) {
                JaegerUtilities_1 = JaegerUtilities_1_1;
            }
        ],
        execute: function () {
            describe('JaegerUtilitiesTest', function () {
                var stubbedDateTimestamp = 3333;
                describe('generate timestamp', function () {
                    beforeEach(function () {
                        sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
                    });
                    afterEach(function () {
                        Date.now.restore();
                    });
                    it('should return stubbedDateTimestamp * 1000', function () {
                        chai_1.assert.equal(JaegerUtilities_1.JaegerUtilities.genTimestamp(), 3333000);
                        chai_1.assert.equal(JaegerUtilities_1.JaegerUtilities.genTimestamp(), stubbedDateTimestamp * 1000);
                    });
                });
                describe('on stripQueryAndFragment', function () {
                    var tests = [{
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
                    tests.forEach(function (t) {
                        it('stripQueryAndFragment should ouput url without query or fragment', function () {
                            var urlString = JaegerUtilities_1.JaegerUtilities.stripQueryAndFragment(t.input);
                            chai_1.assert.equal(urlString, t.output);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFlZ2VyVXRpbGl0aWVzVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkphZWdlclV0aWxpdGllc1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQUtBLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRTtnQkFDNUIsSUFBTSxvQkFBb0IsR0FBVyxJQUFJLENBQUM7Z0JBRTFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRTtvQkFDM0IsVUFBVSxDQUFDO3dCQUNQLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUMxRCxDQUFDLENBQUMsQ0FBQztvQkFFSCxTQUFTLENBQUM7d0JBQ1ksSUFBSSxDQUFDLEdBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDMUMsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLDJDQUEyQyxFQUFFO3dCQUM1QyxhQUFNLENBQUMsS0FBSyxDQUFDLGlDQUFlLENBQUMsWUFBWSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQ3RELGFBQU0sQ0FBQyxLQUFLLENBQUMsaUNBQWUsQ0FBQyxZQUFZLEVBQUUsRUFBRSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsQ0FBQztvQkFDOUUsQ0FBQyxDQUFDLENBQUM7Z0JBRVAsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLDBCQUEwQixFQUFFO29CQUNqQyxJQUFNLEtBQUssR0FHTixDQUFDOzRCQUNGLEtBQUssRUFBRSw4Q0FBOEM7NEJBQ3JELE1BQU0sRUFBRSx3QkFBd0I7eUJBQ25DLEVBQUU7NEJBQ0MsS0FBSyxFQUFFLDhDQUE4Qzs0QkFDckQsTUFBTSxFQUFFLHdCQUF3Qjt5QkFDbkMsRUFBRTs0QkFDQyxLQUFLLEVBQUUsb0VBQW9FOzRCQUMzRSxNQUFNLEVBQUUsd0JBQXdCO3lCQUNuQyxFQUFFOzRCQUNDLEtBQUssRUFBRSxvRUFBb0U7NEJBQzNFLE1BQU0sRUFBRSx3QkFBd0I7eUJBQ25DLENBQUMsQ0FBQztvQkFDSCxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBQzt3QkFDWixFQUFFLENBQUMsa0VBQWtFLEVBQUU7NEJBQ25FLElBQU0sU0FBUyxHQUFHLGlDQUFlLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNqRSxhQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3RDLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMifQ==