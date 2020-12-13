import { assert } from 'chai';
import { Localization } from 'Core/Utilities/Localization';
import 'mocha';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';
import { PrivacyLocalization } from 'Privacy/PrivacyLocalization';
describe('LocalizationTest', () => {
    it('should return the number of reviews as a string if language is not found', () => {
        const localization = new Localization('not valid', 'not valid');
        const numberOfReviews = 100000;
        assert.equal(localization.abbreviate(numberOfReviews), numberOfReviews.toString(), 'Concatenation did not return original number of reviews');
    });
    it('should correctly concatenate 100000 to "100 k" for english language users', () => {
        const numberOfReviews = 100000;
        assert.equal(new Localization('en_US', '').abbreviate(numberOfReviews), '100 k', 'Concatenation did not return expected string');
        assert.equal(new Localization('en_UK', '').abbreviate(numberOfReviews), '100 k', 'Concatenation did not return expected string');
    });
    it('should correctly concatenate 1000000 to "1 m" for english language users', () => {
        const numberOfReviews = 1000000;
        assert.equal(new Localization('en_US', '').abbreviate(numberOfReviews), '1 m', 'Concatenation did not return expected string');
        assert.equal(new Localization('en_UK', '').abbreviate(numberOfReviews), '1 m', 'Concatenation did not return expected string');
    });
    it('should return phrase if language is not found', () => {
        const localization = new Localization('asdasd', 'asdasd');
        const phrase = 'foobar';
        assert.equal(localization.translate(phrase), phrase, 'Localization did not return original phrase');
    });
    it('should return phrase if no namespace is found', () => {
        const localization = new Localization('en', 'asdasd');
        const phrase = 'foobar';
        assert.equal(localization.translate(phrase), phrase, 'Localization did not return original phrase');
    });
    it('should return phrase if no translation is found', () => {
        const localization = new Localization('en', 'endscreen');
        const phrase = 'foobar';
        assert.equal(localization.translate(phrase), phrase, 'Localization did not return original phrase');
    });
    it('should translate', () => {
        const localization = new Localization('fi', 'endscreen');
        const phrase = 'Download For Free';
        assert.equal(localization.translate(phrase), 'Lataa ilmaiseksi', 'Localization did not translate');
    });
    it('should translate partial match', () => {
        const localization = new Localization('en_GB', 'endscreen');
        const phrase = 'Download For Free';
        assert.equal(localization.translate(phrase), phrase, 'Localization did not translate partial match');
    });
    it('should translate exact match', () => {
        const localization = new Localization('zh_TW', 'endscreen');
        const phrase = 'Download For Free';
        assert.equal(localization.translate(phrase), '免費下載', 'Localization did not translate exact match');
    });
    it('should translate Learn More', () => {
        const localization = new Localization('fi', 'overlay');
        const phrase = 'Learn More';
        assert.equal(localization.translate(phrase), 'Lisää tietoa', 'Localization did not translate');
    });
    it('should translate correctly all Chinese simplified codes', () => {
        const phrase = 'Download For Free';
        assert.equal(new Localization('zh', 'endscreen').translate(phrase), '免费下载', 'Localization zh did not map to correct language');
        assert.equal(new Localization('zh_CN', 'endscreen').translate(phrase), '免费下载', 'Localization zh_CN did not map to correct language');
        assert.equal(new Localization('zh_Hans', 'endscreen').translate(phrase), '免费下载', 'Localization zh_Hans did not map to correct language');
        assert.equal(new Localization('zh_Hans_CN', 'endscreen').translate(phrase), '免费下载', 'Localization zh_Hans_CN did not map to correct language');
        assert.equal(new Localization('zh_Hans_US', 'endscreen').translate(phrase), '免费下载', 'Localization zh_Hans_US did not map to correct language'); // because we don't really care about the last _XX
        assert.equal(new Localization('zh_#Hans_CN', 'endscreen').translate(phrase), '免费下载', 'Localization zh_#Hans_CN did not map to correct language');
        assert.equal(new Localization('zh_CN_#Hans', 'endscreen').translate(phrase), '免费下载', 'Localization zh_CN_#Hans did not map to correct language');
    });
    it('should translate correctly all Chinese traditional codes', () => {
        const phrase = 'Download For Free';
        assert.equal(new Localization('zh_Hant', 'endscreen').translate(phrase), '免費下載', 'Localization zh_Hant did not map to correct language');
        assert.equal(new Localization('zh_TW', 'endscreen').translate(phrase), '免費下載', 'Localization zh_TW did not map to correct language');
        assert.equal(new Localization('zh_Hant_TW', 'endscreen').translate(phrase), '免費下載', 'Localization zh_Hant_TW did not map to correct language');
        assert.equal(new Localization('zh_HK', 'endscreen').translate(phrase), '免費下載', 'Localization zh_HK did not map to correct language');
        assert.equal(new Localization('zh_MO', 'endscreen').translate(phrase), '免費下載', 'Localization zh_HK did not map to correct language');
        assert.equal(new Localization('zh_#Hant_TW', 'endscreen').translate(phrase), '免費下載', 'Localization zh_#Hant_TW did not map to correct language');
        assert.equal(new Localization('zh_TW_#Hant', 'endscreen').translate(phrase), '免費下載', 'Localization zh_TW_#Hant did not map to correct language');
    });
    describe('Privacy - base localization instance', () => {
        // What information we collect and how we use it
        const id = 'privacy-what-we-collect-title';
        it('EN. Should return correct translation for id "privacy-what-we-collect-title"', () => {
            const localization = new Localization('en_GB', 'consent');
            const phrase = 'What information we collect and how we use it';
            assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
        });
        it('FR. Should return correct translation for id "privacy-what-we-collect-title"', () => {
            const localization = new Localization('fr_GB', 'consent');
            const phrase = 'Informations collectées et utilisation';
            assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
        });
        it('DE. Should return correct translation for id "privacy-what-we-collect-title"', () => {
            const localization = new Localization('de_AU', 'consent');
            const phrase = 'Welche Informationen wir sammeln und wie wir sie nutzen';
            assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
        });
        it('ES. Should return correct translation for id "privacy-what-we-collect-title"', () => {
            const localization = new Localization('es', 'consent');
            const phrase = 'Qué información recopilamos y cómo la utilizamos';
            assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
        });
        it('FI. Should return correct translation for id "privacy-what-we-collect-title"', () => {
            const localization = new Localization('fi_FI', 'consent');
            const phrase = 'What information we collect and how we use it';
            assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
        });
        it('RU. Should return correct translation for id "privacy-what-we-collect-title"', () => {
            const localization = new Localization('ru', 'consent');
            const phrase = 'Какую информацию мы собираем и как ее используем';
            assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
        });
        it('PT. Should return correct translation for id "privacy-what-we-collect-title"', () => {
            const localization = new Localization('pt', 'consent');
            const phrase = 'Que informações recolhemos e como as utilizamos';
            assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
        });
        it('IT. Should return correct translation for id "privacy-what-we-collect-title"', () => {
            const localization = new Localization('it', 'consent');
            const phrase = 'Quali informazioni raccogliamo e come le utilizziamo';
            assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
        });
    });
    describe('Privacy view  - base localization instance', () => {
        // Changing your privacy choice
        const id = 'privacy-dialog-text-li-p6-header';
        it('EN. Should return correct translation for id "privacy-dialog-text-li-p6-header"', () => {
            const localization = new Localization('en_GB', 'privacy');
            const phrase = 'Changing your privacy choice';
            assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
        });
        it('FR. Should return correct translation for id "privacy-dialog-text-li-p6-header"', () => {
            const localization = new Localization('fr_FI', 'privacy');
            const phrase = 'Changing your privacy choice'; // no French translation available, should return English phrase
            assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
        });
        it('ZH Hans. Should return correct translation for id "privacy-dialog-text-li-p6-header"', () => {
            const expectedTranslation = '更改您的隐私选项';
            assert.equal(new Localization('zh', 'privacy').translate(id), expectedTranslation, 'Localization zh did not map to correct language');
            assert.equal(new Localization('zh_CN', 'privacy').translate(id), expectedTranslation, 'Localization zh_CN did not map to correct language');
            assert.equal(new Localization('zh_Hans', 'privacy').translate(id), expectedTranslation, 'Localization zh_Hans did not map to correct language');
            assert.equal(new Localization('zh_Hans_CN', 'privacy').translate(id), expectedTranslation, 'Localization zh_Hans_CN did not map to correct language');
            assert.equal(new Localization('zh_Hans_US', 'privacy').translate(id), expectedTranslation, 'Localization zh_Hans_US did not map to correct language');
            assert.equal(new Localization('zh_#Hans_CN', 'privacy').translate(id), expectedTranslation, 'Localization zh_#Hans_CN did not map to correct language');
            assert.equal(new Localization('zh_CN_#Hans', 'privacy').translate(id), expectedTranslation, 'Localization zh_CN_#Hans did not map to correct language');
        });
        it('ZH Hant China. Should return correct translation for id "privacy-dialog-text-li-p6-header"', () => {
            const expectedTranslation = 'Changing your privacy choice'; // no translation for Traditional Chinese available
            assert.equal(new Localization('zh_Hant', 'privacy').translate(id), expectedTranslation, 'Localization zh_Hant did not map to correct language');
            assert.equal(new Localization('zh_TW', 'privacy').translate(id), expectedTranslation, 'Localization zh_TW did not map to correct language');
            assert.equal(new Localization('zh_Hant_TW', 'privacy').translate(id), expectedTranslation, 'Localization zh_Hant_TW did not map to correct language');
            assert.equal(new Localization('zh_HK', 'privacy').translate(id), expectedTranslation, 'Localization zh_HK did not map to correct language');
            assert.equal(new Localization('zh_MO', 'privacy').translate(id), expectedTranslation, 'Localization zh_HK did not map to correct language');
            assert.equal(new Localization('zh_#Hant_TW', 'privacy').translate(id), expectedTranslation, 'Localization zh_#Hant_TW did not map to correct language');
            assert.equal(new Localization('zh_TW_#Hant', 'privacy').translate(id), expectedTranslation, 'Localization zh_TW_#Hant did not map to correct language');
        });
    });
    describe('Privacy Localization tests', () => {
        describe('Privacy Unit Consent', () => {
            // What information we collect and how we use it
            const id = 'privacy-what-we-collect-title';
            it('EN. Should return correct translation for id "privacy-what-we-collect-title"', () => {
                const localization = new PrivacyLocalization('en_GB', 'consent', LegalFramework.GDPR);
                const phrase = 'What information we collect and how we use it';
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('FR. Should return correct translation for id "privacy-what-we-collect-title"', () => {
                const localization = new PrivacyLocalization('fr_GB', 'consent', LegalFramework.GDPR);
                const phrase = 'Informations collectées et utilisation';
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('DE. Should return correct translation for id "privacy-what-we-collect-title"', () => {
                const localization = new PrivacyLocalization('de_AU', 'consent', LegalFramework.GDPR);
                const phrase = 'Welche Informationen wir sammeln und wie wir sie nutzen';
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('ES. Should return correct translation for id "privacy-what-we-collect-title"', () => {
                const localization = new PrivacyLocalization('es', 'consent', LegalFramework.GDPR);
                const phrase = 'Qué información recopilamos y cómo la utilizamos';
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('FI. Should return correct translation for id "privacy-what-we-collect-title"', () => {
                const localization = new PrivacyLocalization('fi_FI', 'consent', LegalFramework.GDPR);
                const phrase = 'What information we collect and how we use it';
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('RU. Should return correct translation for id "privacy-what-we-collect-title"', () => {
                const localization = new PrivacyLocalization('ru', 'consent', LegalFramework.GDPR);
                const phrase = 'Какую информацию мы собираем и как ее используем';
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('PT. Should return correct translation for id "privacy-what-we-collect-title"', () => {
                const localization = new PrivacyLocalization('pt', 'consent', LegalFramework.GDPR);
                const phrase = 'Que informações recolhemos e como as utilizamos';
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('IT. Should return correct translation for id "privacy-what-we-collect-title"', () => {
                const localization = new PrivacyLocalization('it', 'consent', LegalFramework.GDPR);
                const phrase = 'Quali informazioni raccogliamo e come le utilizziamo';
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
        });
        describe('Privacy Unit Age Gate', () => {
            // Before you get started, please verify your age
            const id = 'age-gate-title';
            it('EN. Should return correct translation for id "age-gate-title"', () => {
                const localization = new PrivacyLocalization('en_GB', 'consent', LegalFramework.GDPR);
                const phrase = 'Before you get started, please verify your age';
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('FR. Should return correct translation for id "age-gate-title"', () => {
                const localization = new PrivacyLocalization('fr_GB', 'consent', LegalFramework.GDPR);
                // no French available for Age Gate
                const phrase = 'Before you get started, please verify your age';
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('ES. Should return correct translation for id "age-gate-title"', () => {
                const localization = new PrivacyLocalization('es', 'consent', LegalFramework.GDPR);
                const phrase = 'Antes de empezar, por favor verifica tu edad';
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('FI. Should return correct translation for id "age-gate-title"', () => {
                const localization = new PrivacyLocalization('fi_FI', 'consent', LegalFramework.GDPR);
                const phrase = 'Before you get started, please verify your age'; // No Finnish translation available
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('ZH Hans. Should return correct translation for id "age-gate-title"', () => {
                const phrase = '在开始之前, 请确认您的年龄';
                assert.equal(new PrivacyLocalization('zh', 'consent', LegalFramework.GDPR).translate(id), phrase, 'Localization zh did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_CN', 'consent', LegalFramework.GDPR).translate(id), phrase, 'Localization zh_CN did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_Hans', 'consent', LegalFramework.GDPR).translate(id), phrase, 'Localization zh_Hans did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_Hans_CN', 'consent', LegalFramework.GDPR).translate(id), phrase, 'Localization zh_Hans_CN did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_Hans_US', 'consent', LegalFramework.TC260).translate(id), phrase, 'Localization zh_Hans_US did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_#Hans_CN', 'consent', LegalFramework.TC260).translate(id), phrase, 'Localization zh_#Hans_CN did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_CN_#Hans', 'consent', LegalFramework.TC260).translate(id), phrase, 'Localization zh_CN_#Hans did not map to correct language');
            });
        });
        describe('Privacy view', () => {
            // Changing your privacy choice
            const id = 'privacy-dialog-text-li-p6-header';
            it('EN. Should return correct translation for id "privacy-dialog-text-li-p6-header"', () => {
                const localization = new PrivacyLocalization('en_GB', 'privacy', LegalFramework.NONE);
                const phrase = 'Changing your privacy choice';
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('FR. Should return correct translation for id "privacy-dialog-text-li-p6-header"', () => {
                const localization = new PrivacyLocalization('fr_FI', 'privacy', LegalFramework.NONE);
                const phrase = 'Changing your privacy choice'; // no French translation available, should return English phrase
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('ES. Should return correct translation for id "privacy-dialog-text-li-p6-header"', () => {
                const localization = new PrivacyLocalization('es_FI', 'privacy', LegalFramework.NONE);
                // Spanish translations is available only for CCPA
                const phrase = 'Changing your privacy choice'; // no French translation available, should return English phrase
                assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
            });
            it('ZH Hans. Should return correct translation for id "privacy-dialog-text-li-p6-header"', () => {
                const expectedTranslation = '更改您的隐私选项';
                assert.equal(new PrivacyLocalization('zh', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_CN', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_CN did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_Hans', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_Hans did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_Hans_CN', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_Hans_CN did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_Hans_US', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_Hans_US did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_#Hans_CN', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_#Hans_CN did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_CN_#Hans', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_CN_#Hans did not map to correct language');
            });
            it('ZH Hant China. Should return correct translation for id "privacy-dialog-text-li-p6-header"', () => {
                const expectedTranslation = 'Changing your privacy choice'; // no translation for Traditional Chinese available
                assert.equal(new PrivacyLocalization('zh_Hant', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_Hant did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_TW', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_TW did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_Hant_TW', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_Hant_TW did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_HK', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_HK did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_MO', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_HK did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_#Hant_TW', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_#Hant_TW did not map to correct language');
                assert.equal(new PrivacyLocalization('zh_TW_#Hant', 'privacy', LegalFramework.NONE).translate(id), expectedTranslation, 'Localization zh_TW_#Hant did not map to correct language');
            });
            describe('Privacy View CCPA', () => {
                it('ES. Should return correct translation for id "privacy-dialog-text-li-p6-header"', () => {
                    const localization = new PrivacyLocalization('es_FI', 'privacy', LegalFramework.CCPA);
                    // Spanish translation is only available for CCPA
                    const phrase = 'Cambiar tu opción de privacidad';
                    assert.equal(localization.translate(id), phrase, 'Localization did not translate exact match');
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9jYWxpemF0aW9uVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9Db3JlL1V0aWxpdGllcy9Mb2NhbGl6YXRpb25UZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFOUIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzNELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRWxFLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7SUFFOUIsRUFBRSxDQUFDLDBFQUEwRSxFQUFFLEdBQUcsRUFBRTtRQUNoRixNQUFNLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDaEUsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxlQUFlLENBQUMsUUFBUSxFQUFFLEVBQUUseURBQXlELENBQUMsQ0FBQztJQUNsSixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywyRUFBMkUsRUFBRSxHQUFHLEVBQUU7UUFDakYsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxPQUFPLEVBQUUsOENBQThDLENBQUMsQ0FBQztRQUNqSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksWUFBWSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMs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