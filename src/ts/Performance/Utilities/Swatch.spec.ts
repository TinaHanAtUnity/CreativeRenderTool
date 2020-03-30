import {Swatch} from 'Performance/Utilities/Swatch';
import {Color} from 'Core/Utilities/Color';

describe('SwatchTest', () => {
    describe('Swatch', () => {
        describe('getColorTheme', () => {
            it('should return the color theme correctly', () => {
                const swatch = new Swatch([205, 8, 163], 0);
                const colorTheme = swatch.getColorTheme();
                expect(colorTheme.dark).toStrictEqual(new Color(123, 5, 98));
                expect(colorTheme.medium).toStrictEqual(new Color(196, 8, 156));
                expect(colorTheme.light).toStrictEqual(new Color(252, 181, 237));
            });
        });
    });
});
