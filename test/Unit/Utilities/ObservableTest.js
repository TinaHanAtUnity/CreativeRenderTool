System.register(["mocha", "chai", "Utilities/Observable"], function (exports_1, context_1) {
    "use strict";
    var chai_1, Observable_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            }
        ],
        execute: function () {
            describe('ObservableTest', function () {
                it('should unsubscribe', function () {
                    var triggered = 0;
                    var observer = function () {
                        triggered++;
                    };
                    var observable = new Observable_1.Observable1();
                    observable.subscribe(observer);
                    chai_1.assert.equal(triggered, 0);
                    observable.trigger(true);
                    chai_1.assert.equal(triggered, 1);
                    observable.unsubscribe(observer);
                    observable.trigger(true);
                    chai_1.assert.equal(triggered, 1);
                });
                it('should unsubscribe from bound observer', function () {
                    var triggered = 0;
                    var observer = function (abc) {
                        chai_1.assert.equal(abc, 'abc');
                        triggered++;
                    };
                    var observable = new Observable_1.Observable1();
                    var boundObserver = observable.subscribe(function () { return observer('abc'); });
                    chai_1.assert.equal(triggered, 0);
                    observable.trigger('abc');
                    chai_1.assert.equal(triggered, 1);
                    observable.unsubscribe(boundObserver);
                    observable.trigger('abc');
                    chai_1.assert.equal(triggered, 1);
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JzZXJ2YWJsZVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJPYnNlcnZhYmxlVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O1lBS0EsUUFBUSxDQUFDLGdCQUFnQixFQUFFO2dCQUN2QixFQUFFLENBQUMsb0JBQW9CLEVBQUU7b0JBQ3JCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztvQkFDbEIsSUFBTSxRQUFRLEdBQUc7d0JBQ2IsU0FBUyxFQUFFLENBQUM7b0JBQ2hCLENBQUMsQ0FBQztvQkFDRixJQUFNLFVBQVUsR0FBRyxJQUFJLHdCQUFXLEVBQUUsQ0FBQztvQkFDckMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDL0IsYUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3pCLGFBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUMzQixVQUFVLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNqQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN6QixhQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDL0IsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLHdDQUF3QyxFQUFFO29CQUN6QyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7b0JBQ2xCLElBQU0sUUFBUSxHQUFHLFVBQUMsR0FBVzt3QkFDekIsYUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQ3pCLFNBQVMsRUFBRSxDQUFDO29CQUNoQixDQUFDLENBQUM7b0JBQ0YsSUFBTSxVQUFVLEdBQUcsSUFBSSx3QkFBVyxFQUFFLENBQUM7b0JBQ3JDLElBQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsY0FBTSxPQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBZixDQUFlLENBQUMsQ0FBQztvQkFDbEUsYUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzFCLGFBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUMzQixVQUFVLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUN0QyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUMxQixhQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDL0IsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQyJ9