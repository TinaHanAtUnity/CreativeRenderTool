import { AdUnitContainer, AdUnitContainerSystemMessage, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { UIInterfaceOrientation } from 'Core/Constants/iOS/UIInterfaceOrientation';
import { UIInterfaceOrientationMask } from 'Core/Constants/iOS/UIInterfaceOrientationMask';
import { Double } from 'Core/Utilities/Double';
import { PausableListenerApi } from 'Ads/Native/PausableListener';
export class ViewController extends AdUnitContainer {
    constructor(core, ads, deviceInfo, focusManager, clientInfo) {
        super();
        this._core = core;
        this._ads = ads;
        this._focusManager = focusManager;
        this._deviceInfo = deviceInfo;
        this._clientInfo = clientInfo;
        this._onViewControllerDidDisappearObserver = this._ads.iOS.AdUnit.onViewControllerDidDisappear.subscribe(() => this.onViewDidDisappear());
        this._onViewControllerDidAppearObserver = this._ads.iOS.AdUnit.onViewControllerDidAppear.subscribe(() => this.onViewDidAppear());
        this._onMemoryWarningObserver = this._ads.iOS.AdUnit.onViewControllerDidReceiveMemoryWarning.subscribe(() => this.onMemoryWarning());
        this._onNotificationObserver = this._core.iOS.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
    }
    open(adUnit, views, allowRotation, forceOrientation, disableBackbutton, isTransparent, withAnimation, allowStatusBar, options) {
        this._options = options;
        this._showing = true;
        let nativeViews = views;
        if (nativeViews.length === 0) {
            nativeViews = ['webview'];
        }
        const forcedOrientation = AdUnitContainer.getForcedOrientation();
        if (forcedOrientation) {
            allowRotation = false;
            this._lockedOrientation = forcedOrientation;
        }
        else {
            this._lockedOrientation = forceOrientation;
        }
        this._onAppBackgroundObserver = this._focusManager.onAppBackground.subscribe(() => this.onAppBackground());
        this._onAppForegroundObserver = this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        this._core.iOS.Notification.addAVNotificationObserver(ViewController._audioSessionInterrupt, ['AVAudioSessionInterruptionTypeKey', 'AVAudioSessionInterruptionOptionKey']);
        this._core.iOS.Notification.addAVNotificationObserver(ViewController._audioSessionRouteChange, ['AVAudioSessionRouteChangeReasonKey']);
        this._core.Sdk.logInfo('Opening ' + adUnit.description() + ' ad with orientation ' + Orientation[this._lockedOrientation]);
        let hideStatusBar = true;
        if (allowStatusBar) {
            hideStatusBar = options.statusBarHidden;
        }
        return this._ads.iOS.AdUnit.open(nativeViews, this.getOrientation(options, allowRotation, this._lockedOrientation), hideStatusBar, allowRotation, isTransparent, withAnimation);
    }
    close() {
        this._showing = false;
        if (CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
            this.unPause();
        }
        this._focusManager.onAppBackground.unsubscribe(this._onAppBackgroundObserver);
        this._focusManager.onAppForeground.unsubscribe(this._onAppForegroundObserver);
        this._core.iOS.Notification.removeAVNotificationObserver(ViewController._audioSessionInterrupt);
        this._core.iOS.Notification.removeAVNotificationObserver(ViewController._audioSessionRouteChange);
        return this._ads.iOS.AdUnit.close();
    }
    reconfigure(configuration) {
        const promises = [];
        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight()
        ]).then(([screenWidth, screenHeight]) => {
            const width = screenWidth;
            const height = screenHeight + this._deviceInfo.getStatusBarHeight();
            switch (configuration) {
                case 0 /* ENDSCREEN */:
                    promises.push(this._ads.iOS.AdUnit.setViews(['webview']));
                    promises.push(this._ads.iOS.AdUnit.setSupportedOrientations(UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL));
                    break;
                case 1 /* LANDSCAPE_VIDEO */:
                    promises.push(this._ads.iOS.AdUnit.setViewFrame('videoplayer', new Double(0), new Double(0), new Double(width), new Double(height)));
                    promises.push(this._ads.iOS.AdUnit.setTransform(new Double(1.57079632679)));
                    promises.push(this._ads.iOS.AdUnit.setViewFrame('adunit', new Double(0), new Double(0), new Double(width), new Double(height)));
                    break;
                case 2 /* WEB_PLAYER */:
                    promises.push(this._ads.iOS.AdUnit.setViews(['webplayer', 'webview']));
                    promises.push(this._ads.iOS.AdUnit.setSupportedOrientations(UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL));
                    break;
                default:
            }
            return Promise.all(promises);
        });
    }
    reorient(allowRotation, forceOrientation) {
        return this._ads.iOS.AdUnit.setShouldAutorotate(allowRotation).then(() => {
            if (this._options) {
                return this._ads.iOS.AdUnit.setSupportedOrientations(this.getOrientation(this._options, allowRotation, forceOrientation));
            }
        });
    }
    isPaused() {
        return this._paused;
    }
    pause() {
        this._paused = true;
    }
    unPause() {
        this._paused = false;
    }
    setViewFrame(view, x, y, width, height) {
        return this._ads.iOS.AdUnit.setViewFrame(view, new Double(x), new Double(y), new Double(width), new Double(height));
    }
    getViews() {
        return this._ads.iOS.AdUnit.getViews();
    }
    getOrientation(options, allowRotation, forceOrientation) {
        let orientation = options.supportedOrientations;
        if (forceOrientation === Orientation.LANDSCAPE) {
            switch (options.statusBarOrientation) {
                case UIInterfaceOrientation.LANDSCAPE_LEFT:
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT;
                    break;
                case UIInterfaceOrientation.LANDSCAPE_RIGHT:
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT;
                    break;
                default:
            }
        }
        else if (forceOrientation === Orientation.PORTRAIT) {
            switch (options.statusBarOrientation) {
                case UIInterfaceOrientation.PORTRAIT:
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT;
                    break;
                case UIInterfaceOrientation.PORTRAIT_UPSIDE_DOWN:
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_PORTRAIT_UPSIDE_DOWN;
                    break;
                default:
            }
        }
        // safety check
        if (CustomFeatures.allowSupportedOrientationCheck(this._clientInfo.getGameId()) && (options.supportedOrientations & orientation) !== orientation) {
            orientation = options.supportedOrientations;
        }
        return orientation;
    }
    onViewDidAppear() {
        this._handlers.forEach(handler => handler.onContainerShow());
    }
    onViewDidDisappear() {
        this._handlers.forEach(handler => handler.onContainerDestroy());
        if (this._ads.Listener instanceof PausableListenerApi) {
            this._ads.Listener.resumeEvents();
        }
    }
    onMemoryWarning() {
        this._handlers.forEach(handler => handler.onContainerSystemMessage(AdUnitContainerSystemMessage.MEMORY_WARNING));
    }
    onAppBackground() {
        this._paused = true;
        this._handlers.forEach(handler => handler.onContainerBackground());
    }
    onAppForeground() {
        this._paused = false;
        this._handlers.forEach(handler => handler.onContainerForeground());
    }
    onNotification(event, parameters) {
        // ignore notifications if ad unit is not active
        if (!this._showing) {
            return;
        }
        switch (event) {
            case ViewController._audioSessionInterrupt:
                const interruptData = parameters;
                if (interruptData.AVAudioSessionInterruptionTypeKey === 0) {
                    if (interruptData.AVAudioSessionInterruptionOptionKey === 1) {
                        this._handlers.forEach(handler => handler.onContainerSystemMessage(AdUnitContainerSystemMessage.AUDIO_SESSION_INTERRUPT_ENDED));
                    }
                }
                else if (interruptData.AVAudioSessionInterruptionTypeKey === 1) {
                    this._handlers.forEach(handler => handler.onContainerSystemMessage(AdUnitContainerSystemMessage.AUDIO_SESSION_INTERRUPT_BEGAN));
                }
                break;
            case ViewController._audioSessionRouteChange:
                const routeChangeData = parameters;
                if (routeChangeData.AVAudioSessionRouteChangeReasonKey !== 3) {
                    this._handlers.forEach(handler => handler.onContainerSystemMessage(AdUnitContainerSystemMessage.AUDIO_SESSION_ROUTE_CHANGED));
                }
                else {
                    this._handlers.forEach(handler => handler.onContainerSystemMessage(AdUnitContainerSystemMessage.AUDIO_SESSION_CATEGORY_CHANGED));
                }
                break;
            default:
            // ignore other events
        }
    }
}
ViewController._audioSessionInterrupt = 'AVAudioSessionInterruptionNotification';
ViewController._audioSessionRouteChange = 'AVAudioSessionRouteChangeNotification';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlld0NvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL0FkVW5pdHMvQ29udGFpbmVycy9WaWV3Q29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQ0gsZUFBZSxFQUNmLDRCQUE0QixFQUM1QixXQUFXLEVBRWQsTUFBTSx3Q0FBd0MsQ0FBQztBQUVoRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDbkYsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFLM0YsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRS9DLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBVWxFLE1BQU0sT0FBTyxjQUFlLFNBQVEsZUFBZTtJQW9CL0MsWUFBWSxJQUFjLEVBQUUsR0FBWSxFQUFFLFVBQXlCLEVBQUUsWUFBMEIsRUFBRSxVQUFzQjtRQUNuSCxLQUFLLEVBQUUsQ0FBQztRQUVSLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBRTlCLElBQUksQ0FBQyxxQ0FBcUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUksQ0FBQyxNQUFNLENBQUMsNEJBQTRCLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7UUFDM0ksSUFBSSxDQUFDLGtDQUFrQyxHQUFH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