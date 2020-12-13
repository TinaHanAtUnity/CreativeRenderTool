import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
export class OpenMeasurementAdViewBuilder {
    constructor(campaign) {
        this._campaign = campaign;
    }
    /**
     * The video view is only used for the adview which gets calculated after session start has finished run
     * @param videoView IRectangle passed on session start
     */
    setVideoView(videoView) {
        this._videoViewRectangle = videoView;
    }
    setViewPort(viewPort) {
        this._viewPort = viewPort;
    }
    getVideoView() {
        return this._videoViewRectangle;
    }
    getViewPort() {
        return this._viewPort;
    }
    buildVastImpressionAdView(screenWidth, screenHeight, measuringElementAvailable) {
        const screenRectangle = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
        let percentageInView = 100;
        if (this.getVideoView()) {
            percentageInView = OpenMeasurementUtilities.calculateObstructionOverlapPercentage(this.getVideoView(), screenRectangle);
        }
        const obstructionReasons = [];
        return this.calculateVastAdView(percentageInView, obstructionReasons, measuringElementAvailable, [], screenWidth, screenHeight);
    }
    buildAdmobImpressionView(om, screenWidth, screenHeight) {
        const videoView = om.getAdmobVideoElementBounds();
        this.setVideoView(videoView);
        let screenView;
        let percentageInView = 100;
        screenView = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
        percentageInView = OpenMeasurementUtilities.calculateObstructionOverlapPercentage(this.getVideoView(), screenView);
        const obstructionReasons = [];
        return this.calculateVastAdView(percentageInView, obstructionReasons, true, [], screenWidth, screenHeight);
    }
    buildAdmobAdView(obstructionReasons, om, obstructionRect) {
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
        }
        else if (!obstructionReasons.includes(ObstructionReasons.OBSTRUCTED)) {
            obstructionRects = [];
        }
        else {
            percentInView = OpenMeasurementUtilities.calculatePercentageInView(videoView, obstructionRect, screenView);
        }
        return this.calculateVastAdView(percentInView, obstructionReasons, true, obstructionRects, screen.width, screen.height);
    }
    // TODO: Handle case of foregrounded view that is already obstructed by the privacy overlay
    buildVastAdView(obstructionReasons, obstructionRect) {
        if (obstructionReasons.includes(ObstructionReasons.BACKGROUNDED)) {
            return this.calculateBackgroundedAdView(obstructionReasons, obstructionRect);
        }
        else {
            return this.calculateNonBackgroundedAdView(obstructionReasons, obstructionRect);
        }
    }
    calculateBackgroundedAdView(obstructionReasons, obstructionRect) {
        if (!obstructionRect) {
            obstructionRect = OpenMeasurementUtilities.createRectangle(0, 0, screen.width, screen.height);
        }
        this._viewPort = OpenMeasurementUtilities.calculateViewPort(screen.width, screen.height);
        return this.calculateVastAdView(0, obstructionReasons, true, [obstructionRect], screen.width, screen.height);
    }
    calculateNonBackgroundedAdView(obstructionReasons, obstructionRect) {
        const videoView = this._videoViewRectangle;
        const screenView = OpenMeasurementUtilities.createRectangle(0, 0, screen.width, screen.height);
        this._viewPort = OpenMeasurementUtilities.calculateViewPort(screen.width, screen.height);
        if (obstructionRect) {
            // obstructed adview
            const percentInView = OpenMeasurementUtilities.calculatePercentageInView(videoView, obstructionRect, screenView);
            return this.calculateVastAdView(percentInView, obstructionReasons, true, [obstructionRect], screen.width, screen.height);
        }
        else {
            // unobstructed adview
            return this.calculateVastAdView(OpenMeasurementUtilities.calculateObstructionOverlapPercentage(videoView, screenView), obstructionReasons, true, [], screen.width, screen.height);
        }
    }
    /**
     * All AdViews will assume fullscreen interstitial video
     * so onscreen geometry, onscreencontainer geometry, and container geometry will be the same as geometry and have [0,0] origin
     */
    calculateVastAdView(percentInView, obstructionReasons, measuringElementAvailable, obstructionRectangles, screenWidth, screenHeight) {
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
        }
        else {
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
        const adView = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3Blbk1lYXN1cmVtZW50QWRWaWV3QnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVmlld3MvT3Blbk1lYXN1cmVtZW50L09wZW5NZWFzdXJlbWVudEFkVmlld0J1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTNELE9BQU8sRUFBdUIsa0JBQWtCLEVBQWEsTUFBTSxvREFBb0QsQ0FBQztBQUV4SCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUc5RixNQUFNLE9BQU8sNEJBQTRCO0lBTXJDLFlBQVksUUFBc0M7UUFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFlBQVksQ0FBQyxTQUFxQjtRQUNyQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxDQUFDO0lBQ3pDLENBQUM7SUFFTSxXQUFXLENBQUMsUUFBbUI7UUFDbEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDOUIsQ0FBQztJQUVNLFlBQVk7UUFDZixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztJQUNwQyxDQUFDO0lBRU0sV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0lBRU0seUJBQXlCLENBQUMsV0FBbUIsRUFBRSxZQUFvQixFQUFFLHlCQUFrQztRQUMxRyxNQUFNLGVBQWUsR0FBRyx3QkFBd0IsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDbEcsSUFBSSxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7UUFFM0IsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUU7WUFDckIsZ0JBQWdCLEdBQUcsd0JBQXdCLENBQUMscUNB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