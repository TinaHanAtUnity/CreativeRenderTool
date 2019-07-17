//
// NOTE! for the color tinting experiment only
//

const BACKGROUND_MIN_BRIGHTNESS = 0.85;
const BUTTON_BRIGHTNESS = 0.4;
const GAME_NAME_BRIGHTNESS = 0.25;

export interface IColorTheme {
    light: number[];
    medium: number[];
    dark: number[];
}

// https://en.wikipedia.org/wiki/HSL_and_HSV
function RGBToHSL(r: number, g: number, b: number): number[] {
    const rf = r / 255;
    const gf = g / 255;
    const bf = b / 255;

    const max = Math.max(rf, gf, bf);
    const min = Math.min(rf, gf, bf);
    const chroma = max - min;

    const l = (max + min) / 2;
    let hue = 0;
    let saturation = 0;

    if (max === min) {
        hue = 0;
    } else if (max === rf) {
        hue = (gf - bf) / chroma;
    } else if (max === gf) {
        hue = ((bf - rf) / chroma) + 2;
    } else if (max === bf) {
        hue = ((rf - gf) / chroma) + 4;
    }

    hue = (hue * 60 + 360) % 360;

    if (l > 0 && l < 1) {
        saturation = chroma / (1 - Math.abs(max + min - 1));
    }

    return [hue, saturation, l];
}

function HSLToRGB(h: number, s: number, l: number): number[] {
    const chroma = (1 - Math.abs(l * 2 - 1)) * s;
    const tmpH = (h / 60);
    const x = chroma * (1 - Math.abs((tmpH % 2) - 1));
    const m = l - chroma / 2;

    let rgb = [0, 0, 0];

    if (h === 0) {
        rgb = [0, 0, 0];
    } else if (tmpH >= 0 && tmpH <= 1) {
        rgb = [chroma, x, 0];
    } else if (tmpH >= 1 && tmpH <= 2) {
        rgb = [x, chroma, 0];
    } else if (tmpH >= 2 && tmpH <= 3) {
        rgb = [0, chroma, x];
    } else if (tmpH >= 3 && tmpH <= 4) {
        rgb = [0, x, chroma];
    } else if (tmpH >= 4 && tmpH <= 5) {
        rgb = [x, 0, chroma];
    } else if (tmpH >= 5 && tmpH <= 6) {
        rgb = [chroma, 0, x];
    }

    rgb[0] = Math.round((rgb[0] + m) * 0xFF);
    rgb[1] = Math.round((rgb[1] + m) * 0xFF);
    rgb[2] = Math.round((rgb[2] + m) * 0xFF);

    return rgb;
}

export class Swatch {
    private _color: number[];
    private _r: number;
    private _g: number;
    private _b: number;

    public population: number;
    public selected: boolean;

    constructor(color: number[], population: number) {
        const [r, g, b] = color;
        this._r = r;
        this._g = g;
        this._b = b;
        this._color = color;

        this.population = population;
        this.selected = false;
    }

    public rgb(): number[] {
        return this._color;
    }

    public getColorTheme(): IColorTheme {
        const hsl = RGBToHSL(this._r, this._g, this._b);
        const lightColor = HSLToRGB(hsl[0], hsl[1], Math.max(hsl[2], BACKGROUND_MIN_BRIGHTNESS));
        const mediumColor = HSLToRGB(hsl[0], hsl[1], BUTTON_BRIGHTNESS);
        const darkColor = HSLToRGB(hsl[0], hsl[1], GAME_NAME_BRIGHTNESS);
        return {
            light: lightColor,
            medium: mediumColor,
            dark: darkColor
        };
    }
}
