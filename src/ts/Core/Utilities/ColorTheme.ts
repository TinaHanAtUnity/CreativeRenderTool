import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICoreApi } from 'Core/ICore';
import { ImageAnalysis } from 'Performance/Utilities/ImageAnalysis';
import { IColorTheme } from 'Performance/Utilities/Swatch';

interface IEndcardColorTheme {
    baseColorTheme: IColorTheme;
    secondaryColorTheme: IColorTheme;
}
export class ColorTheme {
    public static renderColorTheme(campaign: PerformanceCampaign, core: ICoreApi): Promise<IEndcardColorTheme> {
        const portraitImage = campaign.getPortrait();
        const landscapeImage = campaign.getLandscape();
        const squareImage = campaign.getSquare();
        const deviceInfo = core.DeviceInfo;

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
                Promise.reject();
            }

            return ImageAnalysis.getImageSrc(core.Cache, image!)
                .then(ImageAnalysis.analyseImage)
                .then((swatches) => {
                    if (!swatches || !swatches.length) {
                        Promise.reject();
                    }

                    const baseColorTheme = swatches[0].getColorTheme();
                    const secondaryColorTheme = (swatches.length > 1 ? swatches[1] : swatches[0]).getColorTheme();
                    return { baseColorTheme, secondaryColorTheme };
                });
        });
    }
}
