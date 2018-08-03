System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Views/Overlay", "Views/Privacy"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, Overlay_1, Privacy_1;
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
            function (Overlay_1_1) {
                Overlay_1 = Overlay_1_1;
            },
            function (Privacy_1_1) {
                Privacy_1 = Privacy_1_1;
            }
        ],
        execute: function () {
            describe('Overlay', function () {
                var handleInvocation;
                var handleCallback;
                var nativeBridge;
                var privacy;
                beforeEach(function () {
                    handleInvocation = sinon.spy();
                    handleCallback = sinon.spy();
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    privacy = new Privacy_1.Privacy(nativeBridge, true);
                });
                it('should render', function () {
                    var overlay = new Overlay_1.Overlay(nativeBridge, true, 'en', 'testGameId', privacy, false);
                    overlay.render();
                    chai_1.assert.isNotNull(overlay.container().innerHTML);
                    chai_1.assert.isNotNull(overlay.container().querySelector('.skip-icon'));
                    chai_1.assert.isNotNull(overlay.container().querySelector('.buffering-spinner'));
                    chai_1.assert.isNotNull(overlay.container().querySelector('.mute-button'));
                    chai_1.assert.isNotNull(overlay.container().querySelector('.debug-message-text'));
                    chai_1.assert.isNotNull(overlay.container().querySelector('.call-button'));
                    chai_1.assert.isNotNull(overlay.container().querySelector('.progress'));
                    chai_1.assert.isNotNull(overlay.container().querySelector('.circle-left'));
                    chai_1.assert.isNotNull(overlay.container().querySelector('.circle-right'));
                    chai_1.assert.isNotNull(overlay.container().querySelector('.progress-wrapper'));
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3ZlcmxheVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJPdmVybGF5VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBU0EsUUFBUSxDQUFDLFNBQVMsRUFBRTtnQkFDaEIsSUFBSSxnQkFBZ0MsQ0FBQztnQkFDckMsSUFBSSxjQUE4QixDQUFDO2dCQUNuQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksT0FBd0IsQ0FBQztnQkFFN0IsVUFBVSxDQUFDO29CQUNQLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDL0IsY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDN0IsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQzt3QkFDNUIsZ0JBQWdCLGtCQUFBO3dCQUNoQixjQUFjLGdCQUFBO3FCQUNqQixDQUFDLENBQUM7b0JBQ0gsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlDLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxlQUFlLEVBQUU7b0JBQ2hCLElBQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNwRixPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2pCLGFBQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNoRCxhQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDbEUsYUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztvQkFDMUUsYUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BFLGFBQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7b0JBQzNFLGFBQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUNwRSxhQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDakUsYUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BFLGFBQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO29CQUNyRSxhQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO2dCQUM3RSxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=