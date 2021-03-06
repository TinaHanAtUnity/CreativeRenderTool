import { IVideoAdUnitParameters, VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { ExternalEndScreen } from 'ExternalEndScreen/Views/ExternalEndScreen';

export interface IPerformanceAdUnitParameters extends IVideoAdUnitParameters<PerformanceCampaign> {
    endScreen: PerformanceEndScreen | ExternalEndScreen;
    adUnitStyle?: AdUnitStyle;
}

export class PerformanceAdUnit extends VideoAdUnit<PerformanceCampaign> {

    private _endScreen: PerformanceEndScreen | ExternalEndScreen;
    private _privacy: AbstractPrivacy;
    private _performanceCampaign: PerformanceCampaign;
    private _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(parameters: IPerformanceAdUnitParameters) {
        super(parameters);

        parameters.overlay.setSpinnerEnabled(!CampaignAssetInfo.isCached(parameters.campaign));

        this._endScreen = parameters.endScreen;
        this._endScreen.render();
        this._endScreen.hide();
        document.body.appendChild(this._endScreen.container());

        this._privacy = parameters.privacy;
        this._performanceCampaign = parameters.campaign;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
    }

    public hide(): Promise<void> {
        if (this._endScreen) {
            this._endScreen.hide();
            const endScreenContainer = this._endScreen.container();
            if (endScreenContainer && endScreenContainer.parentElement) {
                endScreenContainer.parentElement.removeChild(endScreenContainer);
            }
        }
        if (this._privacy) {
            this._privacy.hide();
            const privacyContainer = this._privacy.container();
            if (privacyContainer && privacyContainer.parentElement) {
                privacyContainer.parentElement.removeChild(privacyContainer);
            }
        }

        return super.hide();
    }

    public description(): string {
        return 'performance';
    }

    public getEndScreen(): PerformanceEndScreen | ExternalEndScreen | undefined {
        return this._endScreen;
    }

    public setDownloadStatusMessage(message: string): void {
        const downloadMessageText = document.body.getElementsByClassName('download-message-text')[0];
        if (downloadMessageText) {
            downloadMessageText.innerHTML = message;
        }
    }

    public disableDownloadButton(): void {
        const downloadContainer = document.body.getElementsByClassName('download-container')[0];
        if (downloadContainer) {
            downloadContainer.classList.add('disabled');
        }
    }

    public enableDownloadButton(): void {
        const downloadContainer = document.body.getElementsByClassName('download-container')[0];
        if (downloadContainer) {
            downloadContainer.classList.remove('disabled');
        }
    }

    public onVideoError(): void {
        const endScreen = this.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
        this.sendTrackingEvent(TrackingEvent.ERROR);
    }

    public sendTrackingEvent(event: TrackingEvent) {
        this._thirdPartyEventManager.sendTrackingEvents(this._performanceCampaign, event, 'performance');
    }

    public getCampaign(): PerformanceCampaign {
        return this._performanceCampaign;
    }

    protected unsetReferences() {
        super.unsetReferences();
        delete this._endScreen;
        delete this._privacy;
    }
}
