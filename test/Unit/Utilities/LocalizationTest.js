System.register(["mocha", "chai", "Utilities/Localization"], function (exports_1, context_1) {
    "use strict";
    var chai_1, Localization_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (Localization_1_1) {
                Localization_1 = Localization_1_1;
            }
        ],
        execute: function () {
            describe('LocalizationTest', function () {
                it('should return the number of reviews as a string if language is not found', function () {
                    var localization = new Localization_1.Localization('not valid', 'not valid');
                    var numberOfReviews = 100000;
                    chai_1.assert.equal(localization.abbreviate(numberOfReviews), numberOfReviews.toString(), 'Concatenation did not return original number of reviews');
                });
                it('should correctly concatenate 100000 to "100 k" for english language users', function () {
                    var numberOfReviews = 100000;
                    chai_1.assert.equal(new Localization_1.Localization('en_US', '').abbreviate(numberOfReviews), '100 k', 'Concatenation did not return expected string');
                    chai_1.assert.equal(new Localization_1.Localization('en_UK', '').abbreviate(numberOfReviews), '100 k', 'Concatenation did not return expected string');
                });
                it('should correctly concatenate 1000000 to "1 m" for english language users', function () {
                    var numberOfReviews = 1000000;
                    chai_1.assert.equal(new Localization_1.Localization('en_US', '').abbreviate(numberOfReviews), '1 m', 'Concatenation did not return expected string');
                    chai_1.assert.equal(new Localization_1.Localization('en_UK', '').abbreviate(numberOfReviews), '1 m', 'Concatenation did not return expected string');
                });
                it('should return phrase if language is not found', function () {
                    var localization = new Localization_1.Localization('asdasd', 'asdasd');
                    var phrase = 'foobar';
                    chai_1.assert.equal(localization.translate(phrase), phrase, 'Localization did not return original phrase');
                });
                it('should return phrase if no namespace is found', function () {
                    var localization = new Localization_1.Localization('en', 'asdasd');
                    var phrase = 'foobar';
                    chai_1.assert.equal(localization.translate(phrase), phrase, 'Localization did not return original phrase');
                });
                it('should return phrase if no translation is found', function () {
                    var localization = new Localization_1.Localization('en', 'endscreen');
                    var phrase = 'foobar';
                    chai_1.assert.equal(localization.translate(phrase), phrase, 'Localization did not return original phrase');
                });
                it('should translate', function () {
                    var localization = new Localization_1.Localization('fi', 'endscreen');
                    var phrase = 'Download For Free';
                    chai_1.assert.equal(localization.translate(phrase), 'Lataa ilmaiseksi', 'Localization did not translate');
                });
                it('should translate partial match', function () {
                    var localization = new Localization_1.Localization('en_GB', 'endscreen');
                    var phrase = 'Download For Free';
                    chai_1.assert.equal(localization.translate(phrase), phrase, 'Localization did not translate partial match');
                });
                it('should translate exact match', function () {
                    var localization = new Localization_1.Localization('zh_TW', 'endscreen');
                    var phrase = 'Download For Free';
                    chai_1.assert.equal(localization.translate(phrase), '免費下載', 'Localization did not translate exact match');
                });
                it('should translate Learn More', function () {
                    var localization = new Localization_1.Localization('fi', 'overlay');
                    var phrase = 'Learn More';
                    chai_1.assert.equal(localization.translate(phrase), 'Lisää tietoa', 'Localization did not translate');
                });
                it('should translate correctly all Chinese simplified codes', function () {
                    var phrase = 'Download For Free';
                    chai_1.assert.equal(new Localization_1.Localization('zh', 'endscreen').translate(phrase), '免费下载', 'Localization zh did not map to correct language');
                    chai_1.assert.equal(new Localization_1.Localization('zh_CN', 'endscreen').translate(phrase), '免费下载', 'Localization zh_CN did not map to correct language');
                    chai_1.assert.equal(new Localization_1.Localization('zh_Hans', 'endscreen').translate(phrase), '免费下载', 'Localization zh_Hans did not map to correct language');
                    chai_1.assert.equal(new Localization_1.Localization('zh_Hans_CN', 'endscreen').translate(phrase), '免费下载', 'Localization zh_Hans_CN did not map to correct language');
                    chai_1.assert.equal(new Localization_1.Localization('zh_Hans_US', 'endscreen').translate(phrase), '免费下载', 'Localization zh_Hans_US did not map to correct language'); // because we don't really care about the last _XX
                    chai_1.assert.equal(new Localization_1.Localization('zh_#Hans_CN', 'endscreen').translate(phrase), '免费下载', 'Localization zh_#Hans_CN did not map to correct language');
                    chai_1.assert.equal(new Localization_1.Localization('zh_CN_#Hans', 'endscreen').translate(phrase), '免费下载', 'Localization zh_CN_#Hans did not map to correct language');
                });
                it('should translate correctly all Chinese traditional codes', function () {
                    var phrase = 'Download For Free';
                    chai_1.assert.equal(new Localization_1.Localization('zh_Hant', 'endscreen').translate(phrase), '免費下載', 'Localization zh_Hant did not map to correct language');
                    chai_1.assert.equal(new Localization_1.Localization('zh_TW', 'endscreen').translate(phrase), '免費下載', 'Localization zh_TW did not map to correct language');
                    chai_1.assert.equal(new Localization_1.Localization('zh_Hant_TW', 'endscreen').translate(phrase), '免費下載', 'Localization zh_Hant_TW did not map to correct language');
                    chai_1.assert.equal(new Localization_1.Localization('zh_HK', 'endscreen').translate(phrase), '免費下載', 'Localization zh_HK did not map to correct language');
                    chai_1.assert.equal(new Localization_1.Localization('zh_MO', 'endscreen').translate(phrase), '免費下載', 'Localization zh_HK did not map to correct language');
                    chai_1.assert.equal(new Localization_1.Localization('zh_#Hant_TW', 'endscreen').translate(phrase), '免費下載', 'Localization zh_#Hant_TW did not map to correct language');
                    chai_1.assert.equal(new Localization_1.Localization('zh_TW_#Hant', 'endscreen').translate(phrase), '免費下載', 'Localization zh_TW_#Hant did not map to correct language');
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9jYWxpemF0aW9uVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkxvY2FsaXphdGlvblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztZQUtBLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRTtnQkFFekIsRUFBRSxDQUFDLDBFQUEwRSxFQUFFO29CQUMzRSxJQUFNLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUNoRSxJQUFNLGVBQWUsR0FBRyxNQUFNLENBQUM7b0JBQy9CLGFBQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxlQUFlLENBQUMsUUFBUSxFQUFFLEVBQUUseURBQXlELENBQUMsQ0FBQztnQkFDbEosQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLDJFQUEyRSxFQUFFO29CQUM1RSxJQUFNLGVBQWUsR0FBRyxNQUFNLENBQUM7b0JBQy9CLGFBQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSwyQkFBWSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQUUsT0FBTyxFQUFFLDhDQUE4QyxDQUFDLENBQUM7b0JBQ2pJLGFBQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSwyQkFBWSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQUUsT0FBTyxFQUFFLDhDQUE4QyxDQUFDLENBQUM7Z0JBQ3JJLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQywwRUFBMEUsRUFBRTtvQkFDM0UsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDO29CQUNoQyxhQUFNLENBQUMsS0FBSyxDQUFDLElBQUksMkJBQVksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEtBQUssRUFBRSw4Q0FBOEMs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