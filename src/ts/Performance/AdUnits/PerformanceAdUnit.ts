import { IVideoAdUnitParameters, VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { DownloadManager } from 'China/Managers/DownloadManager';
import { DeviceIdManager } from 'China/Managers/DeviceIdManager';

export interface IPerformanceAdUnitParameters extends IVideoAdUnitParameters<PerformanceCampaign> {
    endScreen: PerformanceEndScreen;
    adUnitStyle?: AdUnitStyle;
    downloadManager?: DownloadManager;
    deviceIdManager?: DeviceIdManager;
}

export class PerformanceAdUnit extends VideoAdUnit<PerformanceCampaign> {

    private _endScreen: PerformanceEndScreen;
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
        const endScreen = this.getEndScreen();
        if(endScreen) {
            endScreen.hide();
            endScreen.container().parentElement!.removeChild(endScreen.container());
        }
        if (this._privacy) {
            this._privacy.hide();
            this._privacy.container().parentElement!.removeChild(this._privacy.container());
        }

        return super.hide();
    }

    public description(): string {
        return 'performance';
    }

    public getEndScreen(): PerformanceEndScreen | undefined {
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
        if(endScreen) {
            endScreen.show();
        }
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._performanceCampaign, ICometTrackingUrlEvents.ERROR);
    }

    protected unsetReferences() {
        super.unsetReferences();
        delete this._endScreen;
        delete this._privacy;
    }
}
