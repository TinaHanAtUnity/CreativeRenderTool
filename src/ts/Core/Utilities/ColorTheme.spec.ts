jest.mock('Performance/Utilities/ImageAnalysis');
import { Core } from 'Core/__mocks__/Core';
import { PerformanceCampaignWithImages, PerformanceCampaign } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { ColorTheme, IImageColorTheme } from 'Core/Utilities/ColorTheme';
import { ImageAnalysis } from 'Performance/Utilities/ImageAnalysis';
import { Swatch } from 'Performance/Utilities/Swatch';
import { Color } from 'Core/Utilities/Color';

describe('ColorTheme', () => {
    const campaignWithImages = new PerformanceCampaignWithImages(new PerformanceCampaign());
    const core = new Core().Api;

    describe('calculateColorThemeForEndCard', () => {
        const swatches: Swatch[] = [];
        const firstSwatch = new Swatch([88, 14, 49], 43962);
        const secondSwatch = new Swatch([150, 15, 53], 12719);
        swatches.push(firstSwatch);
        swatches.push(secondSwatch);

        let theme: IImageColorTheme;

        beforeEach(async () => {
            (<jest.Mock>ImageAnalysis.getImageSrc).mockResolvedValue(
                'http://cdn-creatives-highwinds-prd.unityads.unity3d.com/assets/0fd53267-0620-4dce-b04f-dd70cecd4990/600x800.png'
            );
            (<jest.Mock>ImageAnalysis.analyseImage).mockResolvedValue(Promise.resolve(swatches));

            theme = await ColorTheme.calculateColorThemeForEndCard(campaignWithImages, core);
        });

        it('should return a base', () => {
            const expectedBase = {
                dark: new Color(110, 18, 61, 255),
                light: new Color(245, 189, 215, 255),
                medium: new Color(176, 28, 98, 255)
            };

            expect(theme).toHaveProperty('base', expectedBase);
        });

        it('should return a secondary', () => {
            const expectedSecondary = {
                dark: new Color(116, 12, 41, 255),
                light: new Color(248, 185, 203, 255),
                medium: new Color(185, 19, 66, 255)
            };

            expect(theme).toHaveProperty('secondary', expectedSecondary);
        });
    });
});
