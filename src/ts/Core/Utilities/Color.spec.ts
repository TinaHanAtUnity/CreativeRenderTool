import { Color } from 'Core/Utilities/Color';

describe('Color Test', () => {

    const toColorTests: {
        hex: string | undefined;
        expectedColor: Color;
    }[] = [
            {
                hex: '#df80b8',
                expectedColor: new Color(223, 128, 184, 255)
            },
            {
                hex: '#0c36d4',
                expectedColor: new Color(12, 54, 212, 255)
            },
            {
                hex: 'a6ca5c',
                expectedColor: new Color(166, 202, 92, 255)
            },
            {
                hex: '#9d72a9ca',
                expectedColor: new Color(157, 114, 169, 202)
            },
            {
                hex: '6d4488e2',
                expectedColor: new Color(109, 68, 136, 226)
            },
            {
                hex: '789',
                expectedColor: new Color(119, 136, 153, 255)
            },
            {
                hex: '36d4',
                expectedColor: new Color(51, 102, 221, 68)
            },
            {
                hex: '##0c36d4',
                expectedColor: new Color(0, 0, 0, 0)
            },
            {
                hex: '48F4c8x',
                expectedColor: new Color(0, 0, 0, 0)
            },
            {
                hex: undefined,
                expectedColor: new Color(0, 0, 0, 0)
            }
        ];

    toColorTests.forEach((test) => {
        it(`should parse hex: ${test.hex} into expectedColor: ${test.expectedColor}`, () => {
            expect(Color.hexToColor(test.hex)).toStrictEqual(test.expectedColor);
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
        c1: Color;
        c2: Color;
        t: number;
        expectedColor: Color;
    }[] = [{
        c1: new Color(109, 68, 136, 226),
        c2: new Color(223, 128, 184, 255),
        t: 0.78,
        expectedColor: new Color(198, 115, 173, 249)
    }, {
        c1: new Color(119, 136, 153, 50),
        c2: new Color(51, 102, 221, 68),
        t: 0.5,
        expectedColor: new Color(85, 119, 187, 59)
    }, {
        c1: new Color(157, 114, 169, 202),
        c2: new Color(200, 0, 5, 255),
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
