import { AdUnit } from 'Utilities/AdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';

interface IIosOptions {
    supportedOrientations: UIInterfaceOrientationMask;
    supportedOrientationsPlist: UIInterfaceOrientationMask;
    shouldAutorotate: boolean;
    statusBarOrientation: number;
}

export class IosAdUnit extends AdUnit {
    private static _appDidBecomeActive: string = 'UIApplicationDidBecomeActiveNotification';
    private static _audioSessionInterrupt: string = 'AVAudioSessionInterruptionNotification';
    private static _audioSessionRouteChange: string = 'AVAudioSessionRouteChangeNotification';

    private _nativeBridge: NativeBridge;
    private _deviceInfo: DeviceInfo;
    private _showing: boolean;

    private _onViewControllerDidAppearObserver: any;
    private _onNotificationObserver: any;

    constructor(nativeBridge: NativeBridge, deviceInfo: DeviceInfo) {
        super();

        this._nativeBridge = nativeBridge;
        this._deviceInfo = deviceInfo;

        this._onViewControllerDidAppearObserver = this._nativeBridge.IosAdUnit.onViewControllerDidAppear.subscribe(() => this.onViewDidAppear());
        this._onNotificationObserver = this._nativeBridge.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
    }

    public open(description: string, videoplayer: boolean, forceLandscape: boolean, disableBackbutton: boolean, options: IIosOptions): Promise<void> {
        this._showing = true;

        let views: string[] = ['webview'];
        if(videoplayer) {
            views = ['videoplayer', 'webview'];
        }

        let orientation: UIInterfaceOrientationMask = options.supportedOrientations;
        if(forceLandscape) {
            if((options.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE;
            } else if((options.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT;
            } else if((options.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT;
            }
        }

        this._nativeBridge.Notification.addNotificationObserver(IosAdUnit._audioSessionInterrupt, ['AVAudioSessionInterruptionTypeKey', 'AVAudioSessionInterruptionOptionKey']);
        this._nativeBridge.Notification.addNotificationObserver(IosAdUnit._audioSessionRouteChange, []);

        this._nativeBridge.Sdk.logInfo('Opening ' + description + ' ad with orientation ' + orientation);

        return this._nativeBridge.IosAdUnit.open(views, orientation, true, true);
    }

    public close(): Promise<void> {
        this._showing = false;
        this._nativeBridge.Notification.removeNotificationObserver(IosAdUnit._audioSessionInterrupt);
        this._nativeBridge.Notification.removeNotificationObserver(IosAdUnit._audioSessionRouteChange);
        return this._nativeBridge.IosAdUnit.close();
    }

    public reconfigure(): Promise<any[]> {
        // currently hardcoded for moving from video playback to endscreen, will be enhanced in the future
        return Promise.all([
            this._nativeBridge.IosAdUnit.setViews(['webview']),
            this._nativeBridge.IosAdUnit.setSupportedOrientations(UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL)
        ]);
    }

    private onViewDidAppear(): void {
        this.onShow.trigger();
    }

    private onNotification(event: string, parameters: any): void {
        // ignore notifications if ad unit is not active
        if(!this._showing) {
            return;
        }

        switch(event) {
            case IosAdUnit._appDidBecomeActive:
                this.onSystemInterrupt.trigger();
                break;

            case IosAdUnit._audioSessionInterrupt:
                const interruptData: { AVAudioSessionInterruptionTypeKey: number, AVAudioSessionInterruptionOptionKey: number } = parameters;

                if(interruptData.AVAudioSessionInterruptionTypeKey === 0) {
                    if(interruptData.AVAudioSessionInterruptionOptionKey === 1) {
                        this.onSystemInterrupt.trigger();
                    }
                }
                break;

            case IosAdUnit._audioSessionRouteChange:
                this.onSystemInterrupt.trigger();
                break;

            default:
                // ignore other events
                break;
        }
    }
}
