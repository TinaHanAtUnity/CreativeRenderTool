System.register(["mocha", "chai", "Utilities/GameSessionCounters", "../TestHelpers/TestFixtures"], function (exports_1, context_1) {
    "use strict";
    var chai_1, GameSessionCounters_1, TestFixtures_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (GameSessionCounters_1_1) {
                GameSessionCounters_1 = GameSessionCounters_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            }
        ],
        execute: function () {
            describe('GameSessionCountersTest', function () {
                var videoCampaign = TestFixtures_1.TestFixtures.getCampaign();
                var cometPlayableCampaign = TestFixtures_1.TestFixtures.getPlayableMRAIDCampaign();
                beforeEach(function () {
                    GameSessionCounters_1.GameSessionCounters.init();
                });
                it('should return the DTO in right format', function () {
                    GameSessionCounters_1.GameSessionCounters.addAdRequest();
                    GameSessionCounters_1.GameSessionCounters.addStart(videoCampaign);
                    var countersDTO = GameSessionCounters_1.GameSessionCounters.getDTO();
                    chai_1.assert.equal(countersDTO.starts, 1);
                    chai_1.assert.equal(countersDTO.adRequests, 1);
                    chai_1.assert.equal(countersDTO.views, 0);
                    chai_1.assert.equal(countersDTO.startsPerCampaign[videoCampaign.getId()], 1);
                    chai_1.assert.equal(countersDTO.startsPerTarget[videoCampaign.getGameId()], 1);
                    chai_1.assert.equal(countersDTO.viewsPerCampaign[videoCampaign.getId()], undefined);
                    chai_1.assert.equal(countersDTO.viewsPerTarget[videoCampaign.getGameId()], undefined);
                    GameSessionCounters_1.GameSessionCounters.addAdRequest();
                    GameSessionCounters_1.GameSessionCounters.addView(videoCampaign);
                    GameSessionCounters_1.GameSessionCounters.addStart(videoCampaign);
                    countersDTO = GameSessionCounters_1.GameSessionCounters.getDTO();
                    chai_1.assert.equal(countersDTO.starts, 2);
                    chai_1.assert.equal(countersDTO.adRequests, 2);
                    chai_1.assert.equal(countersDTO.views, 1);
                    chai_1.assert.equal(countersDTO.startsPerCampaign[videoCampaign.getId()], 2);
                    chai_1.assert.equal(countersDTO.startsPerTarget[videoCampaign.getGameId()], 2);
                    chai_1.assert.equal(countersDTO.viewsPerCampaign[videoCampaign.getId()], 1);
                    chai_1.assert.equal(countersDTO.viewsPerTarget[videoCampaign.getGameId()], 1);
                    GameSessionCounters_1.GameSessionCounters.addStart(cometPlayableCampaign);
                    countersDTO = GameSessionCounters_1.GameSessionCounters.getDTO();
                    chai_1.assert.equal(Object.keys(countersDTO.startsPerCampaign).length, 2);
                    chai_1.assert.equal(countersDTO.starts, 3);
                    chai_1.assert.equal(countersDTO.adRequests, 2);
                    chai_1.assert.equal(countersDTO.views, 1);
                    chai_1.assert.equal(countersDTO.startsPerCampaign[videoCampaign.getId()], 2);
                    chai_1.assert.equal(countersDTO.startsPerTarget[videoCampaign.getGameId()], 2);
                    chai_1.assert.equal(countersDTO.viewsPerCampaign[videoCampaign.getId()], 1);
                    chai_1.assert.equal(countersDTO.viewsPerTarget[videoCampaign.getGameId()], 1);
                    chai_1.assert.equal(countersDTO.startsPerCampaign[cometPlayableCampaign.getId()], 1);
                    chai_1.assert.equal(countersDTO.viewsPerCampaign[cometPlayableCampaign.getId()], undefined);
                    // Init
                    GameSessionCounters_1.GameSessionCounters.init();
                    countersDTO = GameSessionCounters_1.GameSessionCounters.getDTO();
                    chai_1.assert.equal(countersDTO.starts, 0);
                    chai_1.assert.equal(countersDTO.adRequests, 0);
                    chai_1.assert.equal(countersDTO.views, 0);
                    chai_1.assert.equal(Object.keys(countersDTO.startsPerCampaign).length, 0);
                    chai_1.assert.equal(Object.keys(countersDTO.startsPerTarget).length, 0);
                    chai_1.assert.equal(Object.keys(countersDTO.viewsPerCampaign).length, 0);
                    chai_1.assert.equal(Object.keys(countersDTO.viewsPerTarget).length, 0);
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVNlc3Npb25Db3VudGVyc1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJHYW1lU2Vzc2lvbkNvdW50ZXJzVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBTUEsUUFBUSxDQUFDLHlCQUF5QixFQUFFO2dCQUVoQyxJQUFNLGFBQWEsR0FBRywyQkFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNqRCxJQUFNLHFCQUFxQixHQUFHLDJCQUFZLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztnQkFFdEUsVUFBVSxDQUFDO29CQUNQLHlDQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMvQixDQUFDLENBQUMsQ0FBQztnQkFFSCxFQUFFLENBQUMsdUNBQXVDLEVBQUU7b0JBQ3hDLHlDQUFtQixDQUFDLFlBQVksRUFBRSxDQUFDO29CQUNuQyx5Q0FBbUIsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBRTVDLElBQUksV0FBVyxHQUFHLHlDQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUMvQyxhQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLGFBQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDeEMsYUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNuQyxhQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDdEUsYUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN4RSxhQUFNLENBQUMsS0FBSyxDQUFD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