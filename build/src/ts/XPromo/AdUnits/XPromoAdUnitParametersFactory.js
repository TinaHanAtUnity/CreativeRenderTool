import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
export class XPromoAdUnitParametersFactory extends AbstractAdUnitParametersFactory {
    createParameters(baseParams) {
        const overlay = this.createOverlay(baseParams, baseParams.privacy);
        const endScreenParameters = this.createEndScreenParameters(baseParams.privacy, baseParams.campaign.getGameName(), baseParams);
        const endScreen = new XPromoEndScreen(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        const video = this.getVideo(baseParams.campaign, baseParams.forceOrientation);
        return Object.assign({}, baseParams, { video: video, overlay: overlay, endScreen: endScreen });
    }
    createOverlay(parameters, privacy) {
        let showPrivacyDuringVideo = parameters.placement.skipEndCardOnClose() || false;
        // hide privacy icon for China
        if (parameters.adsConfig.getHidePrivacy()) {
            showPrivacyDuringVideo = false;
        }
        const showGDPRBanner = this.showGDPRBanner(parameters) && showPrivacyDuringVideo;
        const overlay = new VideoOverlay(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);
        if (parameters.placement.disableVideoControlsFade()) {
            overlay.setFadeEnabled(false);
        }
        return overlay;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vQWRVbml0UGFyYW1ldGVyc0ZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvWFByb21vL0FkVW5pdHMvWFByb21vQWRVbml0UGFyYW1ldGVyc0ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFJdEYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBSS9ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUV0RCxNQUFNLE9BQU8sNkJBQThCLFNBQVEsK0JBQXdFO0lBQzdHLGdCQUFnQixDQUFDLFVBQTZDO1FBQ3BFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVuRSxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUgsTUFBTSxTQUFTLEdBQUcsSUFBSSxlQUFlLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDcEgsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRTlFLHlCQUNRLFVBQVUsSUFDZCxLQUFLLEVBQUUsS0FBSyxFQUNaLE9BQU8sRUFBRSxPQUFPLEVBQ2hCLFNBQVMsRUFBRSxTQUFTLElBQ3RCO0lBQ04sQ0FBQztJQUVPLGFBQWEsQ0FBQyxVQUF1QyxFQUFFLE9BQXdCO1FBQ25GLElBQUksc0JBQXNCLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLEtBQUssQ0FBQztRQUVoRiw4QkFBOEI7UUFDOUIsSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxFQUFFO1lBQ3ZDLHNCQUFzQixHQUFHLEtBQUssQ0FBQztTQUNsQztRQUVELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksc0JBQXNCLENBQUM7UUFDakYsTUFBTSxPQUFPLEdBQUcsSUFBSSxZQUFZLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztRQUU5RixJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLEVBQUUsRUFBRTtZQUNqRCxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2pDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztDQUNKIn0=