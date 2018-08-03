System.register(["mocha", "chai", "Models/Vast/VastCreativeCompanionAd"], function (exports_1, context_1) {
    "use strict";
    var chai_1, VastCreativeCompanionAd_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (VastCreativeCompanionAd_1_1) {
                VastCreativeCompanionAd_1 = VastCreativeCompanionAd_1_1;
            }
        ],
        execute: function () {
            describe('VastCreativeCompanionAd', function () {
                it('should have the correct data', function () {
                    var vastCreativeCompanionAd = new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id', 'image/png', 700, 800, 'http://image.com', 'https://url.com/companionClickThroughURLTemplate');
                    chai_1.assert.equal(vastCreativeCompanionAd.getId(), 'id');
                    chai_1.assert.equal(vastCreativeCompanionAd.getCreativeType(), 'image/png');
                    chai_1.assert.equal(vastCreativeCompanionAd.getHeight(), 700);
                    chai_1.assert.equal(vastCreativeCompanionAd.getWidth(), 800);
                    chai_1.assert.equal(vastCreativeCompanionAd.getStaticResourceURL(), 'http://image.com');
                    chai_1.assert.equal(vastCreativeCompanionAd.getCompanionClickThroughURLTemplate(), 'https://url.com/companionClickThroughURLTemplate');
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENyZWF0aXZlQ29tcGFuaW9uQWRUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVmFzdENyZWF0aXZlQ29tcGFuaW9uQWRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7WUFJQSxRQUFRLENBQUMseUJBQXlCLEVBQUU7Z0JBQ2hDLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRTtvQkFDL0IsSUFBTSx1QkFBdUIsR0FBRyxJQUFJLGlEQUF1QixDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxrQkFBa0IsRUFBRSxrREFBa0QsQ0FBQyxDQUFDO29CQUNqSyxhQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNwRCxhQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLGVBQWUsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUNyRSxhQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN2RCxhQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN0RCxhQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLG9CQUFvQixFQUFFLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztvQkFDakYsYUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxtQ0FBbUMsRUFBRSxFQUFFLGtEQUFrRCxDQUFDLENBQUM7Z0JBQ3BJLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMifQ==