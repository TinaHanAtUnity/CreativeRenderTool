import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { IObserver1, IObserver2 } from 'Core/Utilities/IObserver';
import { IAppSheetOptions } from 'Ads/Native/iOS/AppSheet';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { PerformanceAdUnit, IPerformanceAdUnitParameters } from 'Performance/AdUnits/PerformanceAdUnit';

export enum AppSheetState {
    OPENED,
    CLOSED,
    ERRORED
}

export class IOSPerformanceAdUnit extends PerformanceAdUnit {

    private _appSheetState: AppSheetState;
    private _appSheetOpenObserver: IObserver1<IAppSheetOptions>;
    private _appSheetCloseObserver: IObserver1<IAppSheetOptions>;
    private _appSheetErrorObserver: IObserver2<string, IAppSheetOptions>;
    private _installButtonExperimentEnabled: boolean;

    constructor(parameters: IPerformanceAdUnitParameters) {
        super(parameters);

        this._installButtonExperimentEnabled = CustomFeatures.isRewardedVideoInstallButtonEnabled(parameters.campaign, parameters.coreConfig);

        if (this._installButtonExperimentEnabled) {
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
        if (this.canResumeVideo()) {
            this.setVideoState(VideoState.PLAYING);
            this._ads.VideoPlayer.play();
        }
    }

    private onAppSheetErrored(): void {
        this._appSheetState = AppSheetState.ERRORED;
        if (this.canResumeVideo()) {
            this.setVideoState(VideoState.PLAYING);
            this._ads.VideoPlayer.play();
        }
    }

    private canResumeVideo(): boolean {
        return this.isShowing() && this.canShowVideo() && this.canPlayVideo();
    }

    public isAppSheetOpen(): boolean {
        if (!this._installButtonExperimentEnabled) {
            return false;
        }

        return this._appSheetState === AppSheetState.OPENED;
    }

    public hide(): Promise<void> {
        this._ads.iOS!.AppSheet.onOpen.unsubscribe(this._appSheetOpenObserver);
        this._ads.iOS!.AppSheet.onClose.unsubscribe(this._appSheetCloseObserver);
        this._ads.iOS!.AppSheet.onError.unsubscribe(this._appSheetErrorObserver);

        return super.hide();
    }
}
