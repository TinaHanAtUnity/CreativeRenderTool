System.register(["mocha", "sinon", "chai", "Models/Vast/Vast", "../../TestHelpers/TestFixtures"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, Vast_1, TestFixtures_1;
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
            function (Vast_1_1) {
                Vast_1 = Vast_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            }
        ],
        execute: function () {
            describe('VastCampaignTest', function () {
                it('should return default cache TTL of 1 hour represented in seconds', function () {
                    var vast = new Vast_1.Vast([], []);
                    sinon.stub(vast, 'getVideoUrl').returns('https://video.url');
                    var campaign = TestFixtures_1.TestFixtures.getEventVastCampaign();
                    var willExpireAt = campaign.getWillExpireAt();
                    chai_1.assert.isDefined(willExpireAt, 'Will expire at should be defined');
                    if (willExpireAt) {
                        var timeDiff = willExpireAt - (Date.now() + 3600 * 1000);
                        chai_1.assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
                    }
                });
                it('should return default cache TTL represented in seconds if server provides TTL of 0', function () {
                    var vast = new Vast_1.Vast([], []);
                    sinon.stub(vast, 'getVideoUrl').returns('https://video.url');
                    var campaign = TestFixtures_1.TestFixtures.getEventVastCampaign();
                    var willExpireAt = campaign.getWillExpireAt();
                    chai_1.assert.isDefined(willExpireAt, 'Will expire at should be defined');
                    if (willExpireAt) {
                        var timeDiff = willExpireAt - (Date.now() + 3600 * 1000);
                        chai_1.assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
                    }
                });
                it('should return cache TTL provided by the server', function () {
                    var campaign = TestFixtures_1.TestFixtures.getEventVastCampaign();
                    var willExpireAt = campaign.getWillExpireAt();
                    chai_1.assert.isDefined(willExpireAt, 'Will expire at should be defined');
                    if (willExpireAt) {
                        var timeDiff = willExpireAt - (Date.now() + 3600 * 1000);
                        chai_1.assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
                    }
                });
                describe('when VAST has a companion ad', function () {
                    it('should have an endscreen when VAST has portrait or landscape url', function () {
                        var vastCampaign = TestFixtures_1.TestFixtures.getCompanionVastCampaign();
                        chai_1.assert.equal(vastCampaign.hasEndscreen(), true);
                    });
                    it('should not have an endscreen when both portrait and landscape urls missing', function () {
                        var vastCampaign = TestFixtures_1.TestFixtures.getCompanionVastCampaignWihoutImages();
                        chai_1.assert.equal(vastCampaign.hasEndscreen(), false);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENhbXBhaWduVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlZhc3RDYW1wYWlnblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQU1BLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRTtnQkFDekIsRUFBRSxDQUFDLGtFQUFrRSxFQUFFO29CQUNuRSxJQUFNLElBQUksR0FBRyxJQUFJLFdBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzlCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO29CQUM3RCxJQUFNLFFBQVEsR0FBRywyQkFBWSxDQUFDLG9CQUFvQixFQUFFLENBQUM7b0JBQ3JELElBQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDaEQsYUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztvQkFDbkUsSUFBRyxZQUFZLEVBQUU7d0JBQ2IsSUFBTSxRQUFRLEdBQUcsWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQzt3QkFDM0QsYUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxzRkFBc0YsQ0FBQyxDQUFDO3FCQUNsSTtnQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFFSCxFQUFFLENBQUMsb0ZBQW9GLEVBQUU7b0JBQ3JGLElBQU0sSUFBSSxHQUFHLElBQUksV0FBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDOUIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7b0JBQzdELElBQU0sUUFBUSxHQUFHLDJCQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztvQkFDckQsSUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUNoRCxhQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO29CQUNuRSxJQUFHLFlBQVksRUFBRTt3QkFDYixJQUFNLFFBQVEsR0FBRyxZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO3dCQUMzRCxhQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxFQUFFLHNGQUFzRixDQUFDLENBQUM7cUJBQ2xJO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxnREFBZ0QsRUFBRTtvQkFDakQsSUFBTSxRQUFRLEdBQUcsMkJBQVksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO29CQUNyRCxJQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQ2hELGFBQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLGtDQUFrQyxDQUFDLENBQUM7b0JBQ25FLElBQUcsWUFBWSxFQUFFO3dCQUNiLElBQU0sUUFBUSxHQUFHLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7d0JBQzNELGFBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsc0ZBQXNGLENBQUMsQ0FBQztxQkFDbEk7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLDhCQUE4QixFQUFFO29CQUNyQyxFQUFFLENBQUMsa0VBQWtFLEVBQUU7d0JBQ25FLElBQU0sWUFBWSxHQUFHLDJCQUFZLENBQUMsd0JBQXdCLEVBQUUsQ0FBQzt3QkFDN0QsYUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3BELENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyw0RUFBNEUsRUFBRTt3QkFDN0UsSUFBTSxZQUFZLEdBQUcsMkJBQVksQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDO3dCQUN6RSxhQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDckQsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQyJ9