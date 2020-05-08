//
// NOTE! for the color tinting experiment only
//

import { ColorConversion } from 'Performance/Utilities/ColorConversion';
import { Color } from 'Core/Utilities/Color';

const BACKGROUND_MIN_BRIGHTNESS = 0.85;
const BUTTON_BRIGHTNESS = 0.4;
const GAME_NAME_BRIGHTNESS = 0.25;

export interface IColorTheme {
    light: Color;
    medium: Color;
    dark: Color;
}

export class Swatch {
    public color: Color;

    public population: number;

    constructor(color: [number, number, number], population: number) {
        this.color = new Color(color[0], color[1], color[2]);
        this.population = population;
    }

    public getColorTheme(): IColorTheme {
        const hsl = ColorConversion.RGBToHSL(this.color.r, this.color.g, this.color.b);
        const lightColor = ColorConversion.HSLToRGB(hsl[0], hsl[1], Math.max(hsl[2], BACKGROUND_MIN_BRIGHTNESS));
        const mediumColor = ColorConversion.HSLToRGB(hsl[0], hsl[1], BUTTON_BRIGHTNESS);
        const darkColor = ColorConversion.HSLToRGB(hsl[0], hsl[1], GAME_NAME_BRIGHTNESS);
        return {
            light: lightColor,
            medium: mediumColor,
            dark: darkColor
        };
    }
}
