import {MacroUtil} from 'Ads/Utilities/MacroUtil';

describe('MacroUtilTest', () => {
    const macroReplace1 = '';
    const macroReplace2 = '';
    const macroReplace3 = '';

    it('should replace CREATIVE_URL correctly', () => {
        expect(MacroUtil.replaceMacro(macroReplace1, {'':''})).toBe('');
    });

});
