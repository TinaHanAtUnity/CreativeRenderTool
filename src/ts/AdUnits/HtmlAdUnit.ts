import { NativeBridge } from 'Native/NativeBridge';
import { ThirdParty } from 'Views/ThirdParty';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { Platform } from 'Constants/Platform';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { KeyCode } from 'Constants/Android/KeyCode';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';
import { FinishState } from 'Constants/FinishState';
import { AndroidAdUnitError } from 'Native/Api/AndroidAdUnit';
import { AndroidVideoAdUnitController } from 'AdUnits/AndroidVideoAdUnitController';
import { IObserver2 } from 'Utilities/IObserver';
import { SessionManager } from 'Managers/SessionManager';

export class HtmlAdUnit extends AbstractAdUnit {

    private _sessionManager: SessionManager;
    private _thirdParty: ThirdParty;
    private _isShowing: boolean;
    private _options: any;
    private _activityId: number;
    private _finishState: FinishState;

    private _onPauseObserver: IObserver2<boolean, number>;
    private _onDestroyObserver: IObserver2<boolean, number>;

    constructor(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: Campaign, thirdParty: ThirdParty, options: any) {
        super(nativeBridge, placement, campaign);
        this._sessionManager = sessionManager;
        this._thirdParty = thirdParty;
        this._isShowing = false;
        this._options = options;
        this._finishState = FinishState.COMPLETED;
    }

    public show(): Promise<void> {
        this._isShowing = true;
        this._thirdParty.show();
        this.onStart.trigger();
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._sessionManager.sendStart(this);
        const platform = this._nativeBridge.getPlatform();
        if(platform === Platform.ANDROID) {
            let orientation: ScreenOrientation = this._options.requestedOrientation;
            if(!this._placement.useDeviceOrientationForVideo()) {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
            }

            const keyEvents: KeyCode[] = [KeyCode.BACK];
            const hardwareAccel: boolean = true;

            this._nativeBridge.Sdk.logInfo('Opening game ad with orientation ' + orientation + ', hardware acceleration ' + (hardwareAccel ? 'enabled' : 'disabled'));

            this._onPauseObserver = this._nativeBridge.AndroidAdUnit.onPause.subscribe((finishing, activityId) => this.onPause(finishing, activityId));
            this._onDestroyObserver = this._nativeBridge.AndroidAdUnit.onDestroy.subscribe((finishing, activityId) => this.onDestroy(finishing, activityId));

            this._activityId = AndroidVideoAdUnitController.ActivityId++;
            return this._nativeBridge.AndroidAdUnit.open(this._activityId, ['webview'], orientation, keyEvents, SystemUiVisibility.LOW_PROFILE, hardwareAccel).then(() => {
                if(AbstractAdUnit.getAutoClose()) {
                    this.hide();
                }
            });
        } else if(platform === Platform.IOS) {
            let orientation: UIInterfaceOrientationMask = this._options.supportedOrientations;
            if(!this._placement.useDeviceOrientationForVideo()) {
                if((orientation & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) {
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE;
                } else if((orientation & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) {
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT;
                } else if((orientation & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) {
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT;
                }
            }

            this._nativeBridge.Sdk.logInfo('Opening game ad with orientation ' + orientation);

            return this._nativeBridge.IosAdUnit.open(['webview'], orientation, true, true).then(() => {
                if(AbstractAdUnit.getAutoClose()) {
                    this.hide();
                }
            });
        }

        return Promise.resolve(void(0));
    }

    public hide(): Promise<void> {
        this._isShowing = false;
        this._thirdParty.hide();

        this._sessionManager.sendThirdQuartile(this);
        this._sessionManager.sendView(this);

        this.onFinish.trigger();
        this.onClose.trigger();
        this._thirdParty.container().parentElement!.removeChild(this._thirdParty.container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this._finishState);

        const platform = this._nativeBridge.getPlatform();
        if(platform === Platform.ANDROID) {
            this._nativeBridge.AndroidAdUnit.onPause.unsubscribe(this._onPauseObserver);
            this._nativeBridge.AndroidAdUnit.onDestroy.unsubscribe(this._onDestroyObserver);

            return this._nativeBridge.AndroidAdUnit.close().catch(error => {
                // activity might be null here if we are coming from onDestroy observer so just cleanly ignore the error
                if(error !== AndroidAdUnitError[AndroidAdUnitError.ACTIVITY_NULL]) {
                    throw new Error(error);
                }
            });
        } else if(platform === Platform.IOS) {
            return this._nativeBridge.IosAdUnit.close();
        }

        return Promise.resolve(void(0));
    }

    public isShowing(): boolean {
        return this._isShowing;
    }

    private unsetReferences() {
        delete this._thirdParty;
    }

    private onPause(finishing: boolean, activityId: number): void {
        if(finishing && this._isShowing && activityId === this._activityId) {
            this._finishState = FinishState.SKIPPED;
            this.hide();
        }
    }

    private onDestroy(finishing: boolean, activityId: number): void {
        if(this._isShowing && finishing && activityId === this._activityId) {
            this._finishState = FinishState.SKIPPED;
            this.hide();
        }
    }

}
