import { Swatch } from 'Performance/Utilities/Swatch';
import { Color } from 'Core/Utilities/Color';

describe('SwatchTest', () => {
    describe('Swatch', () => {
        describe('getColorTheme', () => {
            it('should return the color theme correctly', () => {
                const swatch = new Swatch([205, 8, 163], 0);
                const colorTheme = swatch.getColorTheme();
                const darkThemeValue = new Color(123, 5, 98).value;
                const mediumValue = new Color(196, 8, 156).value;
                const lightThemeValue = new Color(252, 181, 237).value;
                expect(colorTheme.dark.value).toEqual(darkThemeValue);
                expect(colorTheme.medium.value).toEqual(mediumValue);
                expect(colorTheme.light.value).toEqual(lightThemeValue);
            });
        });
    });
});
