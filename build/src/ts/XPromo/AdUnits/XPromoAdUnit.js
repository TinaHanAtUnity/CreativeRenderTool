import { VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
export class XPromoAdUnit extends VideoAdUnit {
    constructor(parameters) {
        super(parameters);
        parameters.overlay.setSpinnerEnabled(!CampaignAssetInfo.isCached(parameters.campaign));
        this._endScreen = parameters.endScreen;
        this._endScreen.render();
        this._endScreen.hide();
        document.body.appendChild(this._endScreen.container());
        this._privacy = parameters.privacy;
    }
    hide() {
        const endScreen = this.getEndScreen();
        if (endScreen) {
            endScreen.hide();
            const container = endScreen.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
        }
        this._privacy.hide();
        const privacyContainer = this._privacy.container();
        if (privacyContainer && privacyContainer.parentElement) {
            privacyContainer.parentElement.removeChild(privacyContainer);
        }
        return super.hide();
    }
    description() {
        return 'xpromo';
    }
    getEndScreen() {
        return this._endScreen;
    }
    onVideoError() {
        const endScreen = this.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
    }
    unsetReferences() {
        super.unsetReferences();
        delete this._endScreen;
        delete this._privacy;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vQWRVbml0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1hQcm9tby9BZFVuaXRzL1hQcm9tb0FkVW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQTBCLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBU3BFLE1BQU0sT0FBTyxZQUFhLFNBQVEsV0FBMkI7SUFLekQsWUFBWSxVQUFtQztRQUMzQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFbEIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUV2RixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFDdkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUV2RCxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7SUFDdkMsQ0FBQztJQUVNLElBQUk7UUFDUCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEMsSUFBSSxTQUFTLEVBQUU7WUFDWCxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakIsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3hDLElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxhQUFhLEVBQUU7Z0JBQ3RDLFNBQVMsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ2xEO1NBQ0o7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNuRCxJQUFJLGdCQUFnQixJQUFJLGdCQUFnQixDQUFDLGFBQWEsRUFBRTtZQUNwRCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDaEU7UUFFRCxPQUFPLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRU0sV0FBVztRQUNkLE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFTSxZQUFZO1FBQ2YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFTSxZQUFZO1FBQ2YsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3RDLElBQUksU0FBUyxFQUFFO1lBQ1gsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3BCO0lBQ0wsQ0FBQztJQUVTLGVBQWU7UUFDckIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN2QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztDQUNKIn0=