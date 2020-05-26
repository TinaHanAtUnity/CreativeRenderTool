import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICoreApi } from 'Core/ICore';
import { ImageAnalysis } from 'Performance/Utilities/ImageAnalysis';
import { IColorTheme, Swatch } from 'Performance/Utilities/Swatch';
import { AUIMetric } from 'Ads/Utilities/SDKMetrics';
import { Image } from 'Ads/Models/Assets/Image';
import { CacheApi } from 'Core/Native/Cache';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';

interface IImageColorTheme {
    base: IColorTheme;
    secondary: IColorTheme;
}

export class ColorThemeError extends Error {
    public readonly tag: string;

    constructor(message: string, tag: string) {
        super(message);
        this.tag = tag;
    }
}

export class ColorTheme {
    private static convertSwatchesToImageColorTheme(swatches: Swatch[]): IImageColorTheme {
        if (!swatches || !swatches.length) {
            throw new ColorThemeError('The color tint switches are invalid', AUIMetric.InvalidEndscreenColorTintSwitches);
        }
        const base = swatches[0].getColorTheme();
        const secondary = (swatches.length > 1 ? swatches[1] : swatches[0]).getColorTheme();
        return { base, secondary };
    }

    public static calculateColorThemeForImage(image: Image, cache: CacheApi): Promise<IImageColorTheme> {
        return ImageAnalysis.getImageSrc(cache, image)
            .then(ImageAnalysis.analyseImage)
            .then((swatches) => this.convertSwatchesToImageColorTheme(swatches));
    }

    public static calculateColorThemeForEndCard(campaign: PerformanceCampaign, core: ICoreApi): Promise<IImageColorTheme> {
        return CampaignAssetInfo.getOrientedImage(campaign, core.DeviceInfo)
            .then((image: Image) => this.calculateColorThemeForImage(image, core.Cache));
    }
}
