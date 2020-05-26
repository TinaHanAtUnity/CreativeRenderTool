import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICoreApi } from 'Core/ICore';
import { ImageAnalysis } from 'Performance/Utilities/ImageAnalysis';
import { IColorTheme, Swatch } from 'Performance/Utilities/Swatch';
import { AUIMetric } from 'Ads/Utilities/SDKMetrics';
import { Image } from 'Ads/Models/Assets/Image';
import { CacheApi } from 'Core/Native/Cache';
import { DeviceInfoApi } from 'Core/Native/DeviceInfo';

interface IImageColorTheme {
    base: IColorTheme;
    secondary: IColorTheme;
}

class ColorThemeError extends Error {
    public readonly tag: string;

    constructor(message: string, tag: string) {
        super(message);
        this.tag = tag;
    }
}

export class ColorTheme {
    public static getOrientedImage(campaign: PerformanceCampaign, deviceInfo: DeviceInfoApi): Promise<Image> {
        const portraitImage = campaign.getPortrait();
        const landscapeImage = campaign.getLandscape();
        const squareImage = campaign.getSquare();
        return Promise.all([deviceInfo.getScreenWidth(), deviceInfo.getScreenHeight()]).then(([screenWidth, screenHeight]) => {
            const isLandscape = screenWidth > screenHeight;
            let image;
            if (squareImage) {
                image = squareImage;
            } else if (isLandscape && portraitImage) {
                image = portraitImage; // when the device is in landscape mode, we are showing a portrait image
            } else if (landscapeImage) {
                image = landscapeImage;
            } else {
                image = portraitImage;
            }
            if (!image) {
                throw new ColorThemeError('The images assets provided are invalid', AUIMetric.InvalidImageAssets);
            }
            return image;
        });
    }

    public static convertSwatchesToImageColorTheme(swatches: Swatch[]): IImageColorTheme {
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
            .then((swatches) => ColorTheme.convertSwatchesToImageColorTheme(swatches));
    }

    public static calculateColorThemeForEndCard(campaign: PerformanceCampaign, core: ICoreApi): Promise<IImageColorTheme> {
        return ColorTheme.getOrientedImage(campaign, core.DeviceInfo)
            .then((image: Image) => ColorTheme.calculateColorThemeForImage(image, core.Cache));
    }
}
