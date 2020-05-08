export interface IRGBAValue {
    r: number;
    g: number;
    b: number;
    a: number;
}

export class Color {
    public value: IRGBAValue;

    constructor(r: number, g: number, b: number, a: number = 255) {
        this.value = { r, g, b, a };
    }

    public toCssRgba(): string {
        return `rgba(${this.value.r}, ${this.value.g}, ${this.value.b}, ${parseFloat((this.value.a / 255).toFixed(3))})`;
    }

    public toCssRgb(): string {
        return `rgb(${this.value.r}, ${this.value.g}, ${this.value.b})`;
    }

    public static lerp(c1: Color, c2: Color, t: number): Color {
        return new Color(
            Math.round(c1.value.r + (c2.value.r - c1.value.r) * t),
            Math.round(c1.value.g + (c2.value.g - c1.value.g) * t),
            Math.round(c1.value.b + (c2.value.b - c1.value.b) * t),
            Math.round(c1.value.a + (c2.value.a - c1.value.a) * t));
    }

    public static hexToCssRgba(hex: string | undefined): string {
        const color = this.hexToColor(hex);
        return color.toCssRgba();
    }

    public static hexToColor(hex: string | undefined): Color {
        const hexRegex = /^#?(([a-f0-9]{3,4})|([a-f0-9]{6}([a-f0-9]{2})?))$/i;
        if (hex === undefined || !hexRegex.test(hex)) {
            return new Color(0, 0, 0, 0);
        }

        hex = hex.replace('#', '');
        if (hex.length < 6) {
            return new Color (
                parseInt(hex[0] + hex[0], 16),
                parseInt(hex[1] + hex[1], 16),
                parseInt(hex[2] + hex[2], 16),
                hex.length === 4 ? parseInt(hex[3] + hex[3], 16) : 255);
        }
        return new Color (
            parseInt(hex.slice(0, 2), 16),
            parseInt(hex.slice(2, 4), 16),
            parseInt(hex.slice(4, 6), 16),
            hex.length === 8 ? parseInt(hex.slice(6, 8), 16) : 255);
    }
}
