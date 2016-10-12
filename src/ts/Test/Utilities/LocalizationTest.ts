import 'mocha';
import { assert } from 'chai';

import { Localization } from 'Utilities/Localization';

describe('LocalizationTest', () => {

    it('should return phrase if language is not found', () => {
        let localization = new Localization('asdasd');
        let phrase = 'foobar';
        assert.equal(localization.translate(phrase), phrase, 'Localization did not return original phrase');
    });

    it('should return phrase if no translation is found', () => {
        let localization = new Localization('en');
        let phrase = 'foobar';
        assert.equal(localization.translate(phrase), phrase, 'Localization did not return original phrase');
    });

    it('should translate', () => {
        let localization = new Localization('fi');
        let phrase = 'Download For Free';
        assert.equal(localization.translate(phrase), 'Lataa ilmaiseksi', 'Localization did not translate');
    });

});
