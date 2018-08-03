System.register(["mocha", "chai", "Utilities/CustomFeatures"], function (exports_1, context_1) {
    "use strict";
    var chai_1, CustomFeatures_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (CustomFeatures_1_1) {
                CustomFeatures_1 = CustomFeatures_1_1;
            }
        ],
        execute: function () {
            describe('CustomFeatures', function () {
                describe('isExampleGameId', function () {
                    it('should return true if gameId is 14850', function () {
                        var value = CustomFeatures_1.CustomFeatures.isExampleGameId('14850');
                        chai_1.assert.isTrue(value);
                    });
                    it('should return true if gameId is 14851', function () {
                        var value = CustomFeatures_1.CustomFeatures.isExampleGameId('14851');
                        chai_1.assert.isTrue(value);
                    });
                    it('should return false if gameId is anything besides 14850 and 14851', function () {
                        var value = CustomFeatures_1.CustomFeatures.isExampleGameId('14852');
                        chai_1.assert.isFalse(value);
                    });
                });
                describe('isTimehopApp', function () {
                    it('should return true if gameId is 1300023', function () {
                        var value = CustomFeatures_1.CustomFeatures.isTimehopApp('1300023');
                        chai_1.assert.isTrue(value);
                    });
                    it('should return true if gameId is 1300024', function () {
                        var value = CustomFeatures_1.CustomFeatures.isTimehopApp('1300024');
                        chai_1.assert.isTrue(value);
                    });
                    it('should return false if gameId is anything besides 1300023 and 1300024', function () {
                        var value = CustomFeatures_1.CustomFeatures.isTimehopApp('1300025');
                        chai_1.assert.isFalse(value);
                    });
                });
                describe('isMixedPlacementExperiment', function () {
                    it('should return true if gameId is 1543512', function () {
                        var value = CustomFeatures_1.CustomFeatures.isMixedPlacementExperiment('1543512');
                        chai_1.assert.isTrue(value);
                    });
                    it('should return true if gameId is 1003628', function () {
                        var value = CustomFeatures_1.CustomFeatures.isMixedPlacementExperiment('1003628');
                        chai_1.assert.isTrue(value);
                    });
                    it('should return true if gameId is 1042745', function () {
                        var value = CustomFeatures_1.CustomFeatures.isMixedPlacementExperiment('1042745');
                        chai_1.assert.isTrue(value);
                    });
                    it('should return true if gameId is 1543513', function () {
                        var value = CustomFeatures_1.CustomFeatures.isMixedPlacementExperiment('1543513');
                        chai_1.assert.isTrue(value);
                    });
                    it('should return false if gameId is anything besides 1543512 and 1003628', function () {
                        var value = CustomFeatures_1.CustomFeatures.isMixedPlacementExperiment('asdfasdf');
                        chai_1.assert.isFalse(value);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VzdG9tRmVhdHVyZXNUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ3VzdG9tRmVhdHVyZXNUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7WUFJQSxRQUFRLENBQUMsZ0JBQWdCLEVBQUU7Z0JBRXZCLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRTtvQkFDeEIsRUFBRSxDQUFDLHVDQUF1QyxFQUFFO3dCQUN4QyxJQUFNLEtBQUssR0FBRywrQkFBYyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDdEQsYUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDekIsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHVDQUF1QyxFQUFFO3dCQUN4QyxJQUFNLEtBQUssR0FBRywrQkFBYyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDdEQsYUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDekIsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLG1FQUFtRSxFQUFFO3dCQUNwRSxJQUFNLEtBQUssR0FBRywrQkFBYyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDdEQsYUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDMUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLGNBQWMsRUFBRTtvQkFDckIsRUFBRSxDQUFDLHlDQUF5QyxFQUFFO3dCQUMxQyxJQUFNLEtBQUssR0FBRywrQkFBYyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDckQsYUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDekIsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHlDQUF5QyxFQUFFO3dCQUMxQyxJQUFNLEtBQUssR0FBRywrQkFBYyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDckQsYUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDekIsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHVFQUF1RSxFQUFFO3dCQUN4RSxJQUFNLEtBQUssR0FBRywrQkFBYyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDckQsYUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDMUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLDRCQUE0QixFQUFFO29CQUNuQyxFQUFFLENBQUMseUNBQXlDLEVBQUU7d0JBQzFDLElBQU0sS0FBSyxHQUFHLCtCQUFjLENBQUMsMEJBQTBCLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ25FLGFBQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3pCLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyx5Q0FBeUMsRUFBRTt3QkFDMUMsSUFBTSxLQUFLLEdBQUcsK0JBQWMsQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDbkUsYUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDekIsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHlDQUF5QyxFQUFFO3dCQUMxQyxJQUFNLEtBQUssR0FBRywrQkFBYyxDQUFDLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNuRSxhQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN6QixDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMseUNBQXlDLEVBQUU7d0JBQzFDLElBQU0sS0FBSyxHQUFHLCtCQUFjLENBQUMsMEJBQTBCLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ25FLGFBQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3pCLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyx1RUFBdUUsRUFBRTt3QkFDeEUsSUFBTSxLQUFLLEdBQUcsK0JBQWMsQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDcEUsYUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDMUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQyJ9