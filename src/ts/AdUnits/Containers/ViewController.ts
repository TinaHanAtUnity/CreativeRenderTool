import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { AdUnitContainer, ForceOrientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { Double } from 'Utilities/Double';
import { FocusManager } from 'Managers/FocusManager';

interface IIosOptions {
    supportedOrientations: UIInterfaceOrientationMask;
    supportedOrientationsPlist: UIInterfaceOrientationMask;
    shouldAutorotate: boolean;
    statusBarOrientation: number;
}

export class ViewController extends AdUnitContainer {

    private static _audioSessionInterrupt: string = 'AVAudioSessionInterruptionNotification';
    private static _audioSessionRouteChange: string = 'AVAudioSessionRouteChangeNotification';

    private _nativeBridge: NativeBridge;
    private _focusManager: FocusManager;
    private _deviceInfo: DeviceInfo;
    private _showing: boolean;
    private _paused = false;
    private _options: IIosOptions;

    private _onViewControllerDidAppearObserver: any;
    private _onMemoryWarningObserver: any;
    private _onNotificationObserver: any;
    private _onAppBackgroundObserver: any;
    private _onAppForegroundObserver: any;

    constructor(nativeBridge: NativeBridge, deviceInfo: DeviceInfo, focusManager: FocusManager) {
        super();

        this._nativeBridge = nativeBridge;
        this._focusManager = focusManager;
        this._deviceInfo = deviceInfo;

        this._onViewControllerDidAppearObserver = this._nativeBridge.IosAdUnit.onViewControllerDidAppear.subscribe(() => this.onViewDidAppear());
        this._onMemoryWarningObserver = this._nativeBridge.IosAdUnit.onViewControllerDidReceiveMemoryWarning.subscribe(() => this.onMemoryWarning());
        this._onNotificationObserver = this._nativeBridge.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
    }

    public open(adUnit: AbstractAdUnit, videoplayer: boolean, allowRotation: boolean, forceOrientation: ForceOrientation, disableBackbutton: boolean, options: IIosOptions): Promise<void> {
        this.resetDiagnosticsEvents();
        this.addDiagnosticsEvent({type: 'open'});
        this._options = options;
        this._showing = true;

        let views: string[] = ['webview'];
        if(videoplayer) {
            views = ['videoplayer', 'webview'];
        }

        const forcedOrientation = AdUnitContainer.getForcedOrientation();
        if (forcedOrientation) {
            allowRotation = false;
            this._lockedOrientation = forcedOrientation;
        } else {
            this._lockedOrientation = forceOrientation;
        }

        this._onAppBackgroundObserver = this._focusManager.onAppBackground.subscribe(() => this.onAppBackground());
        this._onAppForegroundObserver = this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        this._nativeBridge.Notification.addAVNotificationObserver(ViewController._audioSessionInterrupt, ['AVAudioSessionInterruptionTypeKey', 'AVAudioSessionInterruptionOptionKey']);
        this._nativeBridge.Notification.addAVNotificationObserver(ViewController._audioSessionRouteChange, ['AVAudioSessionRouteChangeReasonKey']);

        this._nativeBridge.Sdk.logInfo('Opening ' + adUnit.description() + ' ad with orientation ' + ForceOrientation[this._lockedOrientation]);

        return this._nativeBridge.IosAdUnit.open(views, this.getOrientation(options.supportedOrientations, allowRotation, this._lockedOrientation), true, allowRotation);
    }

    public close(): Promise<void> {
        this.addDiagnosticsEvent({type: 'close'});
        this._showing = false;
        this._focusManager.onAppBackground.unsubscribe(this._onAppBackgroundObserver);
        this._focusManager.onAppForeground.unsubscribe(this._onAppForegroundObserver);
        this._nativeBridge.Notification.removeAVNotificationObserver(ViewController._audioSessionInterrupt);
        this._nativeBridge.Notification.removeAVNotificationObserver(ViewController._audioSessionRouteChange);
        return this._nativeBridge.IosAdUnit.close();
    }

    public reconfigure(configuration: ViewConfiguration): Promise<any[]> {
        this.addDiagnosticsEvent({type: 'reconfigure'});
        const promises: Array<Promise<any>> = [];

        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight()
        ]).then(([screenWidth, screenHeight]) => {
            const width = screenWidth;
            const height = screenHeight + this._deviceInfo.getStatusBarHeight();

            switch(configuration) {
                case ViewConfiguration.ENDSCREEN:
                    promises.push(this._nativeBridge.IosAdUnit.setViews(['webview']));
                    promises.push(this._nativeBridge.IosAdUnit.setSupportedOrientations(UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL));
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
        });
    }

    public reorient(allowRotation: boolean, forceOrientation: ForceOrientation): Promise<any> {
        this.addDiagnosticsEvent({type: 'reorient'});
        return this._nativeBridge.IosAdUnit.setShouldAutorotate(allowRotation).then(() => {
            return this._nativeBridge.IosAdUnit.setSupportedOrientations(this.getOrientation(this._options.supportedOrientations, allowRotation, forceOrientation));
        });
    }

    public isPaused() {
        return this._paused;
    }

    private getOrientation(supportedOrientations: UIInterfaceOrientationMask, allowRotation: boolean, forceOrientation: ForceOrientation) {
        let orientation: UIInterfaceOrientationMask = supportedOrientations;
        if(forceOrientation === ForceOrientation.LANDSCAPE) {
            if((supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE;
            } else if((supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT;
            } else if((supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT;
            }
        } else if(forceOrientation === ForceOrientation.PORTRAIT) {
            if((supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT;
            } else if((supportedOrientations & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT_UPSIDE_DOWN) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT_UPSIDE_DOWN) {
                orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT_UPSIDE_DOWN;
            }
        }
        return orientation;
    }

    private onViewDidAppear(): void {
        this.addDiagnosticsEvent({type: 'viewDidAppear'});
        this.onShow.trigger();
    }

    private onMemoryWarning(): void {
        this.addDiagnosticsEvent({type: 'memoryWarning'});
        this.onLowMemoryWarning.trigger();
    }

    private onAppBackground(): void {
        this.addDiagnosticsEvent({type: 'appWillResignActive'});
        this._paused = true;
        this.onSystemInterrupt.trigger(true);
    }

    private onAppForeground(): void {
        this.addDiagnosticsEvent({type: 'appDidBecomeActive'});
        this._paused = false;
        this.onSystemInterrupt.trigger(false);
    }

    private onNotification(event: string, parameters: any): void {
        // ignore notifications if ad unit is not active
        if(!this._showing) {
            return;
        }

        switch(event) {
            case ViewController._audioSessionInterrupt:
                const interruptData: { AVAudioSessionInterruptionTypeKey: number, AVAudioSessionInterruptionOptionKey: number } = parameters;
                this.addDiagnosticsEvent({type: 'audioSessionInterrupt', typeKey: interruptData.AVAudioSessionInterruptionTypeKey, optionKey: interruptData.AVAudioSessionInterruptionOptionKey});

                if(interruptData.AVAudioSessionInterruptionTypeKey === 0) {
                    if(interruptData.AVAudioSessionInterruptionOptionKey === 1) {
                        this.onSystemInterrupt.trigger(false);
                    }
                } else if(interruptData.AVAudioSessionInterruptionTypeKey === 1) {
                    this.onSystemInterrupt.trigger(true);
                }
                break;

            case ViewController._audioSessionRouteChange:
                const routeChangeData: { AVAudioSessionRouteChangeReasonKey: number } = parameters;
                this.addDiagnosticsEvent({type: 'audioSessionRouteChange', reasonKey: routeChangeData.AVAudioSessionRouteChangeReasonKey});
                if(routeChangeData.AVAudioSessionRouteChangeReasonKey !== 3) {
                    this.onSystemInterrupt.trigger(false);
                }

                break;

            default:
                // ignore other events
                break;
        }
    }

}
