import { ColorUtils } from 'MabExperimentation/Utilities/ColorUtils.ts';

describe('ColorUtils', () => {
    // the colors are assigned to a variable here for clarity,
    // but these values come from AutomatedExperimentsList
    const darkBlue = '0052c7';
    const blue = '167dfb';

    it('recieves a color that starts with DARK and returns true', () => {
        expect(ColorUtils.isDarkSchemeColor(darkBlue)).toEqual(true);
    });

    it(`recieves a color that doesn't start with DARK and returns false`, () => {
        expect(ColorUtils.isDarkSchemeColor(blue)).toEqual(false);
    });

    it('receives undefined and returns undefined', () => {
        expect(ColorUtils.isDarkSchemeColor(undefined)).toEqual(undefined);
    });
});
