export class Color {
    public static hexToCssRgba(hex: string): string {
        const rgba = this.hexToRgba(hex);
        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${parseFloat((rgba.a / 255).toFixed(3))})`;
    }

    public static hexToRgba(hex: string): {r: number; g: number; b: number; a: number} {
        if (!hex) { return {r: 0, g: 0, b: 0, a: 0}; }
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
            a: hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) : 255
        };
    }
}
