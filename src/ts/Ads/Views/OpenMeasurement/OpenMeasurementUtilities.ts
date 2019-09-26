import { Platform } from 'Core/Constants/Platform';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { Campaign } from 'Ads/Models/Campaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IViewPort, IRectangle, ObstructionReasons, IAdView } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';

export class OpenMeasurementUtilities {

    public static getScreenDensity(platform: Platform, deviceInfo: DeviceInfo): number {
        if (platform === Platform.ANDROID) {
            return (<AndroidDeviceInfo> deviceInfo).getScreenDensity();
        }
        return 0;
    }

    public static getAndroidViewSize(size: number, density: number): number {
        return size * (density / 160);
    }

    public static pxToDp(px: number, deviceInfo: DeviceInfo, platform: Platform): number {
        if (platform === Platform.ANDROID) {
            return Math.trunc((px / (<AndroidDeviceInfo>deviceInfo).getScreenDensity()) * 160);
        }
        return px;
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

    // public static VideoViewRectangle: IRectangle | undefined;

    /**
     * All AdViews will assume fullscreen interstitial video
     * so onscreen geometry, onscreencontainer geometry, and container geometry will be the same as geometry and have [0,0] origin
     */
    // public static calculateVastAdView(percentInView: number, obstructionReasons: ObstructionReasons[], screenWidth: number, screenHeight: number, measuringElementAvailable: boolean, obstructionRectangles: IRectangle[], campaign: Campaign): IAdView {

    //     let topLeftX = 0;
    //     let topLeftY = 0;
    //     let videoWidth = 0;
    //     let videoHeight = 0;

    //     // For integrations SDK 3.2.0+ and Admob
    //     if (this.VideoViewRectangle) {
    //         topLeftX = this.VideoViewRectangle.x;
    //         topLeftY = this.VideoViewRectangle.y;
    //         videoWidth = this.VideoViewRectangle.width;
    //         videoHeight = this.VideoViewRectangle.height;
    //     } else {
    //         // For integrations less than SDK 3.2.0 -> For partial om cert if needed
    //         topLeftX = 0;
    //         topLeftY = OpenMeasurementUtilities.estimateAdViewTopLeftYPostition(videoHeight, screenWidth, screenHeight);
    //         videoWidth = OpenMeasurementUtilities.calculateAdViewVideoWidth(screenWidth, screenHeight, campaign);
    //         videoHeight = OpenMeasurementUtilities.calculateAdViewVideoHeight(screenWidth, screenHeight, campaign);
    //     }

    //     if (obstructionReasons.includes(ObstructionReasons.BACKGROUNDED)) {
    //         topLeftX = 0;
    //         topLeftY = 0;
    //         videoWidth = 0;
    //         videoHeight = 0;
    //     }

    //     const adView: IAdView = {
    //         percentageInView: percentInView,
    //         geometry: {
    //             x: topLeftX,
    //             y: topLeftY,
    //             width: videoWidth,
    //             height: videoHeight
    //         },
    //         onScreenGeometry: {
    //             x: topLeftX,
    //             y: topLeftY,
    //             width: videoWidth,
    //             height: videoHeight,
    //             obstructions: obstructionRectangles
    //         },
    //         measuringElement: measuringElementAvailable,
    //         reasons: obstructionReasons
    //     };

    //     /*
    //     * Only provided if both the native-layer ad view and web-layer
    //     * ad element exist and are available for measurement
    //     */
    //     if (measuringElementAvailable) {
    //         adView.containerGeometry = {
    //             x: 0,
    //             y: 0,
    //             width: screenWidth,
    //             height: screenHeight
    //         };
    //         adView.onScreenContainerGeometry = {
    //             x: 0,
    //             y: 0,
    //             width: screenWidth,
    //             height: screenHeight,
    //             obstructions: obstructionRectangles
    //         };
    //     }

    //     return adView;
    // }

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
}
