import 'mocha';
import { assert } from 'chai';

import { Localization } from 'Utilities/Localization';

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
    });

    it('should translate correctly all Chinese traditional codes', () => {
        const phrase = 'Download For Free';
        assert.equal(new Localization('zh_Hant', 'endscreen').translate(phrase), '免費下載', 'Localization zh_Hant did not map to correct language');
        assert.equal(new Localization('zh_TW', 'endscreen').translate(phrase), '免費下載', 'Localization zh_TW did not map to correct language');
        assert.equal(new Localization('zh_Hant_TW', 'endscreen').translate(phrase), '免費下載', 'Localization zh_Hant_TW did not map to correct language');
        assert.equal(new Localization('zh_HK', 'endscreen').translate(phrase), '免費下載', 'Localization zh_HK did not map to correct language');
        assert.equal(new Localization('zh_MO', 'endscreen').translate(phrase), '免費下載', 'Localization zh_HK did not map to correct language');
    });

});
