import { IVideoAdUnitParameters, VideoAdUnit, VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { IObserver1, IObserver2 } from 'Core/Utilities/IObserver';
import { IAppSheetOptions } from 'Ads/Native/iOS/AppSheet';

export interface IPerformanceAdUnitParameters extends IVideoAdUnitParameters<PerformanceCampaign> {
    endScreen: PerformanceEndScreen;
    adUnitStyle?: AdUnitStyle;
}

export enum AppSheetState {
    OPENED,
    CLOSED,
    ERRORED
}

export class PerformanceAdUnit extends VideoAdUnit<PerformanceCampaign> {

    private _endScreen: PerformanceEndScreen;
    private _privacy: AbstractPrivacy;
    private _performanceCampaign: PerformanceCampaign;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _appSheetState: AppSheetState;
    private _appSheetOpenObserver: IObserver1<IAppSheetOptions>;
    private _appSheetCloseObserver: IObserver1<IAppSheetOptions>;
    private _appSheetErrorObserver: IObserver2<string, IAppSheetOptions>;

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

        this._appSheetOpenObserver = this._ads.iOS!.AppSheet.onOpen.subscribe(() => {
            this.onAppSheetOpened();
        });

        this._appSheetCloseObserver = this._ads.iOS!.AppSheet.onClose.subscribe(() => {
            this.onAppSheetClosed();
        });

        this._appSheetErrorObserver = this._ads.iOS!.AppSheet.onError.subscribe(() => {
            this.onAppSheetErrored();
        });
    }

    private onAppSheetOpened(): void {
        this._appSheetState = AppSheetState.OPENED;
        if (this.canShowVideo()) {
            this.setVideoState(VideoState.PAUSED);
            this._ads.VideoPlayer.pause();
        }
    }

    private onAppSheetClosed(): void {
        this._appSheetState = AppSheetState.CLOSED;
        if (this.isShowing() && this.canShowVideo() && this.canPlayVideo()) {
            this.setVideoState(VideoState.PLAYING);
            this._ads.VideoPlayer.play();
        }
    }

    private onAppSheetErrored(): void {
        this._appSheetState = AppSheetState.ERRORED;
        if (this.isShowing() && this.canShowVideo() && this.canPlayVideo()) {
            this.setVideoState(VideoState.PLAYING);
            this._ads.VideoPlayer.play();
        }
    }

    public isVideoVisible(): boolean {
        return this._appSheetState !== AppSheetState.OPENED;
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

        this._ads.iOS!.AppSheet.onOpen.unsubscribe(this._appSheetOpenObserver);
        this._ads.iOS!.AppSheet.onClose.unsubscribe(this._appSheetCloseObserver);
        this._ads.iOS!.AppSheet.onError.unsubscribe(this._appSheetErrorObserver);

        return super.hide();
    }

    public description(): string {
        return 'performance';
    }

    public getEndScreen(): PerformanceEndScreen | undefined {
        return this._endScreen;
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
