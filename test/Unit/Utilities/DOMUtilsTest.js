System.register(["mocha", "chai", "Utilities/DOMUtils"], function (exports_1, context_1) {
    "use strict";
    var chai_1, DOMUtils_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (DOMUtils_1_1) {
                DOMUtils_1 = DOMUtils_1_1;
            }
        ],
        execute: function () {
            describe('DOMUtilsTest', function () {
                it('should parse xml correctly', function () {
                    var doc = DOMUtils_1.DOMUtils.parseFromString('<xml></xml>', 'application/xml');
                    chai_1.assert.isNotNull(doc);
                    chai_1.assert.isNotNull(doc.documentElement);
                });
                it('should parse html correctly', function () {
                    var doc = DOMUtils_1.DOMUtils.parseFromString('<html></html>', 'text/html');
                    chai_1.assert.isNotNull(doc);
                    chai_1.assert.isNotNull(doc.documentElement);
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRE9NVXRpbHNUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRE9NVXRpbHNUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7WUFLQSxRQUFRLENBQUMsY0FBYyxFQUFFO2dCQUNyQixFQUFFLENBQUMsNEJBQTRCLEVBQUU7b0JBQzdCLElBQU0sR0FBRyxHQUFHLG1CQUFRLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO29CQUN2RSxhQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN0QixhQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDMUMsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLDZCQUE2QixFQUFFO29CQUM5QixJQUFNLEdBQUcsR0FBRyxtQkFBUSxDQUFDLGVBQWUsQ0FBQyxlQUFlLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBQ25FLGFBQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3RCLGFBQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUMxQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=