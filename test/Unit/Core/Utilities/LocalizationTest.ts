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

    describe ('Privacy Localization tests', () => {
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
