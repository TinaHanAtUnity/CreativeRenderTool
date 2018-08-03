System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Constants/Platform"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, Platform_1;
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
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            }
        ],
        execute: function () {
            describe('ConnectivityApi', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    }, Platform_1.Platform.TEST, false);
                });
                it('should call Connectivity.setConnectionMonitoring on native bridge', function () {
                    nativeBridge.Connectivity.setListeningStatus(true);
                    sinon.assert.calledWith(handleInvocation, JSON.stringify([['Connectivity', 'setConnectionMonitoring', [true], '1']]));
                });
                it('should trigger onConnected', function () {
                    var spy = sinon.spy();
                    nativeBridge.Connectivity.onConnected.subscribe(spy);
                    nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
                    sinon.assert.calledWith(spy, true, 0);
                });
                it('should throw', function () {
                    chai_1.assert.throws(function () {
                        nativeBridge.Connectivity.handleEvent('INVALID', []);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29ubmVjdGl2aXR5QXBpVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbm5lY3Rpdml0eUFwaVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQU9BLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDeEIsSUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxZQUEwQixDQUFDO2dCQUUvQixVQUFVLENBQUM7b0JBQ1AsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQzt3QkFDNUIsZ0JBQWdCLGtCQUFBO3dCQUNoQixjQUFjLGdCQUFBO3FCQUNqQixFQUFFLG1CQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM3QixDQUFDLENBQUMsQ0FBQztnQkFFSCxFQUFFLENBQUMsbUVBQW1FLEVBQUU7b0JBQ3BFLFlBQVksQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ25ELEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSx5QkFBeUIsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxSCxDQUFDLENBQUMsQ0FBQztnQkFFSCxFQUFFLENBQUMsNEJBQTRCLEVBQUU7b0JBQzdCLElBQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDeEIsWUFBWSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNyRCxZQUFZLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLGNBQWMsRUFBRTtvQkFDZixhQUFNLENBQUMsTUFBTSxDQUFDO3dCQUNWLFlBQVksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDekQsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFUCxDQUFDLENBQUMsQ0FBQyJ9