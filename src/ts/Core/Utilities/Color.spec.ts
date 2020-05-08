import { Color, IRGBA } from 'Core/Utilities/Color';

describe('Color Test', () => {

    const toColorTests: {
        hex: string | undefined;
        expectedColor: IRGBA;
    }[] = [
            {
                hex: '#df80b8',
                expectedColor: { r: 223, g: 128, b: 184, a: 255 }
            },
            {
                hex: '#0c36d4',
                expectedColor: { r: 12, g: 54, b: 212, a: 255 }
            },
            {
                hex: 'a6ca5c',
                expectedColor: { r: 166, g: 202, b: 92, a: 255 }
            },
            {
                hex: '#9d72a9ca',
                expectedColor: { r: 157, g: 114, b: 169, a: 202 }
            },
            {
                hex: '6d4488e2',
                expectedColor: { r: 109, g: 68, b: 136, a: 226 }
            },
            {
                hex: '789',
                expectedColor: { r: 119, g: 136, b: 153, a: 255 }
            },
            {
                hex: '36d4',
                expectedColor: { r: 51, g: 102, b: 221, a: 68 }
            },
            {
                hex: '##0c36d4',
                expectedColor: { r: 0, g: 0, b: 0, a: 0 }
            },
            {
                hex: '48F4c8x',
                expectedColor: { r: 0, g: 0, b: 0, a: 0 }
            },
            {
                hex: undefined,
                expectedColor: { r: 0, g: 0, b: 0, a: 0 }
            }
        ];

    toColorTests.forEach((test) => {
        it(`should parse hex: ${test.hex} into expectedColor: ${test.expectedColor}`, () => {
            expect(Color.hexToColor(test.hex).getRGBA()).toStrictEqual(test.expectedColor);
        });
    });

    const toCssRgbaTests: {
        hex: string | undefined;
        expectedRgba: string;
    }[] = [
            {
                hex: '#df80b8',
                expectedRgba: 'rgba(223, 128, 184, 1)'
            },
            {
                hex: '#0c36d4',
                expectedRgba: 'rgba(12, 54, 212, 1)'
            },
            {
                hex: 'a6ca5c',
                expectedRgba: 'rgba(166, 202, 92, 1)'
            },
            {
                hex: '#9d72a9ca',
                expectedRgba: 'rgba(157, 114, 169, 0.792)'
            },
            {
                hex: '6d4488e2',
                expectedRgba: 'rgba(109, 68, 136, 0.886)'
            },
            {
                hex: '789',
                expectedRgba: 'rgba(119, 136, 153, 1)'
            },
            {
                hex: '36d4',
                expectedRgba: 'rgba(51, 102, 221, 0.267)'
            },
            {
                hex: '##0c36d4',
                expectedRgba: 'rgba(0, 0, 0, 0)'
            },
            {
                hex: '48F4c8x',
                expectedRgba: 'rgba(0, 0, 0, 0)'
            },
            {
                hex: undefined,
                expectedRgba: 'rgba(0, 0, 0, 0)'
            }
        ];

    toCssRgbaTests.forEach((test) => {
        it(`should parse hex: ${test.hex} into expectedRgba: ${test.expectedRgba}`, () => {
            expect(Color.hexToCssRgba(test.hex)).toStrictEqual(test.expectedRgba);
        });
    });

    const lerpTests: {
        c1: IRGBA;
        c2: IRGBA;
        t: number;
        expectedColor: Color;
    }[] = [{
        c1: { r: 109, g: 68, b: 136, a: 226 },
        c2: { r: 223, g: 128, b: 184, a: 255 },
        t: 0.78,
        expectedColor: new Color(198, 115, 173, 249)
    }, {
        c1: { r: 119, g: 136, b: 153, a: 50 },
        c2: { r: 51, g: 102, b: 221, a: 68 },
        t: 0.5,
        expectedColor: new Color(85, 119, 187, 59)
    }, {
        c1: { r: 157, g: 114, b: 169, a: 202 },
        c2: { r: 200, g: 0, b: 5, a: 255 },
        t: 0.01,
        expectedColor: new Color(157, 113, 167, 203)
    }];

    lerpTests.forEach((test) => {
        it('should lerp colors correctly', () => {
            const lerpedColor = Color.lerp(new Color(test.c1.r, test.c1.g, test.c1.b, test.c1.a), new Color(test.c2.r, test.c2.g, test.c2.b, test.c2.a), test.t);
            expect(lerpedColor).toStrictEqual(test.expectedColor);
        });
    });
});
