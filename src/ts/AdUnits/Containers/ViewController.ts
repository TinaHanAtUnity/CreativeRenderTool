import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { AdUnitContainer, AdUnitContainerSystemMessage, Orientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { UIInterfaceOrientation } from 'Constants/iOS/UIInterfaceOrientation';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';
import { FocusManager } from 'Managers/FocusManager';
import { IosDeviceInfo } from 'Models/IosDeviceInfo';
import { NativeBridge } from 'Native/NativeBridge';
import { Double } from 'Utilities/Double';

interface IIosOptions {
    supportedOrientations: UIInterfaceOrientationMask;
    supportedOrientationsPlist: UIInterfaceOrientationMask;
    shouldAutorotate: boolean;
    statusBarOrientation: number;
    statusBarHidden: boolean;
}

export class ViewController extends AdUnitContainer {

    private static _audioSessionInterrupt: string = 'AVAudioSessionInterruptionNotification';
    private static _audioSessionRouteChange: string = 'AVAudioSessionRouteChangeNotification';

    private _nativeBridge: NativeBridge;
    private _focusManager: FocusManager;
    private _deviceInfo: IosDeviceInfo;
    private _showing: boolean;
    private _options: IIosOptions;

    private _onAppBackgroundObserver: any;
    private _onAppForegroundObserver: any;

    constructor(nativeBridge: NativeBridge, deviceInfo: IosDeviceInfo, focusManager: FocusManager) {
        super();

        this._nativeBridge = nativeBridge;
        this._focusManager = focusManager;
        this._deviceInfo = deviceInfo;

        this._nativeBridge.IosAdUnit.onViewControllerDidDisappear.subscribe(() => this.onViewDidDisappear());
        this._nativeBridge.IosAdUnit.onViewControllerDidAppear.subscribe(() => this.onViewDidAppear());
        this._nativeBridge.IosAdUnit.onViewControllerDidReceiveMemoryWarning.subscribe(() => this.onMemoryWarning());
        this._nativeBridge.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
    }

    public open(adUnit: AbstractAdUnit, views: string[], allowRotation: boolean, forceOrientation: Orientation, disableBackbutton: boolean, isTransparent: boolean, withAnimation: boolean, allowStatusBar: boolean, options: IIosOptions): Promise<void> {
        this._options = options;
        this._showing = true;

        let nativeViews: string[] = views;
        if(nativeViews.length === 0) {
            nativeViews = ['webview'];
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

        this._nativeBridge.Sdk.logInfo('Opening ' + adUnit.description() + ' ad with orientation ' + Orientation[this._lockedOrientation]);

        let hideStatusBar = true;
        if(allowStatusBar) {
            hideStatusBar = options.statusBarHidden;
        }

        return this._nativeBridge.IosAdUnit.open(nativeViews, this.getOrientation(options, allowRotation, this._lockedOrientation), hideStatusBar, allowRotation, isTransparent, withAnimation);
    }

    public close(): Promise<void> {
        this._showing = false;
        this._focusManager.onAppBackground.unsubscribe(this._onAppBackgroundObserver);
        this._focusManager.onAppForeground.unsubscribe(this._onAppForegroundObserver);
        this._nativeBridge.Notification.removeAVNotificationObserver(ViewController._audioSessionInterrupt);
        this._nativeBridge.Notification.removeAVNotificationObserver(ViewController._audioSessionRouteChange);
        return this._nativeBridge.IosAdUnit.close();
    }

    public reconfigure(configuration: ViewConfiguration): Promise<any[]> {
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
                case ViewConfiguration.WEB_PLAYER:
                    promises.push(this._nativeBridge.IosAdUnit.setViews(['webplayer', 'webview']));
                    promises.push(this._nativeBridge.IosAdUnit.setSupportedOrientations(UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL));
                    break;
                default:
                    break;
            }
            return Promise.all(promises);
        });
    }

    public reorient(allowRotation: boolean, forceOrientation: Orientation): Promise<any> {
        return this._nativeBridge.IosAdUnit.setShouldAutorotate(allowRotation).then(() => {
            return this._nativeBridge.IosAdUnit.setSupportedOrientations(this.getOrientation(this._options, allowRotation, forceOrientation));
        });
    }

    public isPaused() {
        return this._paused;
    }

    public pause() {
        this._paused = true;
    }

    public unPause() {
        this._paused = false;
    }

    public setViewFrame(view: string, x: number, y: number, width: number, height: number): Promise<void> {
        return this._nativeBridge.IosAdUnit.setViewFrame(view, new Double(x), new Double(y), new Double(width), new Double(height));
    }

    public getViews(): Promise<string[]> {
        return this._nativeBridge.IosAdUnit.getViews();
    }

    private getOrientation(options: IIosOptions, allowRotation: boolean, forceOrientation: Orientation) {
        let orientation: UIInterfaceOrientationMask = options.supportedOrientations;
        if(forceOrientation === Orientation.LANDSCAPE) {
            switch (options.statusBarOrientation) {
                case UIInterfaceOrientation.LANDSCAPE_LEFT:
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT;
                    break;
                case UIInterfaceOrientation.LANDSCAPE_RIGHT:
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT;
                    break;
                default:
                    break;
            }
        } else if(forceOrientation === Orientation.PORTRAIT) {
            switch (options.statusBarOrientation) {
                case UIInterfaceOrientation.PORTRAIT:
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT;
                    break;
                case UIInterfaceOrientation.PORTRAIT_UPSIDE_DOWN:
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT_UPSIDE_DOWN;
                    break;
                default:
                    break;
            }
        }
        // safety check
        if((options.supportedOrientations & orientation) !== orientation) {
            orientation = options.supportedOrientations;
        }

        return orientation;
    }

    private onViewDidAppear(): void {
        this.onAppForeground();
        this._handlers.forEach(handler => handler.onContainerShow());
    }

    private onViewDidDisappear(): void {
        this._handlers.forEach(handler => handler.onContainerDestroy());
    }

    private onMemoryWarning(): void {
        this._handlers.forEach(handler => handler.onContainerSystemMessage(AdUnitContainerSystemMessage.MEMORY_WARNING));
    }

    private onAppBackground(): void {
        this._paused = true;
        this._handlers.forEach(handler => handler.onContainerBackground());
    }

    private onAppForeground(): void {
        this._paused = false;
        this._handlers.forEach(handler => handler.onContainerForeground());
    }

    private onNotification(event: string, parameters: any): void {
        // ignore notifications if ad unit is not active
        if(!this._showing) {
            return;
        }

        switch(event) {
            case ViewController._audioSessionInterrupt:
                const interruptData: { AVAudioSessionInterruptionTypeKey: number, AVAudioSessionInterruptionOptionKey: number } = parameters;

                if(interruptData.AVAudioSessionInterruptionTypeKey === 0) {
                    if(interruptData.AVAudioSessionInterruptionOptionKey === 1) {
                        this._handlers.forEach(handler => handler.onContainerSystemMessage(AdUnitContainerSystemMessage.AUDIO_SESSION_INTERRUPT_ENDED));
                    }
                } else if(interruptData.AVAudioSessionInterruptionTypeKey === 1) {
                    this._handlers.forEach(handler => handler.onContainerSystemMessage(AdUnitContainerSystemMessage.AUDIO_SESSION_INTERRUPT_BEGAN));
                }
                break;

            case ViewController._audioSessionRouteChange:
                const routeChangeData: { AVAudioSessionRouteChangeReasonKey: number } = parameters;
                if(routeChangeData.AVAudioSessionRouteChangeReasonKey !== 3) {
                    this._handlers.forEach(handler => handler.onContainerSystemMessage(AdUnitContainerSystemMessage.AUDIO_SESSION_ROUTE_CHANGED));
                } else {
                    this._handlers.forEach(handler => handler.onContainerSystemMessage(AdUnitContainerSystemMessage.AUDIO_SESSION_CATEGORY_CHANGED));
                }

                break;

            default:
                // ignore other events
                break;
        }
    }

}
