System.register(["mocha", "chai", "json/DummyPromoCampaign.json", "Test/Unit/TestHelpers/TestFixtures"], function (exports_1, context_1) {
    "use strict";
    var chai_1, DummyPromoCampaign_json_1, TestFixtures_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (DummyPromoCampaign_json_1_1) {
                DummyPromoCampaign_json_1 = DummyPromoCampaign_json_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            }
        ],
        execute: function () {
            describe('PromoCampaign', function () {
                describe('when created with campaign json', function () {
                    it('should have correct data from the json', function () {
                        var json = JSON.parse(DummyPromoCampaign_json_1.default);
                        var campaign = TestFixtures_1.TestFixtures.getPromoCampaign();
                        chai_1.assert.equal(campaign.getId(), json.promo.id);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbW9DYW1wYWlnblRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQcm9tb0NhbXBhaWduVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBT0EsUUFBUSxDQUFDLGVBQWUsRUFBRTtnQkFFdEIsUUFBUSxDQUFDLGlDQUFpQyxFQUFFO29CQUN4QyxFQUFFLENBQUMsd0NBQXdDLEVBQUU7d0JBQ3pDLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsaUNBQVUsQ0FBQyxDQUFDO3dCQUNwQyxJQUFNLFFBQVEsR0FBRywyQkFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUM7d0JBRWpELGFBQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ2xELENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMifQ==