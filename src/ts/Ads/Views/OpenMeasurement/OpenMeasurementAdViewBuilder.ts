import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { Platform } from 'Core/Constants/Platform';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IRectangle, IAdView, ObstructionReasons, IViewPort } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { Campaign } from 'Ads/Models/Campaign';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';

export class OpenMeasurementAdViewBuilder {

    private _campaign: Campaign;
    private _platform: Platform;

    private _deviceInfo: DeviceInfo;
    private _viewPort: IViewPort;

    private _videoViewRectangle: IRectangle;

    constructor(campaign: AdMobCampaign | VastCampaign, deviceInfo: DeviceInfo, platform: Platform) {
        this._platform = platform;
        this._campaign = campaign;
        this._deviceInfo = deviceInfo;
    }

    /**
     * The video view is only used for the adview which gets calculated after session start has finished run
     * @param videoView IRectangle passed on session start
     */
    public setVideoView(videoView: IRectangle) {
        if (this._platform === Platform.ANDROID && this._campaign instanceof VastCampaign) {
            videoView.x = OpenMeasurementUtilities.pxToDp(videoView.x, <AndroidDeviceInfo>this._deviceInfo);
            videoView.y = OpenMeasurementUtilities.pxToDp(videoView.y, <AndroidDeviceInfo>this._deviceInfo);
            videoView.width = OpenMeasurementUtilities.pxToDp(videoView.width, <AndroidDeviceInfo>this._deviceInfo);
            videoView.height = OpenMeasurementUtilities.pxToDp(videoView.height, <AndroidDeviceInfo>this._deviceInfo);
        }
        this._videoViewRectangle = videoView;
    }

    public setViewPort(viewPort: IViewPort) {
        this._viewPort = viewPort;
    }

    public getVideoView(): IRectangle {
        return this._videoViewRectangle;
    }

    public getViewPort(): IViewPort {
        return this._viewPort;
    }

    public buildVastImpressionAdView(screenWidth: number, screenHeight: number, measuringElementAvailable: boolean): IAdView {
        const screenRectangle = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
        let percentageInView = 100;

        if (this.getVideoView()) {
            percentageInView = OpenMeasurementUtilities.calculateObstructionOverlapPercentage(this.getVideoView(), screenRectangle);
        }

        const obstructionReasons: ObstructionReasons[] = [];

        return this.calculateVastAdView(percentageInView, obstructionReasons, measuringElementAvailable, [], screenWidth, screenHeight);
    }

    public buildAdmobAdView(obstructionReasons: ObstructionReasons[], om: AdmobOpenMeasurementController, obstructionRect: IRectangle): Promise<IAdView> {
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([screenWidth, screenHeight]) => {

            const videoView =  om.getAdmobVideoElementBounds();
            this.setVideoView(videoView);
            let screenView;

            if (this._platform === Platform.ANDROID) {
                screenWidth = OpenMeasurementUtilities.pxToDpAdmobScreenView(screenWidth, this._deviceInfo);
                screenHeight = OpenMeasurementUtilities.pxToDpAdmobScreenView(screenHeight, this._deviceInfo);
            }
            screenView = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
            this._viewPort = OpenMeasurementUtilities.calculateViewPort(screenWidth, screenHeight);

            const percentInView = OpenMeasurementUtilities.calculatePercentageInView(videoView, obstructionRect, screenView);

            return this.calculateVastAdView(percentInView, obstructionReasons, true, [obstructionRect], screenWidth, screenHeight);
        });
    }

    // TODO: Handle case of foregrounded view that is already obstructed by the privacy overlay
    public buildVastAdView(obstructionReasons: ObstructionReasons[], adunit: VastAdUnit, obstructionRect?: IRectangle): Promise<IAdView> {
        if (obstructionReasons.includes(ObstructionReasons.BACKGROUNDED)) {
            return this.calculateBackgroundedAdView(obstructionReasons, obstructionRect);
        } else {
            return this.calculateNonBackgroundedAdView(obstructionReasons, adunit, obstructionRect);
        }
    }

    private calculateBackgroundedAdView(obstructionReasons: ObstructionReasons[], obstructionRect?: IRectangle): Promise<IAdView> {
        const promises: [Promise<number>, Promise<number>] = [this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()];
        return Promise.all(promises)
        .then(([screenWidth, screenHeight]) => {
            let screenView;

            if (this._platform === Platform.ANDROID) {
                screenWidth = OpenMeasurementUtilities.pxToDp(screenWidth, <AndroidDeviceInfo>this._deviceInfo);
                screenHeight = OpenMeasurementUtilities.pxToDp(screenHeight, <AndroidDeviceInfo>this._deviceInfo);
            }

            if (!obstructionRect) {
                obstructionRect = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
            }

            screenView = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
            this._viewPort = OpenMeasurementUtilities.calculateViewPort(screenWidth, screenHeight);
            return this.calculateVastAdView(0, obstructionReasons, true, [obstructionRect], screenWidth, screenHeight);
        });
    }

    private calculateNonBackgroundedAdView(obstructionReasons: ObstructionReasons[], adunit: VastAdUnit, obstructionRect?: IRectangle): Promise<IAdView> {
        if (this._videoViewRectangle) {
            return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()])
            .then(([screenWidth, screenHeight]) => {

                const videoView = this._videoViewRectangle;

                if (this._platform === Platform.ANDROID) {
                    screenWidth = OpenMeasurementUtilities.pxToDp(screenWidth, <AndroidDeviceInfo>this._deviceInfo);
                    screenHeight = OpenMeasurementUtilities.pxToDp(screenHeight, <AndroidDeviceInfo>this._deviceInfo);
                }

                const screenView = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
                this._viewPort = OpenMeasurementUtilities.calculateViewPort(screenWidth, screenHeight);
                if (obstructionRect) {
                    // obstructed adview
                    const percentInView = OpenMeasurementUtilities.calculatePercentageInView(videoView, obstructionRect, screenView);
                    return this.calculateVastAdView(percentInView, obstructionReasons, true, [obstructionRect], screenWidth, screenHeight);
                } else {
                    // unobstructed adview
                    return this.calculateVastAdView(OpenMeasurementUtilities.calculateObstructionOverlapPercentage(videoView, screenView), obstructionReasons, true, [], screenWidth, screenHeight);
                }
            });
        } else {
            const promises: [Promise<number>, Promise<number>, Promise<number[]>] = [this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight(), adunit.getVideoViewRectangle()];
            return Promise.all(promises)
            .then(([screenWidth, screenHeight, rectangle]) => {
                let videoView;

                if (this._platform === Platform.ANDROID) {
                    screenWidth = OpenMeasurementUtilities.pxToDp(screenWidth, <AndroidDeviceInfo>this._deviceInfo);
                    screenHeight = OpenMeasurementUtilities.pxToDp(screenHeight, <AndroidDeviceInfo>this._deviceInfo);
                    const rect0 = OpenMeasurementUtilities.pxToDp(rectangle[0], <AndroidDeviceInfo>this._deviceInfo);
                    const rect1 = OpenMeasurementUtilities.pxToDp(rectangle[1], <AndroidDeviceInfo>this._deviceInfo);
                    const rect2 = OpenMeasurementUtilities.pxToDp(rectangle[2], <AndroidDeviceInfo>this._deviceInfo);
                    const rect3 = OpenMeasurementUtilities.pxToDp(rectangle[3], <AndroidDeviceInfo>this._deviceInfo);

                    videoView = OpenMeasurementUtilities.createRectangle(rect0, rect1, rect2, rect3);
                } else {
                    videoView = OpenMeasurementUtilities.createRectangle(rectangle[0], rectangle[1], rectangle[2], rectangle[3]);
                }

                const screenView = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
                this._viewPort = OpenMeasurementUtilities.calculateViewPort(screenWidth, screenHeight);
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
    }

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
        const videoViewRectangle = this.getVideoView();
        if (videoViewRectangle) {
            topLeftX = videoViewRectangle.x;
            topLeftY = videoViewRectangle.y;
            videoWidth = videoViewRectangle.width;
            videoHeight = videoViewRectangle.height;
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
            percentageInView: Math.trunc(percentInView),
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
