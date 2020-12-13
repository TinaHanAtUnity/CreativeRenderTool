import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';
export class DisplayInterstitialAdUnitParametersFactory extends AbstractAdUnitParametersFactory {
    constructor(core, ads) {
        super(core, ads);
        this._webPlayerContainer = ads.InterstitialWebPlayerContainer;
    }
    createParameters(baseParams) {
        const view = new DisplayInterstitial(baseParams.platform, baseParams.core, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.privacy, this.showGDPRBanner(baseParams), baseParams.adsConfig.getHidePrivacy());
        return Object.assign({}, baseParams, { webPlayerContainer: this._webPlayerContainer, view });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUludGVyc3RpdGlhbEFkVW5pdFBhcmFtZXRlcnNGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Rpc3BsYXkvQWRVbml0cy9EaXNwbGF5SW50ZXJzdGl0aWFsQWRVbml0UGFyYW1ldGVyc0ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFJdEYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFLeEUsTUFBTSxPQUFPLDBDQUEyQyxTQUFRLCtCQUFrRztJQUc5SixZQUFZLElBQVcsRUFBRSxHQUFTO1FBQzlCLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQztJQUNsRSxDQUFDO0lBRVMsZ0JBQWdCLENBQUMsVUFBMEQ7UUFFakYsTUFBTSxJQUFJLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUN6Tyx5QkFDUSxVQUFVLElBQ2Qsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUM1QyxJQUFJLElBQ047SUFDTixDQUFDO0NBQ0oifQ==