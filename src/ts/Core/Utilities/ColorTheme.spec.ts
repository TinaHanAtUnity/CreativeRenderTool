jest.mock('Performance/Utilities/ImageAnalysis');
import { mocked } from 'ts-jest/utils';
import { Core } from 'Core/__mocks__/Core';
import { PerformanceCampaignWithImages } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { ColorTheme, IImageColorTheme } from 'Core/Utilities/ColorTheme.ts';
import { ImageAnalysis } from 'Performance/Utilities/ImageAnalysis';
import { Swatch } from 'Performance/Utilities/Swatch';

describe('ColorTheme', () => {
    const campaignWithImages = new PerformanceCampaignWithImages();
    const core = new Core().Api;
    const mockedImageAnalysis = mocked(ImageAnalysis, true);

    describe('calculateColorThemeForEndCard', () => {
        const swatches: Swatch[] | Promise<Swatch[]> = [];
        const firstSwatch = new Swatch([88, 14, 49], 43962);
        const secondSwatch = new Swatch([150, 15, 53], 12719);
        swatches.push(firstSwatch);
        swatches.push(secondSwatch);

        let theme: IImageColorTheme;

        beforeAll(async () => {
            mockedImageAnalysis.getImageSrc.mockResolvedValue(
                'http://cdn-creatives-highwinds-prd.unityads.unity3d.com/assets/0fd53267-0620-4dce-b04f-dd70cecd4990/600x800.png'
            );
            mockedImageAnalysis.analyseImage.mockResolvedValue(swatches);
            theme = await ColorTheme.calculateColorThemeForEndCard(campaignWithImages, core);
        });

        it('should return a base and a secondary', () => {
            const expectedBase = {
                dark: { a: 255, b: 61, g: 18, r: 110 },
                light: { a: 255, b: 215, g: 189, r: 245 },
                medium: { a: 255, b: 98, g: 28, r: 176 }
            };
            const expectedSecondary = {
                dark: { a: 255, b: 41, g: 12, r: 116 },
                light: { a: 255, b: 203, g: 185, r: 248 },
                medium: { a: 255, b: 66, g: 19, r: 185 }
            };

            expect(theme).toHaveProperty('base', expectedBase);
            expect(theme).toHaveProperty('secondary', expectedSecondary);
        });
    });
});
