import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IRectangle, IAdView, ObstructionReasons, IViewPort } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { Campaign } from 'Ads/Models/Campaign';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';

export class OpenMeasurementAdViewBuilder {

    private _campaign: Campaign;
    private _viewPort: IViewPort;
    private _videoViewRectangle: IRectangle;

    constructor(campaign: AdMobCampaign | VastCampaign) {
        this._campaign = campaign;
    }

    /**
     * The video view is only used for the adview which gets calculated after session start has finished run
     * @param videoView IRectangle passed on session start
     */
    public setVideoView(videoView: IRectangle) {
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

    public buildAdmobImpressionView(om: AdmobOpenMeasurementController, screenWidth: number, screenHeight: number) {
        const videoView = om.getAdmobVideoElementBounds();
        this.setVideoView(videoView);
        let screenView;
        let percentageInView = 100;

        screenView = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
        percentageInView = OpenMeasurementUtilities.calculateObstructionOverlapPercentage(this.getVideoView(), screenView);

        const obstructionReasons: ObstructionReasons[] = [];

        return this.calculateVastAdView(percentageInView, obstructionReasons, true, [], screenWidth, screenHeight);
    }

    public buildAdmobAdView(obstructionReasons: ObstructionReasons[], om: AdmobOpenMeasurementController, obstructionRect: IRectangle): IAdView {
        const videoView = om.getAdmobVideoElementBounds();
        this.setVideoView(videoView);
        let screenView;
        let percentInView = 100;

        screenView = OpenMeasurementUtilities.createRectangle(0, 0, screen.width, screen.height);
        this._viewPort = OpenMeasurementUtilities.calculateViewPort(screen.width, screen.height);
        let obstructionRects = [obstructionRect];

        if (obstructionReasons.includes(ObstructionReasons.BACKGROUNDED)) {
            percentInView = 0;
            obstructionRects = [];
        } else if (!obstructionReasons.includes(ObstructionReasons.OBSTRUCTED)) {
            obstructionRects = [];
        } else {
            percentInView = OpenMeasurementUtilities.calculatePercentageInView(videoView, obstructionRect, screenView);
        }

        return this.calculateVastAdView(percentInView, obstructionReasons, true, obstructionRects, screen.width, screen.height);
    }

    // TODO: Handle case of foregrounded view that is already obstructed by the privacy overlay
    public buildVastAdView(obstructionReasons: ObstructionReasons[], obstructionRect?: IRectangle): IAdView {
        if (obstructionReasons.includes(ObstructionReasons.BACKGROUNDED)) {
            return this.calculateBackgroundedAdView(obstructionReasons, obstructionRect);
        } else {
            return this.calculateNonBackgroundedAdView(obstructionReasons, obstructionRect);
        }
    }

    private calculateBackgroundedAdView(obstructionReasons: ObstructionReasons[], obstructionRect?: IRectangle): IAdView {
        if (!obstructionRect) {
            obstructionRect = OpenMeasurementUtilities.createRectangle(0, 0, screen.width, screen.height);
        }
        this._viewPort = OpenMeasurementUtilities.calculateViewPort(screen.width, screen.height);
        return this.calculateVastAdView(0, obstructionReasons, true, [obstructionRect], screen.width, screen.height);
    }

    private calculateNonBackgroundedAdView(obstructionReasons: ObstructionReasons[], obstructionRect?: IRectangle): IAdView {

        const videoView = this._videoViewRectangle;
        const screenView = OpenMeasurementUtilities.createRectangle(0, 0, screen.width, screen.height);
        this._viewPort = OpenMeasurementUtilities.calculateViewPort(screen.width, screen.height);
        if (obstructionRect) {
            // obstructed adview
            const percentInView = OpenMeasurementUtilities.calculatePercentageInView(videoView, obstructionRect, screenView);
            return this.calculateVastAdView(percentInView, obstructionReasons, true, [obstructionRect], screen.width, screen.height);
        } else {
            // unobstructed adview
            return this.calculateVastAdView(OpenMeasurementUtilities.calculateObstructionOverlapPercentage(videoView, screenView), obstructionReasons, true, [], screen.width, screen.height);
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
        * Only provided if web-layer ad element exists and is available for measurement
        */
        if (measuringElementAvailable && this._campaign instanceof AdMobCampaign) {
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
