System.register(["mocha", "sinon", "chai", "Utilities/MetaData", "../TestHelpers/TestFixtures", "Utilities/TestEnvironment"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, MetaData_1, TestFixtures_1, TestEnvironment_1;
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
            function (MetaData_1_1) {
                MetaData_1 = MetaData_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (TestEnvironment_1_1) {
                TestEnvironment_1 = TestEnvironment_1_1;
            }
        ],
        execute: function () {
            describe('MetaDataTest', function () {
                var metaData;
                beforeEach(function () {
                    metaData = new MetaData_1.MetaData(TestFixtures_1.TestFixtures.getNativeBridge());
                    sinon.stub(metaData, 'getKeys').returns(Promise.resolve(['testNumber']));
                    sinon.stub(metaData, 'get')
                        .withArgs('test.clearTestMetaData').returns(Promise.resolve([false, undefined]))
                        .withArgs('test.testNumber').returns(Promise.resolve([true, 1234]));
                });
                it('should get defined number', function () {
                    return TestEnvironment_1.TestEnvironment.setup(metaData).then(function () {
                        chai_1.assert.equal(1234, TestEnvironment_1.TestEnvironment.get('testNumber'), 'test metadata number does not match');
                    });
                });
                it('should not get undefined number', function () {
                    return TestEnvironment_1.TestEnvironment.setup(metaData).then(function () {
                        chai_1.assert.isUndefined(TestEnvironment_1.TestEnvironment.get('undefinedNumber'), 'undefined test metadata found');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdEVudmlyb25tZW50VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRlc3RFbnZpcm9ubWVudFRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQVFBLFFBQVEsQ0FBQyxjQUFjLEVBQUU7Z0JBQ3JCLElBQUksUUFBa0IsQ0FBQztnQkFFdkIsVUFBVSxDQUFDO29CQUNQLFFBQVEsR0FBRyxJQUFJLG1CQUFRLENBQUMsMkJBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO29CQUV4RCxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekUsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDO3lCQUN0QixRQUFRLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO3lCQUMvRSxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVFLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQywyQkFBMkIsRUFBRTtvQkFDNUIsT0FBTyxpQ0FBZSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBQ3hDLGFBQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLGlDQUFlLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLHFDQUFxQyxDQUFDLENBQUM7b0JBQ2pHLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRTtvQkFDbEMsT0FBTyxpQ0FBZSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBQ3hDLGFBQU0sQ0FBQyxXQUFXLENBQUMsaUNBQWUsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO29CQUNoRyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=