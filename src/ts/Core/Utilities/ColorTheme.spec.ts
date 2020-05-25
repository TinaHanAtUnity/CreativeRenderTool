import { Core } from 'Core/__mocks__/Core';
import { PerformanceCampaign, PerformanceCampaignWithoutImages, PerformanceCampaignMock } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { ColorTheme } from 'Core/Utilities/ColorTheme.ts';

describe('ColorTheme', () => {
    const campaignWithImages = new PerformanceCampaign();
    const campaignWithoutImages = new PerformanceCampaignWithoutImages();
    const core = new Core().Api;

    const getColorTheme = async (campaign: PerformanceCampaignMock) => {
        return ColorTheme.renderColorTheme(campaign, core);
    };

    // RGBToHex transforms a string in the "rgb(1, 12, 123)" format to the "#010C7B"
    const RGBToHex = (rgb: string): string => {
        const sep = rgb.indexOf(',') > -1 ? ',' : ' ';
        const splitRgb = rgb.substr(4).split(')')[0].split(sep);
        let res = '#';
        splitRgb.forEach((component: string) => {
            let c = (+component).toString(16);
            if (c.length === 1) {
                c = '0' + c;
            }
            res += c;
        });
        return res;
    };

    it('should successfully converts the 6 variants to their RGB values', async () => {
        const theme = await getColorTheme(campaignWithImages);
        expect(RGBToHex(theme.baseColorTheme.light.toCssRgb())).toEqual('#d7baf7');
        expect(RGBToHex(theme.baseColorTheme.medium.toCssRgb())).toEqual('#6215b7');
        expect(RGBToHex(theme.baseColorTheme.dark.toCssRgb())).toEqual('#3d0d72');
        expect(RGBToHex(theme.secondaryColorTheme.light.toCssRgb())).toEqual('#cec0f2');
        expect(RGBToHex(theme.secondaryColorTheme.medium.toCssRgb())).toEqual('#4924a8');
        expect(RGBToHex(theme.secondaryColorTheme.dark.toCssRgb())).toEqual('#2d1669');
    });

    it('should throw an error if the campaign provided has invalid images', async () => {
        await getColorTheme(campaignWithoutImages).catch((error) => {
            expect(error.message).toEqual('invalid_image_assets');
        });
    });
});

// expect(RGBToHex(theme.baseColorTheme.light.toCssRgb())).toEqual('rgb(215, 186, 247)');
// expect(RGBToHex(theme.baseColorTheme.medium.toCssRgb())).toEqual('rgb(98, 21, 183)');
// expect(RGBToHex(theme.baseColorTheme.dark.toCssRgb())).toEqual('rgb(61, 13, 114)');
// expect(RGBToHex(theme.secondaryColorTheme.light.toCssRgb())).toEqual('rgb(206, 192, 242)');
// expect(RGBToHex(theme.secondaryColorTheme.medium.toCssRgb())).toEqual('rgb(73, 36, 168)');
// expect(RGBToHex(theme.secondaryColorTheme.dark.toCssRgb())).toEqual('rgb(45, 22, 105)');
