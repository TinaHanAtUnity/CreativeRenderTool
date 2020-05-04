export class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;

    constructor(r: number, g: number, b: number, a: number = 255) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public toCssRgba(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${parseFloat((this.a / 255).toFixed(3))})`;
    }

    public toCssRgb(): string {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    public static lerp(c1: Color, c2: Color, t: number): Color {
        return new Color(
            Math.round(c1.r + (c2.r - c1.r) * t),
            Math.round(c1.g + (c2.g - c1.g) * t),
            Math.round(c1.b + (c2.b - c1.b) * t),
            Math.round(c1.a + (c2.a - c1.a) * t));
    }

    public static hexToCssRgba(hex?: string): string {
        const color = this.hexToColor(hex);
        return color.toCssRgba();
    }

    public static hexToColor(hex?: string): Color {
        if (!this.isValidHex(hex)) { return new Color(0, 0, 0, 0); }
        hex = hex!.replace('#', '');
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

    public static isValidHex(hex?: string): boolean {
        return hex !== undefined && /^#?(([a-f0-9]{3,4})|([a-f0-9]{6}([a-f0-9]{2})?))$/i.test(hex);
    }
}
