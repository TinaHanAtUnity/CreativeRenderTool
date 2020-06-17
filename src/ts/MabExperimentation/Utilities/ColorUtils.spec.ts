import { ColorUtils } from 'MabExperimentation/Utilities/ColorUtils.ts';
import { EndScreenExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';

describe('ColorUtils', () => {
    describe(`returns true if the color starts with DARK, false if it doesn't, undefined if it's undefined`, () => {
        Object.entries(EndScreenExperimentDeclaration.color).forEach(([name, colorCode]) => {
            if (colorCode !== undefined) {
                it(`${name}:${colorCode}`, () => {
                    expect(ColorUtils.isDarkSchemeColor(colorCode)).toEqual(name.startsWith('DARK'));
                });
            } else {
                it(`${name}:${colorCode}`, () => {
                    expect(ColorUtils.isDarkSchemeColor(colorCode)).toEqual(undefined);
                });
            }
        });
    });
});
