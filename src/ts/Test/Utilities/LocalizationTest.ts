import 'mocha';
import { assert } from 'chai';

import { Localization } from 'Utilities/Localization';

describe('LocalizationTest', () => {

    it('should return phrase if language is not found', () => {
        let localization = new Localization('asdasd', 'asdasd');
        let phrase = 'foobar';
        assert.equal(localization.translate(phrase), phrase, 'Localization did not return original phrase');
    });

    it('should return phrase if no namespace is found', () => {
        let localization = new Localization('en', 'asdasd');
        let phrase = 'foobar';
        assert.equal(localization.translate(phrase), phrase, 'Localization did not return original phrase');
    });

    it('should return phrase if no translation is found', () => {
        let localization = new Localization('en', 'endscreen');
        let phrase = 'foobar';
        assert.equal(localization.translate(phrase), phrase, 'Localization did not return original phrase');
    });

    it('should translate', () => {
        let localization = new Localization('fi', 'endscreen');
        let phrase = 'Download For Free';
        assert.equal(localization.translate(phrase), 'Lataa ilmaiseksi', 'Localization did not translate');
    });

    it('should translate partial match', () => {
        let localization = new Localization('en_GB', 'endscreen');
        let phrase = 'Download For Free';
        assert.equal(localization.translate(phrase), phrase, 'Localization did not translate partial match');
    });

    it('should translate exact match', () => {
        let localization = new Localization('zh_TW', 'endscreen');
        let phrase = 'Download For Free';
        assert.equal(localization.translate(phrase), '免費下載', 'Localization did not translate exact match');
    });

});
