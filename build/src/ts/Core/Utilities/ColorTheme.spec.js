import * as tslib_1 from "tslib";
jest.mock('Performance/Utilities/ImageAnalysis');
import { Core } from 'Core/__mocks__/Core';
import { PerformanceCampaignWithImages, PerformanceCampaign } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { ColorTheme } from 'Core/Utilities/ColorTheme';
import { ImageAnalysis } from 'Performance/Utilities/ImageAnalysis';
import { Swatch } from 'Performance/Utilities/Swatch';
import { Color } from 'Core/Utilities/Color';
describe('ColorTheme', () => {
    const campaignWithImages = new PerformanceCampaignWithImages(new PerformanceCampaign());
    const core = new Core().Api;
    describe('calculateColorThemeForEndCard', () => {
        describe('When calculateColorThemeForEndCard succeeds', () => {
            const swatches = [];
            const firstSwatch = new Swatch([88, 14, 49], 43962);
            const secondSwatch = new Swatch([150, 15, 53], 12719);
            swatches.push(firstSwatch);
            swatches.push(secondSwatch);
            let theme;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                ImageAnalysis.getImageSrc.mockResolvedValue('http://cdn-creatives-highwinds-prd.unityads.unity3d.com/assets/0fd53267-0620-4dce-b04f-dd70cecd4990/600x800.png');
                ImageAnalysis.analyseImage.mockResolvedValue(Promise.resolve(swatches));
                theme = yield ColorTheme.calculateColorThemeForEndCard(campaignWithImages, core);
            }));
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
        describe('When calculateColorThemeForEndCard errors', () => {
            const swatches = [];
            beforeEach(() => {
                ImageAnalysis.analyseImage.mockResolvedValue(Promise.resolve(swatches));
            });
            it('should error when given invalid swatches', () => {
                return expect(ColorTheme.calculateColorThemeForEndCard(campaignWithImages, core)).rejects.toThrowError('The color tint switches are invalid');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sb3JUaGVtZS5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvVXRpbGl0aWVzL0NvbG9yVGhlbWUuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0FBQ2pELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUN0SCxPQUFPLEVBQUUsVUFBVSxFQUFvQixNQUFNLDJCQUEyQixDQUFDO0FBQ3pFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUNwRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDdEQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRTdDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQ3hCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLG1CQUFtQixFQUFFLENBQUMsQ0FBQztJQUN4RixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUU1QixRQUFRLENBQUMsK0JBQStCLEVBQUUsR0FBRyxFQUFFO1FBQzNDLFFBQVEsQ0FBQyw2Q0FBNkMsRUFBRSxHQUFHLEVBQUU7WUFDekQsTUFBTSxRQUFRLEdBQWEsRUFBRSxDQUFDO1lBQzlCLE1BQU0sV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNwRCxNQUFNLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxD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