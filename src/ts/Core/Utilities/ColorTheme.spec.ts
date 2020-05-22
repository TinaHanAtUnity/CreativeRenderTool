import { Core } from 'Core/__mocks__/Core';
import { PerformanceCampaign } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { ColorTheme } from 'Core/Utilities/ColorTheme.ts';

describe('ColorTheme', () => {
    const campaign = new PerformanceCampaign();
    const core = new Core().Api;

    it('should successfully converts the 6 variants to their RGB values', async () => {
        const getColorTheme = async () => {
            return ColorTheme.renderColorTheme(campaign, core);
        };

        await getColorTheme().then((theme) => {
            expect(theme.baseColorTheme.light.toCssRgb()).toEqual('rgb(215, 186, 247)');
            expect(theme.baseColorTheme.medium.toCssRgb()).toEqual('rgb(98, 21, 183)');
            expect(theme.baseColorTheme.dark.toCssRgb()).toEqual('rgb(61, 13, 114)');
            expect(theme.secondaryColorTheme.light.toCssRgb()).toEqual('rgb(206, 192, 242)');
            expect(theme.secondaryColorTheme.medium.toCssRgb()).toEqual('rgb(73, 36, 168)');
            expect(theme.secondaryColorTheme.dark.toCssRgb()).toEqual('rgb(45, 22, 105)');
            expect(theme.secondaryColorTheme.dark.toCssRgb()).toEqual('rgb(45, 22, 105)');
        });
    });
});
