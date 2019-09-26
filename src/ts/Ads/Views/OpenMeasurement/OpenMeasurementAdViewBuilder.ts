import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { Platform } from 'Core/Constants/Platform';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IRectangle, IAdView, ObstructionReasons, IViewPort } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { Campaign } from 'Ads/Models/Campaign';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';

export class OpenMeasurementAdViewBuilder {

    private _videoViewRectangle: IRectangle;
    private _campaign: Campaign;
    private _platform: Platform;

    private _deviceInfo: DeviceInfo;
    private _viewPort: IViewPort;

    constructor(campaign: AdMobCampaign | VastCampaign, deviceInfo: DeviceInfo, platform: Platform) {
        this._platform = platform;
        this._campaign = campaign;
        this._deviceInfo = deviceInfo;
    }

    public buildVideoView() {
        this._videoViewRectangle = OpenMeasurementUtilities.videoView;
    }

    public getVideoView(): IRectangle {
        if (this._platform === Platform.ANDROID && !OpenMeasurementUtilities.androidDPConverted && OpenMeasurementUtilities.videoView && this._campaign instanceof VastCampaign) {
            OpenMeasurementUtilities.videoView.x = OpenMeasurementUtilities.pxToDp(OpenMeasurementUtilities.videoView.x, this._deviceInfo, this._platform);
            OpenMeasurementUtilities.videoView.y = OpenMeasurementUtilities.pxToDp(OpenMeasurementUtilities.videoView.y, this._deviceInfo, this._platform);
            OpenMeasurementUtilities.videoView.width = OpenMeasurementUtilities.pxToDp(OpenMeasurementUtilities.videoView.width, this._deviceInfo, this._platform);
            OpenMeasurementUtilities.videoView.height = OpenMeasurementUtilities.pxToDp(OpenMeasurementUtilities.videoView.height, this._deviceInfo, this._platform);
            OpenMeasurementUtilities.androidDPConverted = true;
        }
        return OpenMeasurementUtilities.videoView;
    }

    public getViewPort(): IViewPort {
        if (this._viewPort) {
            return this._viewPort;
        }

        return { width: 0, height: 0 };
    }

    public buildVastImpressionAdView(screenWidth: number, screenHeight: number, measuringElementAvailable: boolean): IAdView {
        const screenRectangle = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
        let percentageInView = 100;

        if (this.getVideoView()) {
            percentageInView = OpenMeasurementUtilities.calculateObstructionOverlapPercentage(this.getVideoView(), screenRectangle);
        }

        const obstructionReasons: ObstructionReasons[] = [];

        // TODO: Remove reason hidden as per IAB
        if (percentageInView < 100) {
            obstructionReasons.push(ObstructionReasons.HIDDEN);
        }

        return this.calculateVastAdView(percentageInView, obstructionReasons, measuringElementAvailable, [], screenWidth, screenHeight);
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
                screenWidth = OpenMeasurementUtilities.pxToDp(screenWidth, this._deviceInfo, this._platform);
                screenHeight = OpenMeasurementUtilities.pxToDp(screenHeight, this._deviceInfo, this._platform);
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
        const promises: [Promise<number>, Promise<number>, Promise<number[]>] = [this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight(), adunit.getVideoViewRectangle()];
        return Promise.all(promises)
        .then(([screenWidth, screenHeight, rectangle]) => {
            let videoView;
            let screenView;

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

    public buildAdmobAdView(obstructionReasons: ObstructionReasons[], om: AdmobOpenMeasurementController, obstructionRect?: IRectangle): Promise<IAdView> {
        const popup = <HTMLElement>document.querySelector('.pop-up');
        const gdprRect = popup.getBoundingClientRect();
        const gdprRectx = gdprRect.left;
        const gdprRecty = gdprRect.top;
        const gdprRectwidth = gdprRect.width;
        const gdprRectheight = gdprRect.height;

        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([screenWidth, screenHeight]) => {

            const obstructionRectangle = OpenMeasurementUtilities.createRectangle(gdprRectx, gdprRecty, gdprRectwidth, gdprRectheight);
            const videoView =  om.getAdmobVideoElementBounds();
            OpenMeasurementUtilities.videoView = videoView;
            let screenView;

            if (this._platform === Platform.ANDROID) {
                screenWidth = OpenMeasurementUtilities.pxToDp(screenWidth, this._deviceInfo, this._platform);
                screenHeight = OpenMeasurementUtilities.pxToDp(screenHeight, this._deviceInfo, this._platform);
            }
            screenView = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
            this._viewPort = OpenMeasurementUtilities.calculateViewPort(screenWidth, screenHeight);

            if (OpenMeasurementUtilities.calculateObstructionOverlapPercentage(videoView, screenView) < 100) {
                obstructionReasons.push(ObstructionReasons.HIDDEN);
            }

            const percentInView = OpenMeasurementUtilities.calculatePercentageInView(videoView, obstructionRectangle, screenView);

            return this.calculateVastAdView(percentInView, obstructionReasons, true, [obstructionRectangle], screenWidth, screenHeight);
        });
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
