import { Platform } from 'Core/Constants/Platform';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { Campaign } from 'Ads/Models/Campaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IViewPort, IRectangle, DoubleClickAdmobVendorTags } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';

export class OpenMeasurementUtilities {

    public static getScreenDensity(platform: Platform, deviceInfo: DeviceInfo): number {
        if (platform === Platform.ANDROID) {
            return (<AndroidDeviceInfo> deviceInfo).getScreenDensity();
        }
        return 0;
    }

    /**
     * Used only for sdk 3.2 and below OMID certification
     * Converts html/css generated values to scale with device size based on estimate
     * @param size px size to convert
     * @param density old android density value
     */
    public static convertDpToPixels(size: number, density: number): number {
        return size * (density / 160);
    }

    /**
     * Will be calculated properly for sdk 3.3+
     * Converts pixels from native to estimated DPs using native magic number
     * @param px size to convert
     * @param deviceInfo deviceinfo
     * @param platform Android/IOS
     */
    public static pxToDp(px: number, deviceInfo: AndroidDeviceInfo): number {
        return px / deviceInfo.getDisplayMetricDensity();
    }

    /**
     * Used to convert android screenview to dp for admob to
     * enable OM geometry change on all sdk versions
     * @param px pixel size of value
     * @param deviceInfo deviceinfo
     */
    public static pxToDpAdmobScreenView(px: number, deviceInfo: DeviceInfo): number {
        return Math.trunc((px / (<AndroidDeviceInfo>deviceInfo).getScreenDensity()) * 160);
    }

    public static createRectangle(x: number, y: number, width: number, height: number): IRectangle {
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    }

    public static calculateViewPort(screenWidth: number, screenHeight: number): IViewPort {
        return {
            width: screenWidth,
            height: screenHeight
        };
    }

    public static calculatePercentageInView(videoRectangle: IRectangle, obstruction: IRectangle, screenRectangle: IRectangle) {
        const adjustedObstruction = this.calculateScreenAdjustedObstruction(obstruction, screenRectangle);
        const obstructionOverlapPercentage = this.calculateObstructionOverlapPercentage(videoRectangle, adjustedObstruction);
        const percentOfVideoInViewPort = this.calculateObstructionOverlapPercentage(videoRectangle, screenRectangle);

        return  percentOfVideoInViewPort - obstructionOverlapPercentage;
    }

    public static calculateObstructionOverlapPercentage(videoView: IRectangle, obstruction: IRectangle) {
        let obstructionOverlapArea = 0;

        const videoXMin = videoView.x;
        const videoYMin = videoView.y;
        const videoXMax = videoView.x + videoView.width;
        const videoYMax = videoView.y + videoView.height;

        const obstructionXMin = obstruction.x;
        const obstructionYMin = obstruction.y;
        const obstructionXMax = obstruction.x + obstruction.width;
        const obstructionYMax = obstruction.y + obstruction.height;

        const dx = Math.min(videoXMax, obstructionXMax) - Math.max(videoXMin, obstructionXMin);
        const dy = Math.min(videoYMax, obstructionYMax) - Math.max(videoYMin, obstructionYMin);
        if ((dx >= 0) && (dy >= 0)) {
            obstructionOverlapArea = dx * dy;
        }

        const videoArea = videoView.width * videoView.height;
        const obstructionOverlapPercentage = obstructionOverlapArea / videoArea;

        return obstructionOverlapPercentage * 100;
    }

    private static calculateScreenAdjustedObstruction(obstruction: IRectangle, screenRectangle: IRectangle) {
        let adjustedObstruction = obstruction;

        const obstructionXMin = obstruction.x;
        const obstructionYMin = obstruction.y;
        const obstructionXMax = obstruction.x + obstruction.width;
        const obstructionYMax = obstruction.y + obstruction.height;

        const screenXMax = screenRectangle.x + screenRectangle.width;
        const screenYMax = screenRectangle.y + screenRectangle.height;

        if (obstructionXMax > screenXMax) {
            adjustedObstruction.width = screenRectangle.width - obstruction.x;
        }

        if (obstructionYMax > screenYMax) {
            adjustedObstruction.height = screenRectangle.height - obstruction.y;
        }

        if (obstructionXMin >= screenXMax || obstructionYMin >= screenYMax) {
            adjustedObstruction = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
        }

        return adjustedObstruction;
    }

    public static calculateAdViewVideoWidth(screenWidth: number, screenHeight: number, campaign: Campaign) {
        let videoWidth = screenWidth;

        const isLandscape = screenWidth > screenHeight;
        let campaignVideoWidth = 0;

        // TODO: Will be removed in subsequent refactor
        // The campaign values are not to scale to device
        // But we need a solution like this for fallback OM certification <3.2
        if (campaign instanceof VastCampaign) {
            campaignVideoWidth = campaign.getVideo().getWidth();
        }

        if (!isLandscape && campaignVideoWidth > 0) {
            videoWidth = campaignVideoWidth;
        }

        return videoWidth;
    }

    public static calculateAdViewVideoHeight(screenWidth: number, screenHeight: number, campaign: Campaign) {
        let videoHeight = screenHeight;

        const isLandscape = screenWidth > screenHeight;
        let campaignVideoHeight = 0;

        // TODO: Will be removed in subsequent refactor
        // The campaign values are not to scale to device
        // But we need a solution like this for fallback OM certification <3.2
        if (campaign instanceof VastCampaign) {
            campaignVideoHeight = campaign.getVideo().getHeight();
        }

        if (!isLandscape && campaignVideoHeight > 0) {
            videoHeight = campaignVideoHeight;
        }

        return videoHeight;
    }

    public static estimateAdViewTopLeftYPostition(videoHeight: number, screenWidth: number, screenHeight: number) {
        let topLeftY = 0;

        const isLandscape = screenWidth > screenHeight;
        if (!isLandscape && videoHeight > 0) {
            const centerpoint = screenHeight / 2;
            topLeftY = centerpoint - (videoHeight / 2);
        }

        return topLeftY;
    }

    public static setMetricTag(vendor: string) {
        let tag = '';
        switch (vendor) {
            case DoubleClickAdmobVendorTags.SSP:
                tag = 'ssp';
            case DoubleClickAdmobVendorTags.DSP:
                tag = 'dsp';
            case DoubleClickAdmobVendorTags.Neutral:
                tag = 'neut';
            default:
                tag = 'undefined';
        }

        return tag;
    }
}
