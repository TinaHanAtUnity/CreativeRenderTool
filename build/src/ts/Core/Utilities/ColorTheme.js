import { ImageAnalysis } from 'Performance/Utilities/ImageAnalysis';
import { AUIMetric } from 'Ads/Utilities/SDKMetrics';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
export class ColorThemeError extends Error {
    constructor(message, tag) {
        super(message);
        this.tag = tag;
    }
}
export class ColorTheme {
    static convertSwatchesToImageColorTheme(swatches) {
        if (!swatches || !swatches.length) {
            throw new ColorThemeError('The color tint switches are invalid', AUIMetric.InvalidEndscreenColorTintSwitches);
        }
        const base = swatches[0].getColorTheme();
        const secondary = (swatches.length > 1 ? swatches[1] : swatches[0]).getColorTheme();
        return { base, secondary };
    }
    static calculateColorThemeForImage(image, cache) {
        return ImageAnalysis.getImageSrc(cache, image)
            .then(ImageAnalysis.analyseImage)
            .then((swatches) => ColorTheme.convertSwatchesToImageColorTheme(swatches));
    }
    static calculateColorThemeForEndCard(campaign, core) {
        return CampaignAssetInfo.getOrientedImage(campaign, core.DeviceInfo)
            .then((image) => ColorTheme.calculateColorThemeForImage(image, core.Cache));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sb3JUaGVtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL1V0aWxpdGllcy9Db2xvclRoZW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUVwRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHckQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFPcEUsTUFBTSxPQUFPLGVBQWdCLFNBQVEsS0FBSztJQUd0QyxZQUFZLE9BQWUsRUFBRSxHQUFXO1FBQ3BDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7Q0FDSjtBQUVELE1BQU0sT0FBTyxVQUFVO0lBQ1gsTUFBTSxDQUFDLGdDQUFnQyxDQUFDLFFBQWtCO1FBQzlELElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQy9CLE1BQU0sSUFBSSxlQUFlLENBQUMscUNBQXFDLEVBQUUsU0FBUyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7U0FDakg7UUFDRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNwRixPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFTSxNQUFNLENBQUMsMkJBQTJCLENBQUMsS0FBWSxFQUFFLEtBQWU7UUFDbkUsT0FBTyxhQUFhLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7YUFDekMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUM7YUFDaEMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0NBQWdDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRU0sTUFBTSxDQUFDLDZCQUE2QixDQUFDLFFBQTZCLEVBQUUsSUFBYztRQUNyRixPQUFPLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDO2FBQy9ELElBQUksQ0FBQyxDQUFDLEtBQVksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLDJCQUEyQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMzRixDQUFDO0NBQ0oifQ==