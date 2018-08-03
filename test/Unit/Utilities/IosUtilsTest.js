System.register(["mocha", "chai", "Utilities/IosUtils"], function (exports_1, context_1) {
    "use strict";
    var chai_1, IosUtils_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (IosUtils_1_1) {
                IosUtils_1 = IosUtils_1_1;
            }
        ],
        execute: function () {
            describe('IosUtilsTest', function () {
                it('isAppSheetBroken should return true with strings 8.0, 8.1, 8.2 and 8.3', function () {
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('8.0', 'iPhone8,1'), 'Should return true with string 8.0');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('8.1', 'iPhone8,1'), 'Should return true with string 8.1');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('8.2', 'iPhone8,1'), 'Should return true with string 8.2');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('8.3', 'iPhone8,1'), 'Should return true with string 8.3');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('8.0.3', 'iPhone8,1'), 'Should return true with string 8.0.3');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('8.0.abc', 'iPhone8,1'), 'Should return true with string 8.0.abc');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('8.2ok', 'iPhone8,1'), 'Should return true with string 8.2ok');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('8.01', 'iPhone8,1'), 'Should return true with string 8.01');
                });
                it('isAppSheetBroken should return true with any OS Version 7.x string', function () {
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('7.0', 'iPhone7,1'), 'Should return true with string 7.0');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('7.0.5', 'iPhone7,1'), 'Should return true with string 7.0.5');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('7.1', 'iPad7,1'), 'Should return true with string 7.1');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('7.2', 'iPhone7,1'), 'Should return true with string 7.2');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('7.6', 'iPhone7,1'), 'Should return true with string 7.6');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('7.9', 'iPhone7,1'), 'Should return true with string 7.9');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('7.9.10', 'iPhone7,1'), 'Should return true with string 7.9.10');
                });
                it('isAppSheetBroken should return false with strings (8., 8.4, 9.0 etc.)', function () {
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('8', 'iPhone8,1'), 'Should return false with string 8');
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('8..1', 'iPhone8,1'), 'Should return false with string 8..1');
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('8!1', 'iPhone8,1'), 'Should return false with string 8!1');
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('8.!1', 'iPhone8,1'), 'Should return false with string 8.!1');
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('8.', 'iPhone8,1'), 'Should return false with string 8.');
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('8.4', 'iPhone8,1'), 'Should return false with string 9.0');
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('9.0', 'iPhone8,1'), 'Should return false with string 9.0');
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('10.0', 'iPhone8,1'), 'Should return false with string 10.0');
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('9.11', 'iPhone8,1'), 'Should return false with string 9.11');
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('abc', 'iPhone8,1'), 'Should return false with string abc');
                });
                it('isAppSheetBroken should return true with versions 11.0, 11.1.1, 11.2, 11.2.5 on iPhone', function () {
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('11.0', 'iPhone8,1'), 'Should return false with string 11.0');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('11.1.1', 'iPhone8,1'), 'Should return true with string 11.1.1');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('11.2', 'iPhone8,1'), 'Should return true with string 8.2');
                    chai_1.assert.isTrue(IosUtils_1.IosUtils.isAppSheetBroken('11.2.5', 'iPhone8,1'), 'Should return true with string 11.2.5');
                });
                it('isAppSheetBroken should return false with versions 11.0, 11.1.1, 11.2, 11.2.5 on iPad', function () {
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('11.0', 'iPad6,7'), 'Should return false with string 11.0');
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('11.1.1', 'iPad6,7'), 'Should return false with string 11.1.1');
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('11.2', 'iPad6,7'), 'Should return false with string 11.2');
                    chai_1.assert.isFalse(IosUtils_1.IosUtils.isAppSheetBroken('11.2.5', 'iPad6,7'), 'Should return false with string 11.2.5');
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW9zVXRpbHNUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSW9zVXRpbHNUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7WUFLQSxRQUFRLENBQUMsY0FBYyxFQUFFO2dCQUNyQixFQUFFLENBQUMsd0VBQXdFLEVBQUU7b0JBQ3pFLGFBQU0sQ0FBQyxNQUFNLENBQUMsbUJBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztvQkFDbkcsYUFBTSxDQUFDLE1BQU0sQ0FBQyxtQkFBUSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO29CQUNuRyxhQUFNLENBQUMsTUFBTSxDQUFDLG1CQUFRLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxFQUFFLG9DQUFvQyxDQUFDLENBQUM7b0JBQ25HLGFBQU0sQ0FBQyxNQUFNLENBQUMsbUJBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztvQkFFbkcsYUFBTSxDQUFDLE1BQU0sQ0FBQyxtQkFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDO29CQUN2RyxhQUFNLENBQUMsTUFBTSxDQUFDLG1CQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxFQUFFLHdDQUF3QyxDQUFDLENBQUM7b0JBQzNHLGFBQU0sQ0FBQyxNQUFNLENBQUMsbUJBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEVBQUUsc0NBQXNDLENBQUMsQ0FBQztvQkFDdkcsYUFBTSxDQUFDLE1BQU0sQ0FBQyxtQkFBUSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFBRSxxQ0FB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