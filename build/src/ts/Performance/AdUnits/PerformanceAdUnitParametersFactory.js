import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { ExternalEndScreen } from 'ExternalEndScreen/Views/ExternalEndScreen';
import { ExternalMRAIDEndScreen } from 'ExternalEndScreen/Views/ExternalMRAIDEndScreen';
export class PerformanceAdUnitParametersFactory extends AbstractAdUnitParametersFactory {
    createParameters(baseParams) {
        const overlay = this.createOverlay(baseParams, baseParams.privacy);
        const adUnitStyle = baseParams.campaign.getAdUnitStyle() || AdUnitStyle.getDefaultAdUnitStyle();
        const endScreenParameters = Object.assign({}, this.createEndScreenParameters(baseParams.privacy, baseParams.campaign.getGameName(), baseParams), { adUnitStyle: adUnitStyle, campaignId: baseParams.campaign.getId(), osVersion: baseParams.deviceInfo.getOsVersion() });
        const video = this.getVideo(baseParams.campaign, baseParams.forceOrientation);
        const endScreen = this.createEndscreen(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        return Object.assign({}, baseParams, { video: video, overlay: overlay, endScreen: endScreen, adUnitStyle: adUnitStyle });
    }
    createEndscreen(endScreenParameters, campaign, country) {
        if (campaign.getEndScreenType() === 'mraid') {
            return new ExternalMRAIDEndScreen(endScreenParameters, campaign, country);
        }
        else if (campaign.getEndScreenType() === 'iframe') {
            return new ExternalEndScreen(undefined, endScreenParameters, campaign, country);
        }
        else {
            return new PerformanceEndScreen(endScreenParameters, campaign, country);
        }
    }
    createVideoOverlay(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo) {
        return new VideoOverlay(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);
    }
    createOverlay(parameters, privacy) {
        let showPrivacyDuringVideo = parameters.placement.skipEndCardOnClose() || false;
        // hide privacy icon for China
        if (parameters.adsConfig.getHidePrivacy()) {
            showPrivacyDuringVideo = false;
        }
        const showGDPRBanner = this.showGDPRBanner(parameters) && showPrivacyDuringVideo;
        const overlay = this.createVideoOverlay(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);
        if (parameters.placement.disableVideoControlsFade()) {
            overlay.setFadeEnabled(false);
        }
        return overlay;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VBZFVuaXRQYXJhbWV0ZXJzRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9QZXJmb3JtYW5jZS9BZFVuaXRzL1BlcmZvcm1hbmNlQWRVbml0UGFyYW1ldGVyc0ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFdEYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRXJELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBSTlFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUM5RSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUV4RixNQUFNLE9BQU8sa0NBQW1DLFNBQVEsK0JBQWtGO0lBRTVILGdCQUFnQixDQUFDLFVBQWtEO1FBQ3pFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVuRSxNQUFNLFdBQVcsR0FBZ0IsVUFBVSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxXQUFXLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUU3RyxNQUFNLG1CQUFtQixxQkFDakIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRSxVQUFVLENBQUMsSUFDckcsV0FBVyxFQUFFLFdBQVcsRUFDeEIsVUFBVSxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQ3ZDLFNBQVMsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxHQUNsRCxDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFckgseUJBQ1EsVUFBVSxJQUNkLEtBQUssRUFBRSxLQUFLLEVBQ1osT0FBTyxFQUFFLE9BQU8sRUFDaEIsU0FBUyxFQUFFLFNBQVMsRUFDcEIsV0FBVyxFQUFFLFdBQVcsSUFDMUI7SUFDTixDQUFDO0lBRU8sZUFBZSxDQUFDLG1CQUF5QyxFQUFFLFFBQTZCLEVBQUUsT0FBZTtRQUM3RyxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLE9BQU8sRUFBRTtZQUN6QyxPQUFPLElBQUksc0JBQXNCLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQzdFO2FBQU0sSUFBSSxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxRQUFRLEVBQUU7WUFDakQsT0FBTyxJQUFJLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDbkY7YUFBTTtZQUNILE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDM0U7SUFDTCxDQUFDO0lBRVMsa0JBQWtCLENBQUMsVUFBdUMsRUFBRSxPQUF3QixFQUFFLGNBQXVCLEVBQUUsc0JBQStCO1FBQ3BKLE9BQU8sSUFBSSxZQUFZLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRVMsYUFBYSxDQUFDLFVBQXVDLEVBQUUsT0FBd0I7UUFDckYsSUFBSSxzQkFBc0IsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLElBQUksS0FBSyxDQUFDO1FBRWhGLDhCQUE4QjtRQUM5QixJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLEVBQUU7WUFDeEMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDO1NBQ2pDO1FBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxzQkFBc0IsQ0FBQztRQUNqRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztRQUVyRyxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLEVBQUUsRUFBRTtZQUNqRCxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2pDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztDQUNKIn0=