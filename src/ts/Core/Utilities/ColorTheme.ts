import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICoreApi } from 'Core/ICore';
import { ImageAnalysis } from 'Performance/Utilities/ImageAnalysis';
import { SDKMetrics, AUIMetric } from 'Ads/Utilities/SDKMetrics';

export class ColorTheme {
    public static renderColorTheme(campaign: PerformanceCampaign, core: ICoreApi) {
        const portraitImage = campaign.getPortrait();
        const landscapeImage = campaign.getLandscape();
        const squareImage = campaign.getSquare();
        const deviceInfo = core.DeviceInfo;

        Promise.all([deviceInfo.getScreenWidth(), deviceInfo.getScreenHeight()]).then(([screenWidth, screenHeight]) => {
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

            if (image) {
                ImageAnalysis.getImageSrc(core.Cache, image)
                    .then(ImageAnalysis.analyseImage)
                    .then((swatches) => {
                        if (!swatches || !swatches.length) {
                            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenColorTintSwitches);
                            return;
                        }

                        const baseColorTheme = swatches[0].getColorTheme();
                        const secondaryColorTheme = (swatches.length > 1 ? swatches[1] : swatches[0]).getColorTheme();
                        const colorTheme = {
                            baseColorTheme,
                            secondaryColorTheme
                        };
                    })
                    .catch((msg: string) => {
                        SDKMetrics.reportMetricEventWithTags(AUIMetric.EndscreenColorTintError, {
                            msg: msg
                        });
                    });
            }
        });
    }
}
