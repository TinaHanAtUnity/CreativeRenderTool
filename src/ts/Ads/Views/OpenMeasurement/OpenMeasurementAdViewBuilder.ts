import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { Platform } from 'Core/Constants/Platform';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IRectangle, IAdView, ObstructionReasons, IViewPort } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { Campaign } from 'Ads/Models/Campaign';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';

export class OpenMeasurementAdViewBuilder {

    private _videoViewRectangle: IRectangle;
    private _campaign: Campaign;
    private _screenWidth: number;
    private _screenHeight: number;
    private _platform: Platform;

    private _screenViewRectangle: IRectangle;
    private _deviceInfo: DeviceInfo;
    private _viewPort: IViewPort;

    constructor(campaign: AdMobCampaign | VastCampaign, deviceInfo: DeviceInfo, platform: Platform) {
        this._platform = platform;
        this._campaign = campaign;
        this._deviceInfo = deviceInfo;
    }

    public getViewPort(): IViewPort {
        if (this._viewPort) {
            return this._viewPort;
        }

        return {width: 0, height: 0};
    }

    public buildVastAdView(obstructionReasons: ObstructionReasons[], adunit: VastAdUnit, obstructionRect?: IRectangle): Promise<IAdView> {
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight(), adunit.getVideoViewRectangle()])
        .then(([screenWidth, screenHeight, rectangle]) => {
            let videoView;
            let screenView;

            if (!obstructionRect && obstructionReasons.includes(ObstructionReasons.BACKGROUNDED)) {
                obstructionRect = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
            }

            if (this._platform === Platform.ANDROID) {
                screenWidth = OpenMeasurementUtilities.pxToDp(screenWidth, this._deviceInfo, this._platform);
                screenHeight = OpenMeasurementUtilities.pxToDp(screenHeight, this._deviceInfo, this._platform);
                const rect0 = OpenMeasurementUtilities.pxToDp(rectangle[0], this._deviceInfo, this._platform);
                const rect1 = OpenMeasurementUtilities.pxToDp(rectangle[1], this._deviceInfo, this._platform);
                const rect2 = OpenMeasurementUtilities.pxToDp(rectangle[2], this._deviceInfo, this._platform);
                const rect3 = OpenMeasurementUtilities.pxToDp(rectangle[3], this._deviceInfo, this._platform);

                videoView = OpenMeasurementUtilities.createRectangle(rect0, rect1, rect2, rect3);
            } else {
                videoView = OpenMeasurementUtilities.createRectangle(rectangle[0], rectangle[1], rectangle[2], rectangle[3]);
            }

            screenView = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
            this._viewPort = OpenMeasurementUtilities.calculateViewPort(screenWidth, screenHeight);
            this._videoViewRectangle = videoView;

            if (OpenMeasurementUtilities.calculateObstructionOverlapPercentage(videoView, screenView) < 100) {
                obstructionReasons.push(ObstructionReasons.HIDDEN);
            }

            if (obstructionRect) {
                // obstructed adview
                const percentInView = OpenMeasurementUtilities.calculatePercentageInView(videoView, obstructionRect, screenView);
                return this.calculateVastAdView(percentInView, obstructionReasons, true, [obstructionRect], screenWidth, screenHeight);
            } else {
                // unobstructed adview
                return this.calculateVastAdView(OpenMeasurementUtilities.calculateObstructionOverlapPercentage(videoView, screenView), obstructionReasons, true, [], screenWidth, screenHeight);
            }
        });
    }

    // public buildAdmobAdView(obstructionReasons: ObstructionReasons[], obstructionRect?: IRectangle): Promise<IAdView> {
    //     return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([screenWidth, screenHeight]) => {
    //         if (this._platform === Platform.ANDROID) {
    //             const viewPort = OpenMeasurementUtilities.calculateViewPort(screenWidth, screenHeight);
    //             return calculateVastAdView();
    //         } else {
    //             return calculateVastAdView();
    //         }
    //     })
    // }

    /**
     * All AdViews will assume fullscreen interstitial video
     * so onscreen geometry, onscreencontainer geometry, and container geometry will be the same as geometry and have [0,0] origin
     */
    public calculateVastAdView(percentInView: number, obstructionReasons: ObstructionReasons[], measuringElementAvailable: boolean, obstructionRectangles: IRectangle[], screenWidth: number, screenHeight: number): IAdView {

        let topLeftX = 0;
        let topLeftY = 0;
        let videoWidth = 0;
        let videoHeight = 0;

        // For integrations SDK 3.2.0+ and Admob
        if (this._videoViewRectangle) {
            topLeftX = this._videoViewRectangle.x;
            topLeftY = this._videoViewRectangle.y;
            videoWidth = this._videoViewRectangle.width;
            videoHeight = this._videoViewRectangle.height;
        } else {
            // For integrations less than SDK 3.2.0 -> For partial om cert if needed
            topLeftX = 0;
            topLeftY = OpenMeasurementUtilities.estimateAdViewTopLeftYPostition(videoHeight, screenWidth, screenHeight);
            videoWidth = OpenMeasurementUtilities.calculateAdViewVideoWidth(screenWidth, screenHeight, this._campaign);
            videoHeight = OpenMeasurementUtilities.calculateAdViewVideoHeight(screenWidth, screenHeight, this._campaign);
        }

        if (obstructionReasons.includes(ObstructionReasons.BACKGROUNDED)) {
            topLeftX = 0;
            topLeftY = 0;
            videoWidth = 0;
            videoHeight = 0;
        }

        const adView: IAdView = {
            percentageInView: percentInView,
            geometry: {
                x: topLeftX,
                y: topLeftY,
                width: videoWidth,
                height: videoHeight
            },
            onScreenGeometry: {
                x: topLeftX,
                y: topLeftY,
                width: videoWidth,
                height: videoHeight,
                obstructions: obstructionRectangles
            },
            measuringElement: measuringElementAvailable,
            reasons: obstructionReasons
        };

        /*
        * Only provided if both the native-layer ad view and web-layer
        * ad element exist and are available for measurement
        */
        if (measuringElementAvailable) {
            adView.containerGeometry = {
                x: 0,
                y: 0,
                width: screenWidth,
                height: screenHeight
            };
            adView.onScreenContainerGeometry = {
                x: 0,
                y: 0,
                width: screenWidth,
                height: screenHeight,
                obstructions: obstructionRectangles
            };
        }

        return adView;
    }
}
