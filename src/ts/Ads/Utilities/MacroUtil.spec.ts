import {MacroUtil} from 'Ads/Utilities/MacroUtil';

describe('MacroUtilTest', () => {
    const macroReplace1 = 'here is to test replacement of {{ CREATIVE_URL }}';
    const macroReplace2 = 'nothing should be replaced here';
    const macroReplace3 = 'here is to test replacement of {{ OMID_IMPLEMENTOR }} and {{ OMID_API_VERSION }}';

    it('should replace CREATIVE_URL correctly', () => {
        expect(MacroUtil.replaceMacro(macroReplace1, {'{{ CREATIVE_URL }}': 'https://cdn.unityads.unity3d.com/playables/production/ios/9innings_23022018/index.html'})).toBe('here is to test replcement of https://cdn.unityads.unity3d.com/playables/production/ios/9innings_23022018/index.html');
    });

    it('should not replace anything', () => {
        expect(MacroUtil.replaceMacro(macroReplace2, {'{{ CREATIVE_URL }}': 'https://cdn.unityads.unity3d.com/playables/production/ios/9innings_23022018/index.html'})).toBe('nothing should be replaced here');
    });

    it('should replace both URLs', () => {
        expect(MacroUtil.replaceMacro(macroReplace3, {'{{ OMID_IMPLEMENTOR }}': 'PARTNER_NAME', '{{ OMID_API_VERSION }}': 'OM_JS_VERSION'})).toBe('here is to test replcement of PARTNER_NAME and OM_JS_VERSION');
    });
});
