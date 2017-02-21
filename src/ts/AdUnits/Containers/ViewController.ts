import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { ViewConfiguration } from "AdUnits/Containers/AdUnitContainer";
import { Double } from 'Utilities/Double';

interface IIosOptions {
    supportedOrientations: UIInterfaceOrientationMask;
    supportedOrientationsPlist: UIInterfaceOrientationMask;
    shouldAutorotate: boolean;
    statusBarOrientation: number;
}

export class ViewController extends AdUnitContainer {

    private static _appWillResignActive: string = 'UIApplicationWillResignActiveNotification';
    private static _appDidBecomeActive: string = 'UIApplicationDidBecomeActiveNotification';
    private static _audioSessionInterrupt: string = 'AVAudioSessionInterruptionNotification';
    private static _audioSessionRouteChange: string = 'AVAudioSessionRouteChangeNotification';

    private _nativeBridge: NativeBridge;
    private _deviceInfo: DeviceInfo;
    private _showing: boolean;
    private _paused = false;

    private _onViewControllerDidAppearObserver: any;
    private _onNotificationObserver: any;

    constructor(nativeBridge: NativeBridge, deviceInfo: DeviceInfo) {
        super();

        this._nativeBridge = nativeBridge;
        this._deviceInfo = deviceInfo;

        this._onViewControllerDidAppearObserver = this._nativeBridge.IosAdUnit.onViewControllerDidAppear.subscribe(() => this.onViewDidAppear());
        this._onNotificationObserver = this._nativeBridge.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
    }

    public open(adUnit: AbstractAdUnit, videoplayer: boolean, allowOrientation: boolean, forceOrientation: ForceOrientation, disableBackbutton: boolean, options: IIosOptions): Promise<void> {
        this._showing = true;

        let views: string[] = ['webview'];
        if(videoplayer) {
            views = ['videoplayer', 'webview'];
        }

        let orientation: UIInterfaceOrientationMask = options.supportedOrientations;
        if(forceOrientation === ForceOrientation.LANDSCAPE) {
            if((options.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE;
            } else if((options.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT;
            } else if((options.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT;
            }
        } else if(forceOrientation === ForceOrientation.PORTRAIT) {
            if((options.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT;
            } else if((options.supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT_UPSIDE_DOWN) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT_UPSIDE_DOWN) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT_UPSIDE_DOWN;
            }
        }

        this._nativeBridge.Notification.addNotificationObserver(ViewController._appWillResignActive, []);
        this._nativeBridge.Notification.addAVNotificationObserver(ViewController._audioSessionInterrupt, ['AVAudioSessionInterruptionTypeKey', 'AVAudioSessionInterruptionOptionKey']);
        this._nativeBridge.Notification.addAVNotificationObserver(ViewController._audioSessionRouteChange, []);

        this._nativeBridge.Sdk.logInfo('Opening ' + adUnit.description() + ' ad with orientation ' + orientation);

        return this._nativeBridge.IosAdUnit.open(views, orientation, true, allowOrientation);
    }

    public close(): Promise<void> {
        this._showing = false;
        this._nativeBridge.Notification.removeNotificationObserver(ViewController._appWillResignActive);
        this._nativeBridge.Notification.removeAVNotificationObserver(ViewController._audioSessionInterrupt);
        this._nativeBridge.Notification.removeAVNotificationObserver(ViewController._audioSessionRouteChange);
        return this._nativeBridge.IosAdUnit.close();
    }

    public reconfigure(configuration: ViewConfiguration): Promise<any[]> {
        const promises: Promise<any>[] = [];
        const width = this._deviceInfo.getScreenWidth();
        const height = this._deviceInfo.getScreenHeight() + this._deviceInfo.getStatusBarHeight();

        switch (configuration) {
            case ViewConfiguration.ENDSCREEN:
                promises.push(this._nativeBridge.IosAdUnit.setViews(['webview']));
                promises.push(this._nativeBridge.IosAdUnit.setSupportedOrientations(UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL));
                break;

            case ViewConfiguration.SPLIT_VIDEO_ENDSCREEN:
                promises.push(this._nativeBridge.IosAdUnit.setTransform(new Double(0)));
                promises.push(this._nativeBridge.IosAdUnit.setViewFrame('adunit', new Double(0), new Double(0), new Double(width), new Double(height)));
                promises.push(this._nativeBridge.IosAdUnit.setViewFrame('videoplayer', new Double(0), new Double(0), new Double(width ), new Double(height / 2)));
                break;

            case ViewConfiguration.LANDSCAPE_VIDEO:
                promises.push(this._nativeBridge.IosAdUnit.setViewFrame('videoplayer', new Double(0), new Double(0), new Double(width), new Double(height)));
                promises.push(this._nativeBridge.IosAdUnit.setTransform(new Double(1.57079632679)));
                promises.push(this._nativeBridge.IosAdUnit.setViewFrame('adunit', new Double(0), new Double(0), new Double(width), new Double(height)));
                break;

            default:
                break;
        }
        return Promise.all(promises);
    }

    public isPaused() {
        return this._paused;
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
            case ViewController._appWillResignActive:
                this._paused = true;
                this.onSystemPause.trigger();
                break;

            case ViewController._appDidBecomeActive:
                this._paused = false;
                this.onSystemInterrupt.trigger();
                break;

            case ViewController._audioSessionInterrupt:
                const interruptData: { AVAudioSessionInterruptionTypeKey: number, AVAudioSessionInterruptionOptionKey: number } = parameters;

                if(interruptData.AVAudioSessionInterruptionTypeKey === 0) {
                    if(interruptData.AVAudioSessionInterruptionOptionKey === 1) {
                        this.onSystemInterrupt.trigger();
                    }
                }
                break;

            case ViewController._audioSessionRouteChange:
                this.onSystemInterrupt.trigger();
                break;

            default:
                // ignore other events
                break;
        }
    }

}
