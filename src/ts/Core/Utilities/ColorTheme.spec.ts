jest.mock('Performance/Utilities/ImageAnalysis');
import { Core } from 'Core/__mocks__/Core';
import { PerformanceCampaignWithImages } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { ColorTheme, IImageColorTheme } from 'Core/Utilities/ColorTheme.ts';
import { ImageAnalysis } from 'Performance/Utilities/ImageAnalysis';
import { Swatch, IColorTheme } from 'Performance/Utilities/Swatch';
import { Color } from 'Core/Utilities/Color';

describe('ColorTheme', () => {
    const campaignWithImages = new PerformanceCampaignWithImages();
    const core = new Core().Api;
    const mockedImageAnalysis = ImageAnalysis;

    describe('calculateColorThemeForEndCard', () => {
        const swatches: Swatch[] | Promise<Swatch[]> = [];
        const firstSwatch = new Swatch([88, 14, 49], 43962);
        const secondSwatch = new Swatch([150, 15, 53], 12719);
        swatches.push(firstSwatch);
        swatches.push(secondSwatch);

        let theme: IImageColorTheme;
        let expectedBase: IColorTheme;
        let expectedSecondary: IColorTheme;

        beforeAll(async () => {
            (<jest.Mock>mockedImageAnalysis.getImageSrc).mockResolvedValue(
                'http://cdn-creatives-highwinds-prd.unityads.unity3d.com/assets/0fd53267-0620-4dce-b04f-dd70cecd4990/600x800.png'
            );
            (<jest.Mock>mockedImageAnalysis.analyseImage).mockResolvedValue(swatches);

            theme = await ColorTheme.calculateColorThemeForEndCard(campaignWithImages, core);
            expectedBase = {
                dark: new Color(110, 18, 61, 255),
                light: new Color(245, 189, 215, 255),
                medium: new Color(176, 28, 98, 255)
            };
            expectedSecondary = {
                dark: new Color(116, 12, 41, 255),
                light: new Color(248, 185, 203, 255),
                medium: new Color(185, 19, 66, 255)
            };
        });

        it('should return a base and a secondary', () => {
            expect(theme).toHaveProperty('base', expectedBase);
            expect(theme).toHaveProperty('secondary', expectedSecondary);
        });
    });
});
