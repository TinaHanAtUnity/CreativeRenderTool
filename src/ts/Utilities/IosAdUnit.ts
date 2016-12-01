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
    private _nativeBridge: NativeBridge;
    private _deviceInfo: DeviceInfo;

    private _fakeLandscape: boolean;

    constructor(nativeBridge: NativeBridge, deviceInfo: DeviceInfo) {
        super();

        this._nativeBridge = nativeBridge;
        this._deviceInfo = deviceInfo;
    }

    public open(videoplayer: boolean, forceLandscape: boolean, disableBackbutton: boolean, options: IIosOptions): Promise<void> {
        let views: string[] = ['webview'];
        if(videoplayer) {
            views = ['videoplayer','webview'];
        }

        this._fakeLandscape = false;
        let orientation: UIInterfaceOrientationMask = options.supportedOrientations;
        if(forceLandscape) {
            if((options.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE;
            } else if((options.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT;
            } else if((options.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT;
            } else {
                this._fakeLandscape = true;
            }
        }

        /* TODO: FIGURE THIS OUT
        this._onNotificationObserver = this._nativeBridge.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
        this._nativeBridge.Notification.addNotificationObserver(IosVideoAdUnitController._audioSessionInterrupt, ['AVAudioSessionInterruptionTypeKey', 'AVAudioSessionInterruptionOptionKey']);
        this._nativeBridge.Notification.addNotificationObserver(IosVideoAdUnitController._audioSessionRouteChange, []);
        */

        return this._nativeBridge.IosAdUnit.open(views, orientation, true, !this._fakeLandscape);
    }

    public close(): Promise<void> {
        return Promise.resolve();
    }
}