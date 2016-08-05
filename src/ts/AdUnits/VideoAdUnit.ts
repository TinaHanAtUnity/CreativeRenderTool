import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { FinishState } from 'Constants/FinishState';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Double } from 'Utilities/Double';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';
import { KeyCode } from 'Constants/Android/KeyCode';

interface IAndroidOptions {
    requestedOrientation: ScreenOrientation;
}

interface IIosOptions {
    supportedOrientations: UIInterfaceOrientationMask;
    shouldAutorotate: boolean;
}

export class VideoAdUnit extends AbstractAdUnit {
    private static _appDidBecomeActive: string = 'UIApplicationDidBecomeActiveNotification';
    private static _audioSessionInterrupt: string = 'AVAudioSessionInterruptionNotification';
    private static _audioSessionRouteChange: string = 'AVAudioSessionRouteChangeNotification';

    private _overlay: Overlay;
    private _endScreen: EndScreen;
    private _videoDuration: number;
    private _videoPosition: number;
    private _videoQuartile: number;
    private _videoActive: boolean;
    private _watches: number;
    private _onResumeObserver: any;
    private _onPauseObserver: any;
    private _onDestroyObserver: any;
    private _onViewControllerDidAppearObserver: any;
    private _onNotificationObserver: any;
    private _onBackKeyObserver: any;

    private _androidOptions: IAndroidOptions;
    private _iosOptions: IIosOptions;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: Campaign, overlay: Overlay, endScreen: EndScreen) {
        super(nativeBridge, placement, campaign);

        if(nativeBridge.getPlatform() === Platform.IOS) {
            this._onViewControllerDidAppearObserver = this._nativeBridge.IosAdUnit.onViewControllerDidAppear.subscribe(() => this.onViewDidAppear());

        } else {
            this._onResumeObserver = this._nativeBridge.AndroidAdUnit.onResume.subscribe(() => this.onResume());
            this._onPauseObserver = this._nativeBridge.AndroidAdUnit.onPause.subscribe((finishing) => this.onPause(finishing));
            this._onDestroyObserver = this._nativeBridge.AndroidAdUnit.onDestroy.subscribe((finishing) => this.onDestroy(finishing));
        }

        this._videoPosition = 0;
        this._videoQuartile = 0;
        this._videoActive = true;
        this._watches = 0;

        this._overlay = overlay;
        this._endScreen = endScreen;
    }

    public show(): Promise<void> {
        this._showing = true;
        this.onStart.trigger();
        this.setVideoActive(true);

        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            let orientation: UIInterfaceOrientationMask = this._iosOptions.supportedOrientations;
            if(!this._placement.useDeviceOrientationForVideo() && (this._iosOptions.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE;
            }

            this._onNotificationObserver = this._nativeBridge.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
            this._nativeBridge.Notification.addNotificationObserver(VideoAdUnit._audioSessionInterrupt, ['AVAudioSessionInterruptionTypeKey', 'AVAudioSessionInterruptionOptionKey']);
            this._nativeBridge.Notification.addNotificationObserver(VideoAdUnit._audioSessionRouteChange, []);

            this._nativeBridge.Sdk.logInfo('Opening game ad with orientation ' + orientation);

            return this._nativeBridge.IosAdUnit.open(['videoplayer', 'webview'], orientation, true, true);
        } else {
            let orientation: ScreenOrientation = this._androidOptions.requestedOrientation;
            if (!this._placement.useDeviceOrientationForVideo()) {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
            }

            let keyEvents: any[] = [];
            if(this._placement.disableBackButton()) {
                keyEvents = [KeyCode.BACK];
                this._onBackKeyObserver = this._nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => this.onKeyEvent(keyCode));
            }

            let hardwareAccel: boolean = true;

            if(this._nativeBridge.getApiLevel() < 17) {
                hardwareAccel = false;
            }

            this._nativeBridge.Sdk.logInfo('Opening game ad with orientation ' + orientation + ', hardware acceleration ' + (hardwareAccel ? 'enabled' : 'disabled'));

            return this._nativeBridge.AndroidAdUnit.open(['videoplayer', 'webview'], orientation, keyEvents, SystemUiVisibility.LOW_PROFILE, hardwareAccel);
        }
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && !this.isVideoActive()) {
            this.hide();
        }
    }

    public hide(): Promise<void> {
        if(this.isVideoActive()) {
            this._nativeBridge.VideoPlayer.stop();
        }
        this.hideChildren();
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this.getPlacement().getId(), this.getFinishState());

        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            this._nativeBridge.IosAdUnit.onViewControllerDidAppear.unsubscribe(this._onViewControllerDidAppearObserver);
            this._nativeBridge.Notification.onNotification.unsubscribe(this._onNotificationObserver);
            this._nativeBridge.Notification.removeNotificationObserver(VideoAdUnit._audioSessionInterrupt);
            this._nativeBridge.Notification.removeNotificationObserver(VideoAdUnit._audioSessionRouteChange);

            return this._nativeBridge.IosAdUnit.close().then(() => {
                this._showing = false;
                this.onClose.trigger();
            });
        } else {
            this._nativeBridge.AndroidAdUnit.onResume.unsubscribe(this._onResumeObserver);
            this._nativeBridge.AndroidAdUnit.onPause.unsubscribe(this._onPauseObserver);
            this._nativeBridge.AndroidAdUnit.onDestroy.unsubscribe(this._onDestroyObserver);
            this._nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(this._onBackKeyObserver);

            return this._nativeBridge.AndroidAdUnit.close().then(() => {
                this._showing = false;
                this.onClose.trigger();
            });
        }
    }

    protected hideChildren() {
        this.getOverlay().container().parentElement.removeChild(this.getOverlay().container());
        this.getEndScreen().container().parentElement.removeChild(this.getEndScreen().container());
    };

    public setNativeOptions(options: any): void {
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            this._iosOptions = options;
        } else {
            this._androidOptions = options;
        }
    }

    public isShowing(): boolean {
        return this._showing;
    }

    public getWatches(): number {
        return this._watches;
    }

    public getVideoDuration(): number {
        return this._videoDuration;
    }

    public setVideoDuration(duration: number): void {
        this._videoDuration = duration;
    }

    public getVideoPosition(): number {
        return this._videoPosition;
    }

    public setVideoPosition(position: number): void {
        this._videoPosition = position;

        if(this._videoDuration) {
            this._videoQuartile = Math.floor((this._videoPosition * 4) / this._videoDuration);
        }
    }

    public getVideoQuartile(): number {
        return this._videoQuartile;
    }

    public isVideoActive(): boolean {
        return this._videoActive;
    }

    public setVideoActive(active: boolean): void {
        this._videoActive = active;
    }

    public setWatches(watches: number): void {
        this._watches = watches;
    }

    public getOverlay(): Overlay {
        return this._overlay;
    }

    public getEndScreen(): EndScreen {
        return this._endScreen;
    }

    public newWatch() {
        this._watches += 1;
    }

    public unsetReferences() {
        this._endScreen = null;
        this._overlay = null;
    }

    /*
     ANDROID ACTIVITY LIFECYCLE EVENTS
     */

    private onResume(): void {
        if(this._showing && this.isVideoActive()) {
            this._nativeBridge.VideoPlayer.prepare(this.getCampaign().getVideoUrl(), new Double(this.getPlacement().muteVideo() ? 0.0 : 1.0));
        }
    }

    private onPause(finishing: boolean): void {
        if(finishing && this._showing) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    private onDestroy(finishing: boolean): void {
        if(this._showing && finishing) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    /*
     IOS VIEWCONTROLLER EVENTS
     */

    private onViewDidAppear(): void {
        this.onResume();
    }

    private onNotification(event: string, parameters: any): void {
        switch(event) {
            case VideoAdUnit._appDidBecomeActive:
                if(this._showing && this.isVideoActive()) {
                    this._nativeBridge.Sdk.logInfo('Resuming Unity Ads video playback, app is active');
                    this._nativeBridge.VideoPlayer.play();
                }
                break;

            case VideoAdUnit._audioSessionInterrupt:
                let interruptData: { AVAudioSessionInterruptionTypeKey: number, AVAudioSessionInterruptionOptionKey: number } = parameters;

                if(interruptData.AVAudioSessionInterruptionTypeKey === 0) {
                    if(interruptData.AVAudioSessionInterruptionOptionKey === 1 && this._showing && this.isVideoActive()) {
                        this._nativeBridge.Sdk.logInfo('Resuming Unity Ads video playback after audio interrupt');
                        this._nativeBridge.VideoPlayer.play();
                    }
                }
                break;

            case VideoAdUnit._audioSessionRouteChange:
                if(this._showing && this.isVideoActive()) {
                    this._nativeBridge.Sdk.logInfo('Continuing Unity Ads video playback after audio session route change');
                    this._nativeBridge.VideoPlayer.play();
                }
                break;

            default:
                // ignore other events
                break;
        }
    }
}
