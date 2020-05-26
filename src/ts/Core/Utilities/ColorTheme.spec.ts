import { Core } from 'Core/__mocks__/Core';
import { PerformanceCampaign, PerformanceCampaignWithImages, PerformanceCampaignMock } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { ColorTheme } from 'Core/Utilities/ColorTheme.ts';
import { Color } from 'Core/Utilities/Color';

describe('ColorTheme', () => {
    const campaignWithImages = new PerformanceCampaignWithImages();
    const campaignWithoutImages = new PerformanceCampaign();
    const core = new Core().Api;

    const getColorTheme = async (campaign: PerformanceCampaignMock) => {
        return ColorTheme.calculateColorThemeForEndCard(campaign, core);
    };

    const colorDiff = (color: Color, expectedColor: { r: number; g: number; b: number }) => {
        const r = color.r;
        const g = color.g;
        const b = color.b;
        const ex = expectedColor;
        return Math.abs(ex.r - r) + Math.abs(ex.g - g) + Math.abs(ex.b - b);
    };

    it('should successfully converts the 6 variants to their respective RGB values', async () => {
        const theme = await getColorTheme(campaignWithImages);
        const expectedBaseLight = { r: 215, g: 186, b: 247 };
        const expectedBaseMedium = { r: 98, g: 21, b: 183 };
        const expectedBaseDark = { r: 61, g: 13, b: 114 };
        const expectedSecondaryLight = { r: 206, g: 192, b: 242 };
        const expectedSecondaryMedium = { r: 73, g: 36, b: 168 };
        const expectedSecondaryDark = { r: 45, g: 22, b: 105 };

        // Because of the canvas implementation, which relies on the native implementation of the current platform,
        // It's possible to have an error down to the 1/256, caused by different software implementation or GPU drivers, etc
        // For that reason, we check if the output color is really close to the expected color.

        expect(colorDiff(theme.base.light, expectedBaseLight)).toBeLessThanOrEqual(3);
        expect(colorDiff(theme.base.medium, expectedBaseMedium)).toBeLessThanOrEqual(3);
        expect(colorDiff(theme.base.dark, expectedBaseDark)).toBeLessThanOrEqual(3);
        expect(colorDiff(theme.secondary.light, expectedSecondaryLight)).toBeLessThanOrEqual(3);
        expect(colorDiff(theme.secondary.medium, expectedSecondaryMedium)).toBeLessThanOrEqual(3);
        expect(colorDiff(theme.secondary.dark, expectedSecondaryDark)).toBeLessThanOrEqual(3);
    });

    it('should throw an error if the provided campaign has invalid images', async () => {
        await getColorTheme(campaignWithoutImages).catch((error) => {
            expect(error.tag).toEqual('invalid_image_assets');
        });
    });
});
