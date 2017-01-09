import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { AbstractVideoOverlay } from 'Views/AbstractVideoOverlay';
import { Double } from 'Utilities/Double';
import { NativeBridge } from 'Native/NativeBridge';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';
import { IosVideoPlayerEvent } from 'Native/Api/IosVideoPlayer';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { DeviceInfo } from 'Models/DeviceInfo';

interface IIosOptions {
    supportedOrientations: UIInterfaceOrientationMask;
    supportedOrientationsPlist: UIInterfaceOrientationMask;
    shouldAutorotate: boolean;
    statusBarOrientation: number;
}

export class IosVideoAdUnitController extends VideoAdUnitController {

    private static _appDidBecomeActive: string = 'UIApplicationDidBecomeActiveNotification';
    private static _audioSessionInterrupt: string = 'AVAudioSessionInterruptionNotification';
    private static _audioSessionRouteChange: string = 'AVAudioSessionRouteChangeNotification';

    private _onViewControllerDidAppearObserver: any;
    private _onNotificationObserver: any;

    private _deviceInfo: DeviceInfo;
    private _iosOptions: IIosOptions;

    constructor(nativeBridge: NativeBridge, deviceInfo: DeviceInfo, placement: Placement, campaign: Campaign, overlay: AbstractVideoOverlay, options: any) {
        super(nativeBridge, placement, campaign, overlay);

        this._deviceInfo = deviceInfo;
        this._iosOptions = options;
        this._onViewControllerDidAppearObserver = this._nativeBridge.IosAdUnit.onViewControllerDidAppear.subscribe(() => this.onViewDidAppear());
    }

    public show(): Promise<void> {
        this._showing = true;
        this.onVideoStart.trigger();
        this.setVideoActive(true);

        let orientation: UIInterfaceOrientationMask = this._iosOptions.supportedOrientations;
        if(!this._placement.useDeviceOrientationForVideo()) {
            if((this._iosOptions.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE;
            } else if((this._iosOptions.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT;
            } else if((this._iosOptions.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT;
            }
        }

        this._onNotificationObserver = this._nativeBridge.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
        this._nativeBridge.Notification.addNotificationObserver(IosVideoAdUnitController._audioSessionInterrupt, ['AVAudioSessionInterruptionTypeKey', 'AVAudioSessionInterruptionOptionKey']);
        this._nativeBridge.Notification.addNotificationObserver(IosVideoAdUnitController._audioSessionRouteChange, []);

        this._nativeBridge.Sdk.logInfo('Opening game ad with orientation ' + orientation + ', playing from ' + this.getVideoUrl());

        return this._nativeBridge.IosAdUnit.open(['videoplayer', 'webview'], orientation, true, true);
    }

    public hide(): Promise<void> {
        if(!this._showing) {
            return Promise.resolve();
        }
        this._showing = false;

        if(this.isVideoActive()) {
            this._nativeBridge.VideoPlayer.stop().catch(error => {
                if(error === IosVideoPlayerEvent[IosVideoPlayerEvent.VIDEOVIEW_NULL]) {
                    // sometimes system has already destroyed video view so just ignore this error
                } else {
                    throw new Error(error);
                }
            });
        }
        this.hideChildren();
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        this._nativeBridge.IosAdUnit.onViewControllerDidAppear.unsubscribe(this._onViewControllerDidAppearObserver);
        this._nativeBridge.Notification.onNotification.unsubscribe(this._onNotificationObserver);
        this._nativeBridge.Notification.removeNotificationObserver(IosVideoAdUnitController._audioSessionInterrupt);
        this._nativeBridge.Notification.removeNotificationObserver(IosVideoAdUnitController._audioSessionRouteChange);

        return this._nativeBridge.IosAdUnit.close().then(() => {
            this.onVideoClose.trigger();
        });
    }

    private onViewDidAppear(): void {
        if(this._showing && this.isVideoActive()) {
            this._nativeBridge.VideoPlayer.prepare(this.getVideoUrl(), new Double(this._placement.muteVideo() ? 0.0 : 1.0), 10000);
        }
    }

    private onNotification(event: string, parameters: any): void {
        switch(event) {
            case IosVideoAdUnitController._appDidBecomeActive:
                if(this._showing && this.isVideoActive()) {
                    this._nativeBridge.Sdk.logInfo('Resuming Unity Ads video playback, app is active');
                    this._nativeBridge.VideoPlayer.play();
                }
                break;

            case IosVideoAdUnitController._audioSessionInterrupt:
                const interruptData: { AVAudioSessionInterruptionTypeKey: number, AVAudioSessionInterruptionOptionKey: number } = parameters;

                if(interruptData.AVAudioSessionInterruptionTypeKey === 0) {
                    if(interruptData.AVAudioSessionInterruptionOptionKey === 1 && this._showing && this.isVideoActive()) {
                        this._nativeBridge.Sdk.logInfo('Resuming Unity Ads video playback after audio interrupt');
                        this._nativeBridge.VideoPlayer.play();
                    }
                }
                break;

            case IosVideoAdUnitController._audioSessionRouteChange:
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
